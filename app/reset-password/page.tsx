import { Suspense } from "react"
import { PublicThemeShell } from "@/components/public-theme-shell"
import { ResetPasswordForm } from "@/components/reset-password-form"

function ResetPasswordContent() {
  return <ResetPasswordForm />
}

export default function ResetPasswordPage() {
  return (
    <PublicThemeShell>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </PublicThemeShell>
  )
}
