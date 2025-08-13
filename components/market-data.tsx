"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart2 } from "lucide-react"
import { Heading2, Heading3, Paragraph } from "@/components/ui/typography"
import { LiveButton } from "./live-button"
import { CitySpecificData } from "./city-specific-data"
import type React from "react" // Added import for React

const cityData = {
  MMR: {
    marketData: [
      {
        microMarket: "South",
        q42023: 75248,
        q32024: 76000,
        q42024: 76000,
        qoqChange: 0,
        yoyChange: 1,
        outlook: "Flat",
      },
      {
        microMarket: "South Central",
        q42023: 56250,
        q32024: 57353,
        q42024: 58500,
        qoqChange: 2,
        yoyChange: 4,
        outlook: "Flat",
      },
      {
        microMarket: "Eastern Suburbs",
        q42023: 42381,
        q32024: 43627,
        q42024: 44500,
        qoqChange: 2,
        yoyChange: 5,
        outlook: "Flat",
      },
      {
        microMarket: "Western Suburbs",
        q42023: 48558,
        q32024: 50500,
        q42024: 50500,
        qoqChange: 0,
        yoyChange: 4,
        outlook: "Flat",
      },
    ],
    segmentData: {
      q42024: 17663,
      midSegment: 72,
      highSegment: 25,
      affordableSegment: 3,
      yoyGrowth: 6,
    },
    propertyData: [
      {
        property: "Runwal 7",
        location: "Mahalaxmi",
        developer: "Runwal Group",
        units: 271,
        size: "728-1653",
        status: "Launched",
      },
      {
        property: "Ruparel Urbana",
        location: "Kurla",
        developer: "Ruparel Realty",
        units: 340,
        size: "390-765",
        status: "Launched",
      },
      {
        property: "Oberoi Garden City Phase 1",
        location: "Thane",
        developer: "Oberoi Realty",
        units: 906,
        size: "1411-2190",
        status: "Launched",
      },
      {
        property: "Lodha Vista",
        location: "Lower Parel",
        developer: "Lodha Group",
        units: 135,
        size: "646",
        status: "Completed",
      },
      {
        property: "Priramal Vaikunth - Vijit",
        location: "Thane",
        developer: "Piramal Realty",
        units: 273,
        size: "643",
        status: "Completed",
      },
    ],
  },
  "Delhi NCR": {
    marketData: [
      {
        microMarket: "South-West",
        q42023: 52830,
        q32024: 54902,
        q42024: 56000,
        qoqChange: 2,
        yoyChange: 6,
        outlook: "Flat",
      },
      {
        microMarket: "South-East",
        q42023: 38991,
        q32024: 40865,
        q42024: 42500,
        qoqChange: 4,
        yoyChange: 9,
        outlook: "Flat",
      },
      {
        microMarket: "South-Central",
        q42023: 51147,
        q32024: 55198,
        q42024: 55750,
        qoqChange: 1,
        yoyChange: 9,
        outlook: "Flat",
      },
      {
        microMarket: "Central",
        q42023: 100490,
        q32024: 102500,
        q42024: 102500,
        qoqChange: 0,
        yoyChange: 2,
        outlook: "Flat",
      },
      {
        microMarket: "Gurugram",
        q42023: 35909,
        q32024: 38350,
        q42024: 39500,
        qoqChange: 3,
        yoyChange: 10,
        outlook: "Flat",
      },
      {
        microMarket: "Noida",
        q42023: 13303,
        q32024: 14216,
        q42024: 14500,
        qoqChange: 2,
        yoyChange: 9,
        outlook: "Flat",
      },
    ],
    segmentData: {
      q42024: 4033,
      midSegment: 31,
      highSegment: 58,
      affordableSegment: 11,
      yoyGrowth: 82,
    },
    propertyData: [
      {
        property: "DLF The Dahlias",
        location: "Golf Course Road",
        developer: "DLF",
        units: 420,
        size: "9600-16000",
        status: "Launched",
      },
      {
        property: "Eldeco Fairway Reserve",
        location: "New Gurugram",
        developer: "Eldeco Group",
        units: 324,
        size: "2150-2875",
        status: "Launched",
      },
      {
        property: "Godrej Miraya",
        location: "Golf Course Road",
        developer: "Godrej Properties",
        units: 248,
        size: "2711-4562",
        status: "Launched",
      },
      {
        property: "Emaar Amaris",
        location: "Golf Course Road Extension",
        developer: "Emaar India",
        units: 420,
        size: "1240-2133",
        status: "Launched",
      },
      {
        property: "Anant Raj Shok Estate",
        location: "Golf Course Road Extension",
        developer: "Trehan",
        units: 100,
        size: "1300",
        status: "Completed",
      },
    ],
  },
  Pune: {
    marketData: [
      {
        microMarket: "Koregaon Park-Boar Club Road",
        q42023: 18500,
        q32024: 18500,
        q42024: 18500,
        qoqChange: 0,
        yoyChange: 0,
        outlook: "Growing",
      },
      {
        microMarket: "Nagar Road",
        q42023: 12838,
        q32024: 14250,
        q42024: 14250,
        qoqChange: 0,
        yoyChange: 11,
        outlook: "Growing",
      },
      {
        microMarket: "East",
        q42023: 11604,
        q32024: 12300,
        q42024: 12300,
        qoqChange: 0,
        yoyChange: 6,
        outlook: "Growing",
      },
      {
        microMarket: "Aundh-Baner",
        q42023: 12500,
        q32024: 12500,
        q42024: 12500,
        qoqChange: 0,
        yoyChange: 0,
        outlook: "Growing",
      },
    ],
    segmentData: {
      q42024: 10237,
      midSegment: 61,
      highSegment: 26,
      affordableSegment: 13,
      yoyGrowth: -6,
    },
    propertyData: [
      {
        property: "VTP Monarque Phase 1",
        location: "Hinjewadi",
        developer: "VTP Realty",
        units: 558,
        size: "712-1152",
        status: "Launched",
      },
      {
        property: "Godrej Evergreen Square",
        location: "Mulshi",
        developer: "Godrej Properties",
        units: 1998,
        size: "420-1113",
        status: "Launched",
      },
      {
        property: "Lodha Kothrud Pune",
        location: "Kothrud",
        developer: "Lodha Group",
        units: 204,
        size: "1394-1724",
        status: "Launched",
      },
      {
        property: "Canvas Phase 1",
        location: "Hinjewadi",
        developer: "Kolte Patil",
        units: 454,
        size: "908-1487",
        status: "Launched",
      },
      {
        property: "ARV Regalia",
        location: "Pisoli",
        developer: "ARV Group",
        units: 216,
        size: "616-862",
        status: "Completed",
      },
      {
        property: "Shree City One Panach",
        location: "Ravet",
        developer: "City One Developer",
        units: 57,
        size: "1210-1685",
        status: "Completed",
      },
    ],
  },
  Chennai: {
    marketData: [
      {
        microMarket: "Central",
        q42023: 25000,
        q32024: 25000,
        q42024: 25000,
        qoqChange: 0,
        yoyChange: 0,
        outlook: "Flat",
      },
      {
        microMarket: "Off Central - I",
        q42023: 20433,
        q32024: 20833,
        q42024: 21250,
        qoqChange: 2,
        yoyChange: 4,
        outlook: "Flat",
      },
      {
        microMarket: "Off Central - II",
        q42023: 16190,
        q32024: 16190,
        q42024: 17000,
        qoqChange: 5,
        yoyChange: 5,
        outlook: "Flat",
      },
      {
        microMarket: "East Coast Road",
        q42023: 8221,
        q32024: 8465,
        q42024: 8550,
        qoqChange: 1,
        yoyChange: 4,
        outlook: "Flat",
      },
    ],
    segmentData: {
      q42024: 4050,
      midSegment: 77,
      highSegment: 18,
      affordableSegment: 5,
      yoyGrowth: 38,
    },
    propertyData: [
      {
        property: "Provident Bayscape",
        location: "Kelambakkam",
        developer: "Provident Housing",
        units: 676,
        size: "1006-1424",
        status: "Launched",
      },
      {
        property: "NuTech Central Park",
        location: "Porur",
        developer: "NuTech Projects",
        units: 655,
        size: "1090-2248",
        status: "Launched",
      },
      {
        property: "SPR City - The Capital District",
        location: "Perambur",
        developer: "SPR Constructions",
        units: 651,
        size: "1075-1583",
        status: "Launched",
      },
      {
        property: "Silversky Lakeside 3",
        location: "Ambattur",
        developer: "Silversky Builders",
        units: 430,
        size: "965-1643",
        status: "Completed",
      },
      {
        property: "Radiance Flourish",
        location: "Thiruvottiyur",
        developer: "Radiance Realty",
        units: 395,
        size: "1030-1630",
        status: "Completed",
      },
    ],
  },
  Bengaluru: {
    marketData: [
      {
        microMarket: "Central",
        q42023: 24000,
        q32024: 24000,
        q42024: 24000,
        qoqChange: 0,
        yoyChange: 0,
        outlook: "Flat",
      },
      {
        microMarket: "South",
        q42023: 11614,
        q32024: 12649,
        q42024: 12775,
        qoqChange: 1,
        yoyChange: 10,
        outlook: "Flat",
      },
      {
        microMarket: "East",
        q42023: 10398,
        q32024: 11520,
        q42024: 11750,
        qoqChange: 2,
        yoyChange: 13,
        outlook: "Growing",
      },
      {
        microMarket: "North",
        q42023: 10045,
        q32024: 11139,
        q42024: 11250,
        qoqChange: 1,
        yoyChange: 12,
        outlook: "Growing",
      },
    ],
    segmentData: {
      q42024: 10237,
      midSegment: 61,
      highSegment: 26,
      affordableSegment: 13,
      yoyGrowth: -6,
    },
    propertyData: [
      {
        property: "Brigade ElDorado beryl",
        location: "Baglur",
        developer: "Brigade Group",
        units: 1325,
        size: "536-1561",
        status: "Launched",
      },
      {
        property: "Abhee Eden Vista",
        location: "Varthur Road",
        developer: "Abhee Ventures",
        units: 1100,
        size: "710-2500",
        status: "Launched",
      },
      {
        property: "Godrej Lakeside Orchard",
        location: "Sarjapur Road",
        developer: "Godrej Properties",
        units: 698,
        size: "1509-2662",
        status: "Launched",
      },
      {
        property: "Sumadhura Spire Amber",
        location: "Whitefield",
        developer: "Sumadhura Group",
        units: 326,
        size: "750-1250",
        status: "Completed",
      },
    ],
  },
  Ahmedabad: {
    marketData: [
      {
        microMarket: "Central",
        q42023: 7163,
        q32024: 7450,
        q42024: 7450,
        qoqChange: 0,
        yoyChange: 4,
        outlook: "Flat",
      },
      {
        microMarket: "West",
        q42023: 7143,
        q32024: 7477,
        q42024: 8000,
        qoqChange: 7,
        yoyChange: 12,
        outlook: "Flat",
      },
    ],
    segmentData: {
      q42024: 4474,
      midSegment: 52,
      highSegment: 16,
      affordableSegment: 32,
      yoyGrowth: -10,
    },
    propertyData: [
      {
        property: "Rajyash Ridge",
        location: "Vasna",
        developer: "Rajyash Group",
        units: 108,
        size: "1890",
        status: "Launched",
      },
      {
        property: "Riviera Bliss",
        location: "South Bopal",
        developer: "HN Safal & Goyal Builder",
        units: 152,
        size: "2420",
        status: "Launched",
      },
      {
        property: "Ganesh Luxuria",
        location: "Naranpura",
        developer: "Ganesh Buildcon",
        units: 72,
        size: "2295",
        status: "Launched",
      },
      {
        property: "The Park",
        location: "Ambli",
        developer: "HN Safal Developers",
        units: 46,
        size: "8000",
        status: "Launched",
      },
      {
        property: "Eminence 96",
        location: "Thaltej",
        developer: "Arista Buildcon",
        units: 96,
        size: "1914-3630",
        status: "Completed",
      },
      {
        property: "Aristo Aalayam",
        location: "Gota",
        developer: "Arista Buildcon",
        units: 108,
        size: "925-1216",
        status: "Completed",
      },
      {
        property: "Shayona Sarvopari",
        location: "Ghatlodia",
        developer: "Shayona Group",
        units: 108,
        size: "1063-1395",
        status: "Completed",
      },
    ],
  },
  Kolkata: {
    marketData: [
      {
        microMarket: "South",
        q42023: 9348,
        q32024: 10437,
        q42024: 10750,
        qoqChange: 3,
        yoyChange: 15,
        outlook: "Up",
      },
      {
        microMarket: "South-East",
        q42023: 9735,
        q32024: 10784,
        q42024: 11000,
        qoqChange: 2,
        yoyChange: 13,
        outlook: "Up",
      },
      {
        microMarket: "South-West",
        q42023: 14500,
        q32024: 14500,
        q42024: 14500,
        qoqChange: 0,
        yoyChange: 0,
        outlook: "Flat",
      },
      {
        microMarket: "Central",
        q42023: 14318,
        q32024: 15594,
        q42024: 15750,
        qoqChange: 1,
        yoyChange: 10,
        outlook: "Up",
      },
      {
        microMarket: "East",
        q42023: 7407,
        q32024: 8000,
        q42024: 8000,
        qoqChange: 0,
        yoyChange: 8,
        outlook: "Flat",
      },
    ],
    segmentData: {
      q42024: 4050,
      midSegment: 58,
      highSegment: 24,
      affordableSegment: 18,
      yoyGrowth: -24,
    },
    propertyData: [
      {
        property: "Urban Lakes Phase 2",
        location: "Uttarpara",
        developer: "Sugam Homes",
        units: 626,
        size: "750-1110",
        status: "Launched",
      },
      {
        property: "Srijan Optima Phase 1",
        location: "Rajarhat",
        developer: "Srijan Realty",
        units: 603,
        size: "930-1600",
        status: "Launched",
      },
      {
        property: "Godrej Blue",
        location: "New Alipore",
        developer: "Godrej Properties",
        units: 482,
        size: "1500-2500",
        status: "Launched",
      },
      {
        property: "New Kolkata - Sangam",
        location: "Serampore",
        developer: "Alcove Realty",
        units: 1072,
        size: "543-1039",
        status: "Completed",
      },
    ],
  },
  Hyderabad: {
    marketData: [
      {
        microMarket: "Banjara Hills/ Jubilee Hills",
        q42023: 12740,
        q32024: 12990,
        q42024: 13250,
        qoqChange: 2,
        yoyChange: 4,
        outlook: "Flat",
      },
      {
        microMarket: "Madhapur, Gachibowli",
        q42023: 10500,
        q32024: 10500,
        q42024: 10500,
        qoqChange: 0,
        yoyChange: 0,
        outlook: "Flat",
      },
      {
        microMarket: "Kukatpally",
        q42023: 9466,
        q32024: 9466,
        q42024: 9750,
        qoqChange: 3,
        yoyChange: 3,
        outlook: "Flat",
      },
      {
        microMarket: "Narsingi, Kokapet",
        q42023: 10250,
        q32024: 10250,
        q42024: 10250,
        qoqChange: 0,
        yoyChange: 0,
        outlook: "Flat",
      },
    ],
    segmentData: {
      q42024: 13653,
      midSegment: 58,
      highSegment: 34,
      affordableSegment: 8,
      yoyGrowth: -31,
    },
    propertyData: [
      {
        property: "Nirvana The Vermont",
        location: "Nacharam",
        developer: "Nirvana Homespaces",
        units: 576,
        size: "1870-2525",
        status: "Launched",
      },
      {
        property: "Brigade Neopolis",
        location: "Kokapet",
        developer: "Brigade Group",
        units: 590,
        size: "3000-4800",
        status: "Launched",
      },
      {
        property: "Anvitha Ivana",
        location: "Kollur",
        developer: "Anvita Group",
        units: 417,
        size: "1206-5000",
        status: "Completed",
      },
      {
        property: "White Waters at Y",
        location: "Kukatpally",
        developer: "White Waters Constructions",
        units: 408,
        size: "1715-2210",
        status: "Completed",
      },
    ],
  },
}

const MarketData: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city)
  }, [])

  return (
    <Card className="w-full overflow-hidden border-none bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="mr-2">📊</span>
            <Heading2 className="text-2xl font-bold text-primary">Market Data</Heading2>
          </div>
          <LiveButton />
        </div>
        <Paragraph className="text-sm text-muted-foreground mt-2">
          Real-time market insights and trends for High Net Worth Individuals
        </Paragraph>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full max-w-xs">
          <Select onValueChange={handleCityChange} value={selectedCity || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="India">India</SelectItem>
              {Object.keys(cityData).map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCity ? (
          <CitySpecificData city={selectedCity} data={selectedCity === "India" ? cityData : cityData[selectedCity]} />
        ) : (
          <div>
            <div className="pt-4 pb-2">
              <Heading3 className="text-lg font-semibold">Select a city to view market data</Heading3>
            </div>
            <div className="pb-4">
              <Paragraph>Choose a city from the dropdown above to see detailed market insights.</Paragraph>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MarketData

