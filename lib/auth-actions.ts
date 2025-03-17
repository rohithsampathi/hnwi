// lib/auth-actions.ts

"use server"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { redirect } from "next/navigation"

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

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
// Import from config to ensure consistency
import { API_BASE_URL } from "@/config/api"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 60 * 24, // 24 hours
}

async function createToken(user: Partial<User>): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as User
  } catch (err) {
    console.error("Token verification failed:", err)
    return null
  }
}

export async function getSession(): Promise<SessionResponse> {
  try {
    const session = cookies().get("session")
    
    if (!session?.value) {
      console.log("No session cookie found")
      return { user: null }
    }
    
    const user = await verifyToken(session.value)
    return { user }
  } catch (error) {
    console.error("Session retrieval error:", error)
    return { user: null, error: "Failed to get session" }
  }
}

export async function handleLogin(loginData: LoginData): Promise<AuthResponse> {
  try {
    if (!loginData.email || !loginData.password) {
      return { success: false, error: "Email and password are required" }
    }
    
    try {
      // Call the FastAPI backend login endpoint
      let loginEndpoint = `${API_BASE_URL}/api/login`;
      
      let response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });
      
      // Get the data as JSON directly
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        return { 
          success: false, 
          error: `Invalid response from server: ${response.status} ${response.statusText}`
        };
      }
      
      if (response.ok) {
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
        
        const token = data.token || await createToken(user)
        cookies().set("session", token, COOKIE_OPTIONS)
        
        return { 
          success: true, 
          user,
          token
        }
      } else {
        // Handle authentication failure
        let errorMessage = "Invalid credentials";
        if (data) {
          errorMessage = data.detail || data.message || data.error || errorMessage;
        } else {
          errorMessage = response.statusText || errorMessage;
        }
        
        return { 
          success: false, 
          error: errorMessage
        }
      }
    } catch (loginError) {
      return { success: false, error: "Login service unavailable" }
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
      
      // Attempt FastAPI user creation
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Extract user ID from the response
        const userId = data.user_id;
        
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
        cookies().set("session", token, COOKIE_OPTIONS)

        return { success: true, user, token }
      } else {
        let errorMessage = "Sign up failed with the backend";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        
        return { success: false, error: errorMessage }
      }
    } catch (backendError) {
      console.error("Backend signup failed:", backendError)
      return { success: false, error: "Sign up service unavailable" }
    }
  } catch (error) {
    return { success: false, error: "Sign up failed" }
  }
}

export async function handleOnboardingComplete(newUser: any): Promise<AuthResponse> {
  // Implementation for completing onboarding
  try {
    // Create a properly formatted user object 
    const user: User = {
      id: newUser.user_id || Math.random().toString(36).substr(2, 9),
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
    cookies().set("session", token, COOKIE_OPTIONS)
    return { success: true, user, token }
  } catch (error) {
    console.error("Onboarding failed:", error)
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
      // Get the actual user ID from localStorage if available
      let userId = currentUser.id || currentUser.user_id;
      if (typeof window !== "undefined") {
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
        updateData[key] === undefined && delete updateData[key]
      );

      // Attempt FastAPI backend update
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        // Get updated data from the backend
        const data = await response.json();
        
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
        cookies().set("session", token, COOKIE_OPTIONS)

        return { success: true, user: updatedUser, token }
      } else {
        let errorMessage = "Failed to update user on backend";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        
        return { success: false, error: errorMessage }
      }
    } catch (backendError) {
      console.error("Backend update failed:", backendError)
      return { success: false, error: "Update service unavailable" }
    }
  } catch (error) {
    console.error("User update failed:", error)
    return { success: false, error: "Update failed" }
  }
}

export async function handleLogout() {
  try {
    cookies().delete("session")
    redirect("/auth/login")
  } catch (error) {
    console.error("Logout error:", error)
    cookies().delete("session")
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
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
    const sessionToken = cookieStore.get('session_token')?.value;
    
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