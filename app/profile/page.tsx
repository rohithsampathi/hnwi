// app/profile/page.tsx

import type { Metadata } from "next"
import { ProfilePageWrapper } from "./profile-page-wrapper"

export const metadata: Metadata = {
  title: "Profile | Account Settings - HNWI Chronicles",
  description: "Manage your HNWI Chronicles account settings, preferences, and investment profile. Customize your wealth intelligence platform experience.",
  openGraph: {
    title: "Profile | Account Settings",
    description: "Manage your HNWI Chronicles account settings, preferences, and investment profile. Customize your wealth intelligence platform experience.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Profile | Account Settings",
    description: "Manage your HNWI Chronicles account settings, preferences, and investment profile. Customize your wealth intelligence platform experience.",
  },
}

export default function Page() {
  return <ProfilePageWrapper />
}