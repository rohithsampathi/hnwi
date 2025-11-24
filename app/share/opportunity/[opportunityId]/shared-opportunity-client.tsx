// BARE MINIMUM CLIENT COMPONENT FOR TESTING

"use client"

interface SharedOpportunityClientProps {
  opportunityString: string
  opportunityId: string
}

export default function SharedOpportunityClient({ opportunityString, opportunityId }: SharedOpportunityClientProps) {
  const opportunity = JSON.parse(opportunityString)

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>
        HNWI Chronicles - Share Test
      </h1>
      <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>{opportunity.title}</h2>
        <p style={{ fontSize: '14px', color: '#666' }}>{opportunity.description}</p>
      </div>
    </div>
  )
}
