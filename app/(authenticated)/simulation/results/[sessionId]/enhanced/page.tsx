export default function EnhancedSimulationResultsPage() {
  return (
    <main className="flex min-h-[40vh] items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="text-xl font-semibold">Enhanced results are not available in this local build</h1>
        <p className="text-sm text-muted-foreground">
          This placeholder keeps the simulation route tree compile-safe while the enhanced flow is inactive.
        </p>
      </div>
    </main>
  );
}
