// contexts/app-state-context.tsx - World-Class Centralized State Management for HNWI Chronicles

"use client"

import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from "react"
import DeviceTrustManager from "@/lib/device-trust"
import { SessionState, getSessionState } from "@/lib/auth-utils"
import { getCurrentUser, getCurrentUserId, updateUser as updateAuthUser, logoutUser } from "@/lib/auth-manager"

// ================== TYPES ==================

interface User {
  id: string
  email: string
  firstName: string
  lastName?: string
  role?: string
  createdAt?: Date
  updatedAt?: Date
  user_id?: string
  _id?: string
  profile?: any
  name?: string
  net_worth?: number
  city?: string
  country?: string
  bio?: string
  industries?: string[]
  company?: string
  phone_number?: string
  linkedin?: string
  office_address?: string
  crypto_investor?: boolean
  land_investor?: boolean
}

interface NavigationState {
  currentPage: string
  previousPage: string | null
  history: string[]
  params: Record<string, any>
  isTransitioning: boolean
  preloadedPages: Set<string>
}

interface AuthenticationState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionState: SessionState
  deviceTrusted: boolean
  lastAuthCheck: number
  hasInitialized: boolean
}

interface AppState {
  navigation: NavigationState
  auth: AuthenticationState
  ui: {
    isInitialized: boolean
    showLoading: boolean
    theme: string
  }
}

// ================== ACTIONS ==================

type AppAction = 
  | { type: 'NAVIGATE'; payload: { page: string; params?: Record<string, any>; skipHistory?: boolean } }
  | { type: 'GO_BACK' }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean; page?: string } }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH_STATE'; payload: Partial<AuthenticationState> }
  | { type: 'PRELOAD_PAGE'; payload: string }
  | { type: 'INITIALIZE_APP'; payload: { user?: User | null; currentPage?: string } }
  | { type: 'UPDATE_SESSION_STATE'; payload: SessionState }
  | { type: 'TRUST_DEVICE'; payload: boolean }

// ================== REDUCER ==================

const initialState: AppState = {
  navigation: {
    currentPage: '',
    previousPage: null,
    history: [],
    params: {},
    isTransitioning: false,
    preloadedPages: new Set()
  },
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    sessionState: SessionState.EXPIRED,
    deviceTrusted: false,
    lastAuthCheck: 0,
    hasInitialized: false
  },
  ui: {
    isInitialized: false,
    showLoading: true,
    theme: 'dark'
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INITIALIZE_APP':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload.user || null,
          isAuthenticated: !!action.payload.user,
          hasInitialized: true
        },
        navigation: {
          ...state.navigation,
          currentPage: action.payload.currentPage || 'splash'
        },
        ui: {
          ...state.ui,
          isInitialized: true,
          showLoading: false
        }
      }

    case 'NAVIGATE': {
      const { page, params = {}, skipHistory = false } = action.payload
      const newHistory = skipHistory 
        ? state.navigation.history 
        : [...state.navigation.history, state.navigation.currentPage].filter(Boolean)
      
      return {
        ...state,
        navigation: {
          ...state.navigation,
          previousPage: state.navigation.currentPage,
          currentPage: page,
          history: newHistory,
          params,
          isTransitioning: true
        }
      }
    }

    case 'GO_BACK': {
      const history = [...state.navigation.history]
      const previousPage = history.pop() || 'dashboard'
      
      return {
        ...state,
        navigation: {
          ...state.navigation,
          previousPage: state.navigation.currentPage,
          currentPage: previousPage,
          history,
          isTransitioning: true,
          params: {} // Clear params on back navigation
        }
      }
    }

    case 'SET_LOADING':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          isTransitioning: action.payload.isLoading
        },
        auth: {
          ...state.auth,
          isLoading: action.payload.page ? false : action.payload.isLoading
        }
      }

    case 'SET_USER':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload,
          isAuthenticated: !!action.payload,
          isLoading: false,
          lastAuthCheck: Date.now()
        }
      }

    case 'SET_AUTH_STATE':
      return {
        ...state,
        auth: {
          ...state.auth,
          ...action.payload,
          lastAuthCheck: Date.now()
        }
      }

    case 'PRELOAD_PAGE':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          preloadedPages: new Set([...state.navigation.preloadedPages, action.payload])
        }
      }

    case 'UPDATE_SESSION_STATE':
      return {
        ...state,
        auth: {
          ...state.auth,
          sessionState: action.payload,
          isAuthenticated: action.payload === SessionState.AUTHENTICATED
        }
      }

    case 'TRUST_DEVICE':
      return {
        ...state,
        auth: {
          ...state.auth,
          deviceTrusted: action.payload
        }
      }

    default:
      return state
  }
}

// ================== CONTEXT ==================

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  
  // Navigation methods
  navigate: (page: string, params?: Record<string, any>) => void
  goBack: () => void
  preloadPage: (page: string) => void
  
  // Auth methods
  setUser: (user: User | null) => void
  updateAuthState: (authState: Partial<AuthenticationState>) => void
  trustDevice: () => void
  
  // Utilities  
  isPagePreloaded: (page: string) => boolean
  canNavigateBack: boolean
  getPageWithParams: (page: string) => { page: string; params: Record<string, any> }
}

const AppStateContext = createContext<AppContextValue | null>(null)

// ================== PROVIDER ==================

interface AppStateProviderProps {
  children: React.ReactNode
  initialPage?: string
}

export function AppStateProvider({ children, initialPage }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize app state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Determine initial page from multiple sources
        let targetPage = initialPage
        
        if (!targetPage) {
          // Check URL path
          const path = window.location.pathname
          if (path.includes('/invest-scan')) targetPage = 'invest-scan'
          else if (path.includes('/prive-exchange')) targetPage = 'prive-exchange'
          else if (path.includes('/opportunity')) {
            targetPage = 'opportunity'
            const opportunityId = path.split('/').pop()
            if (opportunityId) {
              sessionStorage.setItem('currentOpportunityId', opportunityId)
            }
          }
          else if (path.includes('/calendar-page')) targetPage = 'calendar-page'
          else if (path.includes('/crown-vault')) targetPage = 'crown-vault'
          else if (path.includes('/profile')) targetPage = 'profile'
        }

        // Check persisted session using centralized auth
        const authUser = getCurrentUser()
        const storedUserId = authUser?.userId || authUser?.user_id || authUser?.id || getCurrentUserId()
        // With cookie-based auth, we don't check tokens

        let user: User | null = authUser

        if (storedUserId && authUser) {
          try {
            user = authUser
            
            // Update device trust status
            const deviceTrusted = DeviceTrustManager.isDeviceTrusted(storedUserId)
            dispatch({ type: 'TRUST_DEVICE', payload: deviceTrusted })
            
            // If user is authenticated, default to dashboard if no specific page
            if (!targetPage) {
              targetPage = sessionStorage.getItem('currentPage') || 'dashboard'
            }
          } catch (e) {
            // Invalid stored user data
            // Auth manager will handle cleanup
            logoutUser()
          }
        }
        
        if (!targetPage) {
          targetPage = user ? 'dashboard' : 'splash'
        }

        dispatch({
          type: 'INITIALIZE_APP',
          payload: { user, currentPage: targetPage }
        })

        // Background session validation
        if (user) {
          setTimeout(() => validateSessionInBackground(user), 1000)
        }

      } catch (error) {
        dispatch({
          type: 'INITIALIZE_APP',
          payload: { currentPage: 'splash' }
        })
      }
    }

    initializeApp()
  }, [initialPage])

  // Background session validation
  const validateSessionInBackground = useCallback(async (currentUser: User) => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (!data.user) {
        // Session expired - use centralized logout
        dispatch({ type: 'SET_USER', payload: null })
        logoutUser()
        sessionStorage.removeItem("userDisplay")
      }
    } catch (error) {
    }
  }, [])

  // Navigation methods
  const navigate = useCallback((page: string, params: Record<string, any> = {}) => {
    // Handle special routes
    if (page.startsWith("opportunity/")) {
      const opportunityId = page.split("/")[1]
      sessionStorage.setItem("currentOpportunityId", opportunityId)
      dispatch({ type: 'NAVIGATE', payload: { page: 'opportunity', params: { opportunityId } } })
      return
    }
    
    if (page.startsWith("playbook/")) {
      const playbookId = page.split("/")[1]
      dispatch({ type: 'NAVIGATE', payload: { page: 'playbook', params: { playbookId } } })
      return  
    }
    
    // Store page in sessionStorage for refresh persistence
    if (page !== 'splash' && page !== 'login') {
      sessionStorage.setItem("currentPage", page)
    }
    
    dispatch({ type: 'NAVIGATE', payload: { page, params } })
    
    // Complete transition after a short delay
    setTimeout(() => {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } })
    }, 100)
  }, [])

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' })
    
    // Complete transition after a short delay
    setTimeout(() => {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } })  
    }, 100)
  }, [])

  const preloadPage = useCallback((page: string) => {
    dispatch({ type: 'PRELOAD_PAGE', payload: page })
  }, [])

  // Auth methods
  const setUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user })
    
    if (user) {
      // Store user data using centralized auth
      updateAuthUser(user)
      
      // Update device trust
      const deviceTrusted = DeviceTrustManager.isDeviceTrusted(user.user_id || user.id)
      dispatch({ type: 'TRUST_DEVICE', payload: deviceTrusted })
      
      // Navigate to dashboard if on splash/login
      if (state.navigation.currentPage === 'splash' || state.navigation.currentPage === 'login') {
        navigate('dashboard')
      }
    } else {
      // Clear user data
      localStorage.removeItem("userId")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userObject")
      sessionStorage.removeItem("userDisplay")
      
      // Navigate to splash
      navigate('splash')
    }
  }, [navigate, state.navigation.currentPage])

  const updateAuthState = useCallback((authState: Partial<AuthenticationState>) => {
    dispatch({ type: 'SET_AUTH_STATE', payload: authState })
  }, [])

  const trustDevice = useCallback(() => {
    const userId = getCurrentUserId()
    if (userId) {
      const success = DeviceTrustManager.trustDevice(userId)
      dispatch({ type: 'TRUST_DEVICE', payload: success })
    }
  }, [])

  // Utilities
  const isPagePreloaded = useCallback((page: string) => {
    return state.navigation.preloadedPages.has(page)
  }, [state.navigation.preloadedPages])

  const canNavigateBack = useMemo(() => {
    return state.navigation.history.length > 0
  }, [state.navigation.history])

  const getPageWithParams = useCallback((page: string) => {
    return {
      page: state.navigation.currentPage === page ? state.navigation.currentPage : page,
      params: state.navigation.currentPage === page ? state.navigation.params : {}
    }
  }, [state.navigation.currentPage, state.navigation.params])

  const contextValue: AppContextValue = {
    state,
    dispatch,
    navigate,
    goBack,
    preloadPage,
    setUser,
    updateAuthState,
    trustDevice,
    isPagePreloaded,
    canNavigateBack,
    getPageWithParams
  }

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  )
}

// ================== HOOK ==================

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}

// ================== DERIVED HOOKS ==================

export function useNavigation() {
  const { state, navigate, goBack, preloadPage } = useAppState()
  return {
    currentPage: state.navigation.currentPage,
    previousPage: state.navigation.previousPage,
    params: state.navigation.params,
    history: state.navigation.history,
    isTransitioning: state.navigation.isTransitioning,
    navigate,
    goBack,
    preloadPage,
    canGoBack: state.navigation.history.length > 0
  }
}

export function useAuth() {
  const { state, setUser, updateAuthState, trustDevice } = useAppState()
  return {
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
    sessionState: state.auth.sessionState,
    deviceTrusted: state.auth.deviceTrusted,
    hasInitialized: state.auth.hasInitialized,
    setUser,
    updateAuthState,
    trustDevice
  }
}

export function useAppInitialization() {
  const { state } = useAppState()
  return {
    isInitialized: state.ui.isInitialized,
    showLoading: state.ui.showLoading || state.auth.isLoading
  }
}

export default AppStateProvider