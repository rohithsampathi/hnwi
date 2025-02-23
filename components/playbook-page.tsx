// components/playbook-page.tsx

import { Heading2, Heading3, Paragraph } from "@/components/ui/typography"

const Report = ({ report }: { report: ReportData | null }) => {
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Heading2 className="text-3xl font-bold text-primary font-heading">Loading Report...</Heading2>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Heading2 className="text-3xl font-bold text-primary font-heading">
        {report?.metadata.title || "Loading Report..."}
      </Heading2>
      <Paragraph className="text-sm text-muted-foreground mt-2 leading-tight font-body">
        {report?.metadata.description}
      </Paragraph>

      <div className="mt-4">
        {/* Example of using Heading3 */}
        <Heading3 className="text-xl font-semibold text-secondary font-heading">Report Details</Heading3>
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

