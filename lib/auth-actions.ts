// lib/auth-actions.ts

"use server"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { redirect } from "next/navigation"
import { logger } from "./secure-logger"
import { SessionManager } from "./session-manager"
import { FastSecureAPI } from "@/lib/fast-secure-api"
import { RateLimiter } from "./rate-limiter"
import { headers } from "next/headers"

// User interface to match what LoginPage.tsx expects
interface User {
  id: string
  email: string
  firstName: string
  lastName?: string
  role?: string
  createdAt?: Date
  updatedAt?: Date
  // Additional fields to match direct API response
  user_id?: string
  profile?: any
  // Profile fields for compatibility
  net_worth?: number
  city?: string
  country?: string
  bio?: string
  industries?: string[]
  phone_number?: string
  linkedin?: string
  office_address?: string
  crypto_investor?: boolean
  land_investor?: boolean
  company?: string
  company_info?: any
}

interface LoginData {
  email: string
  password: string
}

interface AuthResponse {
  success: boolean
  user?: User
  error?: string
  token?: string
}

interface SessionResponse {
  user: User | null
  error?: string
}

function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  
  // Require JWT_SECRET in all environments for security
  if (!secret) {
    throw new Error("CRITICAL: JWT_SECRET environment variable must be set. Generate a secure 32+ character secret.");
  }
  
  // Validate minimum security requirements
  if (secret.length < 32) {
    throw new Error("SECURITY: JWT_SECRET must be at least 32 characters long for adequate security");
  }
  
  // Warn about weak secrets
  if (secret.includes("dev-jwt-secret") || secret.includes("change-in-production")) {
    throw new Error("SECURITY: Default JWT_SECRET detected. Must use a unique, cryptographically secure secret");
  }
  
  return new TextEncoder().encode(secret);
}
// Using secure API wrapper to prevent URL exposure

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 60 * 60 * 24, // 24 hours
}

// Cookie name helper with security prefixes
function getSecureCookieName(baseName: string): string {
  if (process.env.NODE_ENV === 'production') {
    // Use __Host- prefix for maximum security in production
    return `__Host-${baseName}`;
  } else {
    // Use __Secure- prefix for development
    return `__Secure-${baseName}`;
  }
}

async function createToken(user: Partial<User>): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJWTSecret())
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const verified = await jwtVerify(token, getJWTSecret())
    return verified.payload as User
  } catch (err) {
    logger.error("Token verification failed", { error: err instanceof Error ? err.message : String(err) })
    return null
  }
}

export async function getSession(): Promise<SessionResponse> {
  try {
    const currentUser = await SessionManager.getCurrentUser();
    
    if (!currentUser) {
      logger.debug("No valid session found");
      return { user: null };
    }

    // Convert to expected User format
    const user: User = {
      id: currentUser.id,
      email: currentUser.email,
      firstName: '', // Will be populated from display data
      lastName: '',
      role: currentUser.role
    };

    return { user };
  } catch (error) {
    logger.error("Session retrieval error", { error: error instanceof Error ? error.message : String(error) });
    return { user: null, error: "Failed to get session" };
  }
}

export async function handleLogin(loginData: LoginData): Promise<AuthResponse> {
  try {
    if (!loginData.email || !loginData.password) {
      return { success: false, error: "Email and password are required" }
    }

    // Create a mock request object for rate limiting
    const headersList = headers();
    const mockRequest = {
      headers: {
        get: (name: string) => headersList.get(name)
      },
      ip: headersList.get('x-forwarded-for') || 'unknown'
    } as any;

    // Check for active penalties first
    if (RateLimiter.hasPenalty(mockRequest)) {
      logger.warn('Login attempt blocked due to penalty', { 
        email: loginData.email,
        ip: RateLimiter.getClientIP(mockRequest).replace(/\d+\.\d+\.\d+\.\d+/, '***')
      });
      return { 
        success: false, 
        error: "Account temporarily restricted due to multiple failed attempts. Please try again in 15 minutes." 
      };
    }

    // Rate limit login attempts (IP-based)
    const loginRateLimit = await RateLimiter.checkLimit(mockRequest, 'LOGIN');
    if (!loginRateLimit.allowed) {
      const rateLimitError = RateLimiter.getRateLimitError('LOGIN', 
        Math.ceil((loginRateLimit.resetTime - Date.now()) / 1000));
      
      logger.warn('Login rate limit exceeded', {
        email: loginData.email,
        ip: RateLimiter.getClientIP(mockRequest).replace(/\d+\.\d+\.\d+\.\d+/, '***'),
        retryAfter: rateLimitError.retryAfter
      });
      
      return { success: false, error: rateLimitError.message };
    }

    // User-specific rate limiting for additional security
    const userRateLimit = await RateLimiter.checkUserLimit(mockRequest, loginData.email, 'USER_LOGIN');
    if (!userRateLimit.allowed) {
      logger.warn('User login rate limit exceeded', {
        email: loginData.email,
        attempts: userRateLimit.totalHits
      });
      
      return { success: false, error: userRateLimit.message || "Too many login attempts for this account." };
    }
    
    try {
      // Use fast secure API wrapper (login doesn't require auth)
      const data = await FastSecureAPI.post('/api/auth/login', loginData, false);
      
      // If we get here, the request was successful
      
      // Validate that we received a user_id from the backend
      if (!data.user_id) {
        logger.error("Login failed: No user_id provided from backend", { email: loginData.email });
        return { success: false, error: "Invalid response from server. Please try again." };
      }
      
      // Create a user object from the response data
      const firstName = data.first_name || "User";
      const lastName = data.last_name || "";
      
      // Extract purchased reports from user profile if available
      const purchasedReports = data.profile?.purchased_reports || [];
      
      // Create a user object compatible with both approaches
      const user: User = {
        id: data.user_id,
        email: data.email,
        firstName: firstName,
        lastName: lastName,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Fields from direct API call
        user_id: data.user_id,
        profile: {
          ...(data.profile || {}),
          purchased_reports: purchasedReports
        }
      }
      
      const token = data.access_token || data.token || await createToken(user)
      const sessionCookieName = getSecureCookieName("session");
      cookies().set(sessionCookieName, token, COOKIE_OPTIONS)
      
      return { 
        success: true, 
        user,
        token,
        // Include backend response fields for frontend compatibility
        user_id: data.user_id,
        email: data.email,
        first_name: firstName,
        last_name: lastName,
        profile: data.profile || {}
      }
    } catch (loginError) {
      // Handle specific 401 unauthorized error for incorrect credentials
      if (loginError instanceof Error && 
          (loginError.message?.includes('401') || 
           loginError.message?.includes('Unauthorized') || 
           loginError.message?.includes('Invalid credentials'))) {
        
        // Record login failure for progressive penalties
        await RateLimiter.recordViolation(mockRequest, 'LOGIN');
        
        return { success: false, error: "Incorrect password. Please retry or click forgot password." }
      }
      
      // For other authentication errors, also record as violation
      if (loginError instanceof Error && (
        loginError.message?.includes('Authentication') ||
        loginError.message?.includes('Invalid')
      )) {
        await RateLimiter.recordViolation(mockRequest, 'LOGIN');
      }
      
      // Secure API wrapper provides safe error messages for other errors
      const errorMessage = loginError instanceof Error ? loginError.message : "Authentication failed";
      return { success: false, error: errorMessage }
    }
  } catch (error) {
    return { success: false, error: "Login failed" }
  }
}

export async function handleSignUp(userData: Partial<User>): Promise<AuthResponse> {
  try {
    if (!userData.email || !userData.firstName) {
      return { success: false, error: "Email and first name are required" }
    }

    try {
      // Prepare data for FastAPI user creation
      const fullName = `${userData.firstName} ${userData.lastName || ''}`.trim();
      
      // Use fast secure API for user creation
      const data = await FastSecureAPI.post('/api/users/profile', {
        email: userData.email,
        name: fullName,
        password: userData.password || 'DefaultPassword1', // This should be provided in a real scenario
        // Include other required UserCreate fields with default values
        net_worth: userData.net_worth || 0,
        city: userData.city || "",
        country: userData.country || "",
        bio: userData.bio || "",
        industries: userData.industries || [],
        phone_number: userData.phone_number || "",
        office_address: userData.office_address || "",
        crypto_investor: userData.crypto_investor || false,
        land_investor: userData.land_investor || false,
        linkedin: userData.linkedin || null
      });

      // If we get here, the request was successful
        
        // Extract user ID from the response and validate
        const userId = data.user_id;
        if (!userId) {
          logger.error("Sign up failed: No user_id provided from backend", { email: userData.email });
          return { success: false, error: "Invalid response from server. Please try again." };
        }
        
        const user: User = {
          id: userId,
          user_id: userId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName || "",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          // Add profile data
          profile: {
            name: fullName,
            email: userData.email,
            net_worth: userData.net_worth || 0,
            city: userData.city || "",
            country: userData.country || "",
            bio: userData.bio || "",
            industries: userData.industries || [],
            phone_number: userData.phone_number || "",
            office_address: userData.office_address || "",
            crypto_investor: userData.crypto_investor || false,
            land_investor: userData.land_investor || false,
            linkedin: userData.linkedin || null
          }
        }

        const token = data.token || await createToken(user)
        const sessionCookieName = getSecureCookieName("session");
        cookies().set(sessionCookieName, token, COOKIE_OPTIONS)

        return { success: true, user, token }
    } catch (backendError) {
      // Secure API wrapper provides safe error messages
      const errorMessage = backendError instanceof Error ? backendError.message : "Sign up failed";
      return { success: false, error: errorMessage }
    }
  } catch (error) {
    return { success: false, error: "Sign up failed" }
  }
}

export async function handleOnboardingComplete(newUser: any): Promise<AuthResponse> {
  // Implementation for completing onboarding
  try {
    // Validate that we have a user_id from the backend
    if (!newUser.user_id) {
      logger.error("Onboarding failed: No user_id provided from backend", { email: newUser.email });
      return { success: false, error: "Invalid user data received. Please try again." };
    }

    // Create a properly formatted user object with backend-provided ID only
    const user: User = {
      id: newUser.user_id,
      user_id: newUser.user_id,
      email: newUser.email,
      firstName: newUser.firstName || newUser.name?.split(' ')[0] || "User",
      lastName: newUser.lastName || (newUser.name?.split(' ').slice(1).join(' ') || ""),
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: newUser.profile
    }

    const token = await createToken(user)
    const sessionCookieName = getSecureCookieName("session");
    cookies().set(sessionCookieName, token, COOKIE_OPTIONS)
    
    logger.info("Onboarding completed successfully", { 
      userId: user.id, 
      email: user.email 
    });
    
    return { success: true, user, token }
  } catch (error) {
    logger.error("Onboarding failed", { 
      error: error instanceof Error ? error.message : String(error),
      email: newUser?.email 
    });
    return { success: false, error: "Onboarding failed" }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getSession()
    return session.user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function handleUpdateUser(updatedUserData: Partial<User>): Promise<AuthResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, error: "Not authenticated" }
    }

    try {
      // Use the current user's backend-provided ID (never generate new ones)
      let userId = currentUser.user_id || currentUser.id;
      if (!userId) {
        logger.error("Update user failed: No valid user_id found", { email: currentUser.email });
        return { success: false, error: "Invalid user session. Please login again." };
      }
      
      // Only use stored userId as fallback if no ID in current user object
      if (typeof window !== "undefined" && !userId) {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
          userId = storedUserId;
        }
      }

      // Format the data for FastAPI user update endpoint
      const fullName = updatedUserData.firstName 
        ? `${updatedUserData.firstName} ${updatedUserData.lastName || ''}`.trim()
        : undefined;
      
      // Prepare the update data for FastAPI format
      const updateData = {
        name: fullName,
        net_worth: updatedUserData.net_worth,
        city: updatedUserData.city,
        country: updatedUserData.country,
        bio: updatedUserData.bio,
        industries: updatedUserData.industries,
        phone_number: updatedUserData.phone_number,
        linkedin: updatedUserData.linkedin,
        office_address: updatedUserData.office_address,
        crypto_investor: updatedUserData.crypto_investor,
        land_investor: updatedUserData.land_investor,
        // Include company_info if needed
        company_info: updatedUserData.company_info || {
          name: updatedUserData.company || undefined
        }
      };

      // Remove undefined fields to avoid overwriting with null
      Object.keys(updateData).forEach(key => 
        updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
      );

      // Use fast secure API for user update
      const data = await FastSecureAPI.put(`/api/users/${userId}`, updateData);
        
        // Create updated user object preserving the correct ID
        const updatedUser: User = {
          ...currentUser,
          ...updatedUserData,
          id: userId, // Preserve the user's real ID
          user_id: userId,
          updatedAt: new Date(),
          // Update profile data
          profile: {
            ...(currentUser.profile || {}),
            name: fullName || currentUser.profile?.name,
            net_worth: updatedUserData.net_worth || currentUser.profile?.net_worth,
            city: updatedUserData.city || currentUser.profile?.city,
            country: updatedUserData.country || currentUser.profile?.country,
            bio: updatedUserData.bio || currentUser.profile?.bio,
            industries: updatedUserData.industries || currentUser.profile?.industries,
            phone_number: updatedUserData.phone_number || currentUser.profile?.phone_number,
            linkedin: updatedUserData.linkedin || currentUser.profile?.linkedin,
            office_address: updatedUserData.office_address || currentUser.profile?.office_address,
            crypto_investor: updatedUserData.crypto_investor !== undefined ? 
              updatedUserData.crypto_investor : currentUser.profile?.crypto_investor,
            land_investor: updatedUserData.land_investor !== undefined ? 
              updatedUserData.land_investor : currentUser.profile?.land_investor
          }
        }

        const token = await createToken(updatedUser)
        const sessionCookieName = getSecureCookieName("session");
        cookies().set(sessionCookieName, token, COOKIE_OPTIONS)

        return { success: true, user: updatedUser, token }
    } catch (backendError) {
      // Secure API wrapper provides safe error messages
      const errorMessage = backendError instanceof Error ? backendError.message : "Update failed";
      return { success: false, error: errorMessage }
    }
  } catch (error) {
    return { success: false, error: "Update failed" }
  }
}

export async function handleLogout() {
  try {
    await SessionManager.destroySession();
    logger.info("User logged out successfully");
    redirect("/auth/login");
  } catch (error) {
    logger.error("Logout error", { error: error instanceof Error ? error.message : String(error) });
    await SessionManager.destroySession(); // Force cleanup
    redirect("/auth/login");
  }
}

export async function requireAuth() {
  try {
    await SessionManager.requireAuth();
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    logger.warn("Authentication required - redirecting to login");
    redirect("/auth/login");
  }
}

export async function handleSessionRequest(): Promise<SessionResponse> {
  try {
    // First try getting the session from cookies
    const sessionResponse = await getSession();
    
    if (sessionResponse.user) {
      return sessionResponse;
    }
    
    // If no session in cookies, check if we have a token in cookies from the session/route.ts
    const cookieStore = cookies();
    const legacySessionToken = cookieStore.get('session_token')?.value;
    const secureSessionToken = cookieStore.get(getSecureCookieName('session_token'))?.value;
    const sessionToken = secureSessionToken || legacySessionToken;
    
    if (sessionToken) {
      // Try to verify the token
      const user = await verifyToken(sessionToken);
      if (user) {
        return { user };
      }
    }
    
    // If no valid session found
    return { user: null };
  } catch (error) {
    console.error("Session request error:", error);
    return { user: null, error: "Failed to get session" };
  }
}

export async function handleForgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email) {
      return { success: false, error: "Email is required" }
    }

    try {
      // Call backend forgot password endpoint
      await FastSecureAPI.post('/api/auth/forgot-password', { email }, false)
      
      logger.info("Password reset request sent to backend", { email })
      return { success: true }

    } catch (apiError) {
      logger.error("Password reset API error", { 
        error: apiError instanceof Error ? apiError.message : String(apiError),
        email 
      })
      // Return success to avoid revealing if email exists (backend should handle this too)
      return { success: true }
    }

  } catch (error) {
    logger.error("Password reset error", { 
      error: error instanceof Error ? error.message : String(error),
      email 
    })
    return { success: false, error: "Failed to process password reset request" }
  }
}

export async function handleResetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!token || !newPassword) {
      return { success: false, error: "Token and new password are required" }
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" }
    }

    try {
      // Call backend reset password endpoint
      await FastSecureAPI.post('/api/auth/reset-password', { 
        token, 
        new_password: newPassword 
      }, false)

      logger.info("Password reset successful", { tokenPrefix: token.substring(0, 8) + "..." })
      return { success: true }

    } catch (apiError) {
      logger.error("Password reset API error", { 
        error: apiError instanceof Error ? apiError.message : String(apiError),
        token: token.substring(0, 8) + "..." 
      })
      
      // Handle specific error messages from backend
      const errorMessage = apiError instanceof Error ? apiError.message : "Invalid or expired reset token"
      if (errorMessage.includes('expired')) {
        return { success: false, error: "Reset token has expired" }
      } else if (errorMessage.includes('invalid')) {
        return { success: false, error: "Invalid reset token" }
      }
      
      return { success: false, error: "Invalid or expired reset token" }
    }

  } catch (error) {
    logger.error("Password reset error", { 
      error: error instanceof Error ? error.message : String(error)
    })
    return { success: false, error: "Failed to reset password" }
  }
}