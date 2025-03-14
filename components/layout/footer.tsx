// components/layout/footer.tsx

import { useTheme } from "@/contexts/theme-context"

export function Footer() {
  const { theme } = useTheme()

  return (
    <footer
      className={`w-full py-4 text-center text-sm ${
        theme === "dark" ? "bg-[#121212] text-[#E0E0E0]" : "bg-[#F5F5F5] text-[#424242]"
      } shadow-none`}
    >
      <div className="max-w-7xl mx-auto w-full px-4">
        <p>© 2025 All Rights Reserved. HNWI Chronicles.</p>
      </div>
    </footer>
  )
}

