// app/page.tsx
import dynamic from "next/dynamic"

const AppWrapper = dynamic(() => import("@/components/app-wrapper"), { 
  ssr: false,
  loading: () => null // Optional: Add a loading component here
})

export default function Home() {
  return <AppWrapper />
}