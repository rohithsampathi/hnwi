export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-[40vh] items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="text-xl font-semibold">Email verification is not available in this local build</h1>
        <p className="text-sm text-muted-foreground">
          Use the production authentication flow for live verification links.
        </p>
      </div>
    </main>
  );
}
