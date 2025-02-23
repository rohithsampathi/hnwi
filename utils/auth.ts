// utils/auth.ts

type User = {
  email: string
  name: string
}

const MOCK_USER = {
  email: "rohith@bhai.ai",
  password: "rohith@bhai.ai",
  name: "Rohith",
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (email === MOCK_USER.email && password === MOCK_USER.password) {
    return {
      email: MOCK_USER.email,
      name: MOCK_USER.name,
    }
  }

  return null
}

