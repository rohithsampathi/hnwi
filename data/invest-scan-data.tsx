export interface Opportunity {
  id: string
  title: string
  type: string
  value: string
  description: string
  fullAnalysis: string
  riskLevel: "Low" | "Medium" | "High"
  expectedReturn: string
  investmentHorizon: string
}

export interface Region {
  id: string
  name: string
  position: [number, number]
  opportunities: Opportunity[]
}

export const regions: Region[] = [
  {
    id: "na",
    name: "North America",
    position: [-100, 40],
    opportunities: [
      {
        id: "na1",
        title: "Premium Commercial Real Estate",
        type: "Real Estate",
        value: "$50M - $100M",
        description: "Class A office spaces in prime Manhattan locations with guaranteed tenant contracts.",
        fullAnalysis:
          "This opportunity presents a unique chance to invest in high-end commercial real estate in one of the world's most prestigious business districts. The portfolio includes several Class A office spaces in prime Manhattan locations, all with long-term, guaranteed tenant contracts from Fortune 500 companies. The properties have been consistently maintained and upgraded, ensuring their appeal to top-tier corporate clients. With the ongoing trend of businesses returning to office spaces post-pandemic, and Manhattan's enduring appeal as a global business hub, this investment promises stable, long-term returns with potential for appreciation as the real estate market continues to recover and grow.",
        riskLevel: "Low",
        expectedReturn: "8-12% annually",
        investmentHorizon: "10-15 years",
      },
      {
        id: "na2",
        title: "Tech Venture Fund",
        type: "Private Equity",
        value: "$25M - $50M",
        description: "Late-stage technology companies portfolio with proven track records.",
        fullAnalysis:
          "This Tech Venture Fund offers a carefully curated portfolio of late-stage technology companies, each with a proven track record of growth and market disruption. The fund focuses on companies in sectors such as AI, blockchain, and clean energy - areas poised for significant growth in the coming decades. Each company in the portfolio has demonstrated strong revenue growth, a clear path to profitability, and is either preparing for an IPO or positioned for acquisition by larger tech giants. The fund's management team comprises seasoned venture capitalists with multiple successful exits under their belts, ensuring expert guidance and strategic support for portfolio companies.",
        riskLevel: "Medium",
        expectedReturn: "20-30% IRR",
        investmentHorizon: "5-7 years",
      },
    ],
  },
  {
    id: "eu",
    name: "Europe",
    position: [10, 50],
    opportunities: [
      {
        id: "eu1",
        title: "Luxury Hotel Chain",
        type: "Hospitality",
        value: "$75M - $120M",
        description: "Portfolio of boutique luxury hotels across major European capitals.",
        fullAnalysis:
          "This investment opportunity comprises a collection of boutique luxury hotels strategically located in prime areas of major European capitals including Paris, London, Rome, and Barcelona. Each property in the portfolio has been carefully selected for its unique character, historical significance, and potential for high-end customization. The hotels cater to high-net-worth individuals and celebrities, offering unparalleled privacy, bespoke services, and exclusive experiences. With the luxury travel sector showing strong recovery and growth post-pandemic, and the increasing preference for unique, personalized travel experiences among the wealthy, this hotel chain is positioned for substantial growth and consistent high returns.",
        riskLevel: "Medium",
        expectedReturn: "15-20% annually",
        investmentHorizon: "7-10 years",
      },
    ],
  },
  {
    id: "ap",
    name: "Asia Pacific",
    position: [100, 20],
    opportunities: [
      {
        id: "ap1",
        title: "Singapore Data Centers",
        type: "Infrastructure",
        value: "$40M - $80M",
        description: "High-security data center facilities with long-term lease agreements.",
        fullAnalysis:
          "This opportunity involves investing in state-of-the-art, high-security data center facilities in Singapore, a key global hub for data storage and management. The investment covers multiple Tier IV data centers, the highest level of data center reliability and security. These facilities come with long-term lease agreements from major tech companies and financial institutions, ensuring a stable income stream. Singapore's strategic location, political stability, and supportive government policies for the tech sector make it an ideal location for data centers serving the rapidly growing Asian market. With the exponential growth in data usage and cloud computing, coupled with Singapore's limited land availability, these data centers are poised for significant appreciation in value over time.",
        riskLevel: "Low",
        expectedReturn: "10-15% annually",
        investmentHorizon: "15-20 years",
      },
    ],
  },
]

