// components/playbook-page.tsx

import { Heading2, Heading3, Paragraph } from "@/components/ui/typography"

const Report = ({ report }: { report: ReportData | null }) => {
  if (!report) {
    return null // Let the existing loader handle the loading state
  }

  return (
    <div className="p-4 rounded-3xl bg-gray-800 shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
      <h3 className="text-lg font-semibold text-primary">
        {report.metadata.title}
      </h3>
      <Paragraph className="text-sm text-muted-foreground mt-2 leading-tight font-body">
        {report?.metadata.description}
      </Paragraph>

      <div className="mt-4">
        {/* Example of using consistent heading */}
        <h4 className="text-base font-semibold text-secondary">Report Details</h4>
        {/* Rest of the report details using Paragraph component */}
        <Paragraph className="text-sm text-muted-foreground mt-2 leading-tight font-body">
          This section contains detailed information about the report. You can add more details here using the Paragraph
          component. For example, you could add information about the report's author, creation date, or any other
          relevant metadata.
        </Paragraph>
        <Paragraph className="text-sm text-muted-foreground mt-2 leading-tight font-body">
          More details can be added here as needed. Remember to use the Paragraph component for consistency.
        </Paragraph>
      </div>
    </div>
  )
}

export default Report

interface ReportData {
  metadata: {
    title: string
    description: string
  }
}

