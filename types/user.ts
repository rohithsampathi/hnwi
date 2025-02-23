export interface User {
  user_id: string
  email: string
  name: string
  net_worth: number
  city: string
  country: string
  industries?: string[]
  company: string
  phone_number: string
  linkedin: string
  office_address: string
  crypto_investor: boolean
  land_investor: boolean
  bio: string
  subscribedDate?: string
}

