const baseConfig = require("./tailwind.config")

module.exports = {
  ...baseConfig,
  content: [
    "./app/page.tsx",
    "./app/auth/**/*.{ts,tsx}",
    "./components/public-auth-shell.tsx",
    "./components/public-theme-shell.tsx",
    "./components/home-page-client-enhancements.tsx",
    "./components/home-redirect-controller.tsx",
    "./components/splash-landing.tsx",
    "./components/splash-landing-ambient.tsx",
    "./components/splash-screen.tsx",
    "./components/splash-screen-security.tsx",
    "./components/particles-background.tsx",
    "./components/forgot-password-form.tsx",
    "./components/mfa-code-input.tsx",
    "./components/onboarding-page.tsx",
    "./components/onboarding-wizard.tsx",
    "./components/reset-password-form.tsx",
    "./components/theme-toggle.tsx",
    "./components/ui/**/*.{ts,tsx}",
  ],
}
