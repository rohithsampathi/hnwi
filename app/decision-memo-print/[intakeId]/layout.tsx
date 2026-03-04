/**
 * Print page layout — provides context providers needed by memo components
 * without the full authenticated layout shell (sidebar, nav, etc.)
 */

import { CitationPanelProvider } from "@/contexts/elite-citation-panel-context";

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CitationPanelProvider>
      {children}
    </CitationPanelProvider>
  );
}
