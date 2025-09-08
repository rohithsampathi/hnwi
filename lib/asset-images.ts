// lib/asset-images.ts
// Centralized Ultra-Premium Asset Image System

export interface AssetImageConfig {
  unsplashId: string;
  alt: string;
  keywords: string[];
}

// Ultra-premium Unsplash image mappings for different asset types
export const ASSET_IMAGE_MAP: Record<string, AssetImageConfig> = {
  // === REAL ESTATE ===
  "real estate": {
    unsplashId: "photo-1613977257363-707ba9348227", // Ultra-luxury mansion
    alt: "Ultra-luxury real estate property",
    keywords: ["luxury", "mansion", "estate", "architecture"]
  },
  "real_estate": {
    unsplashId: "photo-1613977257363-707ba9348227", // Ultra-luxury mansion
    alt: "Ultra-luxury real estate property",
    keywords: ["luxury", "mansion", "estate", "architecture"]
  },
  "property": {
    unsplashId: "photo-1613977257363-707ba9348227", // Luxury property
    alt: "Premium luxury property",
    keywords: ["property", "luxury", "estate", "real estate"]
  },
  "properties": {
    unsplashId: "photo-1613977257363-707ba9348227", // Luxury properties
    alt: "Premium luxury properties",
    keywords: ["properties", "luxury", "estate", "real estate"]
  },
  "mansion": {
    unsplashId: "photo-1613977257363-707ba9348227", // Ultra-luxury mansion
    alt: "Premium luxury mansion",
    keywords: ["mansion", "luxury", "estate", "residential"]
  },
  "mansions": {
    unsplashId: "photo-1613977257363-707ba9348227", // Ultra-luxury mansion
    alt: "Premium luxury mansions",
    keywords: ["mansion", "luxury", "estate", "residential"]
  },
  "villa": {
    unsplashId: "photo-1613490493576-7fde63acd811", // Luxury villa
    alt: "Premium luxury villa",
    keywords: ["villa", "luxury", "estate", "residential"]
  },
  "villas": {
    unsplashId: "photo-1613490493576-7fde63acd811", // Luxury villa
    alt: "Premium luxury villa",
    keywords: ["villa", "luxury", "estate", "residential"]
  },
  "house": {
    unsplashId: "photo-1613977257363-707ba9348227", // Luxury house
    alt: "Premium luxury house",
    keywords: ["house", "luxury", "residential", "property"]
  },
  "houses": {
    unsplashId: "photo-1613977257363-707ba9348227", // Luxury houses
    alt: "Premium luxury houses",
    keywords: ["houses", "luxury", "residential", "property"]
  },
  "estate": {
    unsplashId: "photo-1613977257363-707ba9348227", // Estate
    alt: "Premium luxury estate",
    keywords: ["estate", "luxury", "mansion", "property"]
  },
  "estates": {
    unsplashId: "photo-1613977257363-707ba9348227", // Estates
    alt: "Premium luxury estates",
    keywords: ["estates", "luxury", "mansion", "property"]
  },
  "penthouse": {
    unsplashId: "photo-1545324418-cc1a3fa10c00", // Luxury apartment/penthouse
    alt: "Premium penthouse apartment",
    keywords: ["penthouse", "luxury", "apartment", "city"]
  },
  "apartment": {
    unsplashId: "photo-1545324418-cc1a3fa10c00", // Luxury apartment
    alt: "Premium luxury apartment",
    keywords: ["apartment", "luxury", "residential", "city"]
  },
  "apartments": {
    unsplashId: "photo-1545324418-cc1a3fa10c00", // Luxury apartments
    alt: "Premium luxury apartments",
    keywords: ["apartments", "luxury", "residential", "city"]
  },
  "condo": {
    unsplashId: "photo-1545324418-cc1a3fa10c00", // Luxury condo
    alt: "Premium luxury condominium",
    keywords: ["condo", "luxury", "residential", "apartment"]
  },
  "condominium": {
    unsplashId: "photo-1545324418-cc1a3fa10c00", // Luxury condominium
    alt: "Premium luxury condominium",
    keywords: ["condominium", "luxury", "residential", "apartment"]
  },
  "commercial": {
    unsplashId: "photo-1582407947304-fd86f028f716", // Urban high-rise
    alt: "Premium commercial property",
    keywords: ["commercial", "highrise", "urban", "building"]
  },
  "commercial property": {
    unsplashId: "photo-1582407947304-fd86f028f716", // Commercial property
    alt: "Premium commercial property",
    keywords: ["commercial", "property", "business", "building"]
  },
  "commercial complex": {
    unsplashId: "photo-1582407947304-fd86f028f716", // Urban high-rise
    alt: "Premium commercial complex",
    keywords: ["commercial", "highrise", "urban", "building"]
  },
  "office building": {
    unsplashId: "photo-1486406146926-c627a92ad1ab", // Modern office building
    alt: "Premium office building",
    keywords: ["office", "building", "commercial", "business"]
  },
  "office": {
    unsplashId: "photo-1486406146926-c627a92ad1ab", // Office building
    alt: "Premium office space",
    keywords: ["office", "building", "commercial", "business"]
  },
  "building": {
    unsplashId: "photo-1582407947304-fd86f028f716", // Modern building
    alt: "Premium building",
    keywords: ["building", "architecture", "commercial", "property"]
  },
  "hotel": {
    unsplashId: "photo-1566073771259-6a8506099945", // Luxury hotel
    alt: "Premium luxury hotel",
    keywords: ["hotel", "luxury", "hospitality", "resort"]
  },
  "resort": {
    unsplashId: "photo-1566073771259-6a8506099945", // Luxury resort
    alt: "Premium luxury resort",
    keywords: ["resort", "luxury", "hospitality", "vacation"]
  },
  "warehouse": {
    unsplashId: "photo-1582407947304-fd86f028f716", // Industrial warehouse
    alt: "Premium warehouse facility",
    keywords: ["warehouse", "industrial", "commercial", "logistics"]
  },
  "retail": {
    unsplashId: "photo-1582407947304-fd86f028f716", // Retail space
    alt: "Premium retail space",
    keywords: ["retail", "commercial", "shopping", "business"]
  },

  // === LAND & AGRICULTURE ===
  "land": {
    unsplashId: "photo-1500382017468-9049fed747ef", // Vast estate land
    alt: "Premium estate land",
    keywords: ["estate", "land", "property", "investment"]
  },
  "plot": {
    unsplashId: "photo-1576013551627-0cc20b96c2a7", // Open land plot with fencing
    alt: "Premium fenced land plot",
    keywords: ["plot", "fenced", "land", "property", "development"]
  },
  "plots": {
    unsplashId: "photo-1576013551627-0cc20b96c2a7", // Open land plots with fencing
    alt: "Premium fenced land plots",
    keywords: ["plots", "fenced", "land", "property", "development"]
  },
  "lands": {
    unsplashId: "photo-1500382017468-9049fed747ef", // Vast estate land
    alt: "Premium estate lands",
    keywords: ["estate", "land", "property", "investment"]
  },
  "farm": {
    unsplashId: "photo-1500382017468-9049fed747ef", // Agricultural land
    alt: "Premium agricultural farm",
    keywords: ["farm", "agriculture", "land", "estate"]
  },
  "orchard": {
    unsplashId: "photo-1500382017468-9049fed747ef", // Orchard land
    alt: "Premium estate land with orchard",
    keywords: ["orchard", "agriculture", "land", "estate"]
  },
  "orchards": {
    unsplashId: "photo-1500382017468-9049fed747ef", // Orchard land
    alt: "Premium estate land with orchards",
    keywords: ["orchards", "agriculture", "land", "estate"]
  },
  "vineyard": {
    unsplashId: "photo-1506905925346-21bda4d32df4", // Vineyard
    alt: "Premium vineyard estate",
    keywords: ["vineyard", "wine", "estate", "agriculture"]
  },

  // === VEHICLES ===
  "vehicle": {
    unsplashId: "photo-1619405399517-d7fce0f13302", // Classic vintage car
    alt: "Premium vintage luxury vehicle",
    keywords: ["vintage", "classic", "luxury", "car", "vehicle"]
  },
  "vehicles": {
    unsplashId: "photo-1619405399517-d7fce0f13302", // Classic vintage car
    alt: "Premium vintage luxury vehicles",
    keywords: ["vintage", "classic", "luxury", "car", "vehicle"]
  },
  "car": {
    unsplashId: "photo-1619405399517-d7fce0f13302", // Classic vintage car
    alt: "Premium vintage luxury car",
    keywords: ["vintage", "classic", "luxury", "car", "automotive"]
  },
  "cars": {
    unsplashId: "photo-1619405399517-d7fce0f13302", // Classic vintage car
    alt: "Premium vintage luxury cars",
    keywords: ["vintage", "classic", "luxury", "car", "automotive"]
  },
  "supercar": {
    unsplashId: "photo-1614200179396-2bdb77ebf81b", // Hypercar/Supercar
    alt: "Premium luxury supercar",
    keywords: ["supercar", "luxury", "sports", "automotive"]
  },
  "hypercar": {
    unsplashId: "photo-1614200179396-2bdb77ebf81b", // Hypercar
    alt: "Ultra-premium hypercar",
    keywords: ["hypercar", "luxury", "exclusive", "automotive"]
  },
  "yacht": {
    unsplashId: "photo-1567899378494-47b22a2ae96a", // Luxury yacht
    alt: "Ultra-luxury yacht",
    keywords: ["yacht", "luxury", "marine", "exclusive"]
  },
  "boat": {
    unsplashId: "photo-1567899378494-47b22a2ae96a", // Luxury boat
    alt: "Premium luxury boat",
    keywords: ["boat", "yacht", "marine", "luxury"]
  },
  "private jet": {
    unsplashId: "photo-1540962351504-03099e0a754b", // Private jet
    alt: "Premium private jet",
    keywords: ["jet", "aviation", "luxury", "private"]
  },
  "aircraft": {
    unsplashId: "photo-1540962351504-03099e0a754b", // Private aircraft
    alt: "Luxury private aircraft",
    keywords: ["aircraft", "aviation", "luxury", "private"]
  },
  "helicopter": {
    unsplashId: "photo-1540962351504-03099e0a754b", // Private helicopter
    alt: "Premium private helicopter",
    keywords: ["helicopter", "aviation", "luxury", "private"]
  },

  // === PRECIOUS METALS & COMMODITIES ===
  "precious metals": {
    unsplashId: "photo-1605792657660-596af9009e82", // Gold bars
    alt: "Premium gold bars",
    keywords: ["gold", "bars", "precious", "metals"]
  },
  "precious_metals": {
    unsplashId: "photo-1605792657660-596af9009e82", // Gold bars
    alt: "Premium gold bars",
    keywords: ["gold", "bars", "precious", "metals"]
  },
  "gold": {
    unsplashId: "photo-1610375461246-83df859d849d", // Premium gold bars
    alt: "Premium gold investment",
    keywords: ["gold", "bars", "precious", "investment"]
  },
  "gold bars": {
    unsplashId: "photo-1610375461246-83df859d849d", // Premium gold bars
    alt: "Premium gold bars",
    keywords: ["gold", "bars", "precious", "investment"]
  },
  "silver": {
    unsplashId: "photo-1610375461246-83df859d849d", // Silver bars
    alt: "Premium silver investment",
    keywords: ["silver", "bars", "precious", "metals"]
  },
  "silver bars": {
    unsplashId: "photo-1610375461246-83df859d849d", // Silver bars
    alt: "Premium silver bars",
    keywords: ["silver", "bars", "precious", "metals"]
  },
  "platinum": {
    unsplashId: "photo-1610375461246-83df859d849d", // Platinum bars
    alt: "Premium platinum investment",
    keywords: ["platinum", "bars", "precious", "metals"]
  },
  "platinum bars": {
    unsplashId: "photo-1610375461246-83df859d849d", // Platinum bars
    alt: "Premium platinum bars",
    keywords: ["platinum", "bars", "precious", "metals"]
  },
  "diamonds": {
    unsplashId: "photo-1515562141207-7a88fb7ce338", // Diamonds
    alt: "Premium diamond collection",
    keywords: ["diamonds", "precious", "stones", "luxury"]
  },
  "precious stones": {
    unsplashId: "photo-1515562141207-7a88fb7ce338", // Precious stones
    alt: "Premium precious stones",
    keywords: ["stones", "precious", "gems", "luxury"]
  },
  "gems": {
    unsplashId: "photo-1515562141207-7a88fb7ce338", // Gems
    alt: "Premium gemstone collection",
    keywords: ["gems", "precious", "stones", "luxury"]
  },
  "commodities": {
    unsplashId: "photo-1605792657660-596af9009e82", // Commodities
    alt: "Premium commodity investment",
    keywords: ["commodities", "precious", "metals", "investment"]
  },

  // === JEWELRY & LUXURY GOODS ===
  "jewelry": {
    unsplashId: "photo-1515562141207-7a88fb7ce338", // Luxury jewelry
    alt: "Premium luxury jewelry",
    keywords: ["jewelry", "diamonds", "luxury", "precious"]
  },
  "watch": {
    unsplashId: "photo-1524592094714-0f0654e20314", // Elegant luxury watch
    alt: "Premium luxury timepiece",
    keywords: ["watch", "timepiece", "luxury", "elegant"]
  },
  "watches": {
    unsplashId: "photo-1524592094714-0f0654e20314", // Elegant luxury watch
    alt: "Premium luxury timepieces",
    keywords: ["watch", "timepiece", "luxury", "elegant"]
  },
  "luxury goods": {
    unsplashId: "photo-1522312346375-d1a52e2b99b3", // Luxury items
    alt: "Premium luxury goods",
    keywords: ["luxury", "goods", "premium", "exclusive"]
  },

  // === ART & COLLECTIBLES ===
  "art": {
    unsplashId: "photo-1541961017774-22349e4a1262", // Art gallery
    alt: "Fine art collection",
    keywords: ["art", "painting", "gallery", "collectible"]
  },
  "collectibles": {
    unsplashId: "photo-1531913764164-f85c52e6e654", // Art pieces
    alt: "Premium art collectibles",
    keywords: ["collectibles", "art", "antique", "valuable"]
  },
  "painting": {
    unsplashId: "photo-1541961017774-22349e4a1262", // Art painting
    alt: "Premium art painting",
    keywords: ["painting", "art", "fine", "collectible"]
  },
  "sculpture": {
    unsplashId: "photo-1578662996442-48f60103fc96", // Art sculpture
    alt: "Premium art sculpture",
    keywords: ["sculpture", "art", "fine", "collectible"]
  },
  "antique": {
    unsplashId: "photo-1531913764164-f85c52e6e654", // Antique items
    alt: "Premium antique collection",
    keywords: ["antique", "vintage", "collectible", "valuable"]
  },
  "antiques": {
    unsplashId: "photo-1531913764164-f85c52e6e654", // Antique items
    alt: "Premium antique collections",
    keywords: ["antiques", "vintage", "collectible", "valuable"]
  },

  // === FINANCIAL INVESTMENTS ===
  "investment": {
    unsplashId: "photo-1560520653-9e0e4c89eb11", // Financial markets
    alt: "Investment portfolio",
    keywords: ["investment", "finance", "portfolio", "wealth"]
  },
  "investments": {
    unsplashId: "photo-1560520653-9e0e4c89eb11", // Financial markets
    alt: "Investment portfolios",
    keywords: ["investments", "finance", "portfolio", "wealth"]
  },
  "stocks": {
    unsplashId: "photo-1611974789855-9c2a0a7236a3", // Stock market
    alt: "Stock market investments",
    keywords: ["stocks", "market", "finance", "trading"]
  },
  "bonds": {
    unsplashId: "photo-1559526324-4b87b5e36e44", // Financial documents
    alt: "Premium bond investments",
    keywords: ["bonds", "finance", "investment", "securities"]
  },
  "crypto": {
    unsplashId: "photo-1621761191319-c6fb62004040", // Cryptocurrency
    alt: "Cryptocurrency investment",
    keywords: ["crypto", "blockchain", "digital", "currency"]
  },
  "cryptocurrency": {
    unsplashId: "photo-1621761191319-c6fb62004040", // Cryptocurrency
    alt: "Cryptocurrency investment",
    keywords: ["cryptocurrency", "blockchain", "digital", "bitcoin"]
  },
  "bitcoin": {
    unsplashId: "photo-1621761191319-c6fb62004040", // Bitcoin
    alt: "Bitcoin cryptocurrency",
    keywords: ["bitcoin", "crypto", "digital", "currency"]
  },

  // === BUSINESS & ENTERPRISE ===
  "business": {
    unsplashId: "photo-1486406146926-c627a92ad1ab", // Modern business
    alt: "Premium business venture",
    keywords: ["business", "corporate", "enterprise", "modern"]
  },
  "company": {
    unsplashId: "photo-1486406146926-c627a92ad1ab", // Corporate building
    alt: "Premium company investment",
    keywords: ["company", "corporate", "business", "enterprise"]
  },
  "startup": {
    unsplashId: "photo-1486406146926-c627a92ad1ab", // Modern startup
    alt: "Premium startup investment",
    keywords: ["startup", "business", "innovation", "technology"]
  },
  "franchise": {
    unsplashId: "photo-1486406146926-c627a92ad1ab", // Business franchise
    alt: "Premium franchise investment",
    keywords: ["franchise", "business", "commercial", "investment"]
  },

  // === LUXURY LIFESTYLE ===
  "wine": {
    unsplashId: "photo-1586370434639-0fe43b2d32d6", // Vintage wine
    alt: "Premium wine collection",
    keywords: ["wine", "vintage", "collection", "luxury"]
  },
  "wine collection": {
    unsplashId: "photo-1586370434639-0fe43b2d32d6", // Wine collection
    alt: "Premium wine collection",
    keywords: ["wine", "collection", "vintage", "cellar"]
  },
  "rare wines": {
    unsplashId: "photo-1586370434639-0fe43b2d32d6", // Rare wines
    alt: "Premium rare wine collection",
    keywords: ["wine", "rare", "vintage", "collectible"]
  },
  "private island": {
    unsplashId: "photo-1559128010-7c1ad6e1b6a5", // Private island
    alt: "Premium private island",
    keywords: ["island", "private", "luxury", "exclusive"]
  },
  "island": {
    unsplashId: "photo-1559128010-7c1ad6e1b6a5", // Island property
    alt: "Premium island property",
    keywords: ["island", "property", "luxury", "exclusive"]
  },

  // === TECHNOLOGY & INTELLECTUAL PROPERTY ===
  "technology": {
    unsplashId: "photo-1518709268805-4e9042af2176", // Technology/data
    alt: "Premium technology investment",
    keywords: ["technology", "innovation", "digital", "investment"]
  },
  "patent": {
    unsplashId: "photo-1518709268805-4e9042af2176", // Intellectual property
    alt: "Premium patent portfolio",
    keywords: ["patent", "intellectual", "property", "technology"]
  },
  "intellectual property": {
    unsplashId: "photo-1518709268805-4e9042af2176", // IP assets
    alt: "Premium intellectual property",
    keywords: ["intellectual", "property", "patent", "technology"]
  },

  // === MINING & NATURAL RESOURCES ===
  "mining": {
    unsplashId: "photo-1597149961419-0d90ac2e3db4", // Mining operation
    alt: "Premium mining investment",
    keywords: ["mining", "resources", "natural", "extraction"]
  },
  "oil": {
    unsplashId: "photo-1597149961419-0d90ac2e3db4", // Oil/energy
    alt: "Premium oil investment",
    keywords: ["oil", "energy", "petroleum", "investment"]
  },
  "gas": {
    unsplashId: "photo-1597149961419-0d90ac2e3db4", // Natural gas
    alt: "Premium gas investment",
    keywords: ["gas", "energy", "natural", "investment"]
  },
  "energy": {
    unsplashId: "photo-1597149961419-0d90ac2e3db4", // Energy sector
    alt: "Premium energy investment",
    keywords: ["energy", "power", "resources", "investment"]
  },

  // === ADDITIONAL CATEGORIES ===
  "cash": {
    unsplashId: "photo-1560520653-9e0e4c89eb11", // Cash/money
    alt: "Cash holdings",
    keywords: ["cash", "money", "liquid", "currency"]
  },
  "bank account": {
    unsplashId: "photo-1560520653-9e0e4c89eb11", // Banking
    alt: "Bank account holdings",
    keywords: ["bank", "account", "savings", "financial"]
  },
  "savings": {
    unsplashId: "photo-1560520653-9e0e4c89eb11", // Savings
    alt: "Savings account",
    keywords: ["savings", "bank", "deposit", "money"]
  },
  "mutual funds": {
    unsplashId: "photo-1611974789855-9c2a0a7236a3", // Mutual funds
    alt: "Mutual fund investments",
    keywords: ["mutual", "funds", "portfolio", "investment"]
  },
  "etf": {
    unsplashId: "photo-1611974789855-9c2a0a7236a3", // ETF
    alt: "ETF investments",
    keywords: ["etf", "exchange", "traded", "fund"]
  },
  "pension": {
    unsplashId: "photo-1560520653-9e0e4c89eb11", // Pension
    alt: "Pension fund",
    keywords: ["pension", "retirement", "fund", "savings"]
  },
  "retirement": {
    unsplashId: "photo-1560520653-9e0e4c89eb11", // Retirement
    alt: "Retirement savings",
    keywords: ["retirement", "401k", "ira", "pension"]
  },
  "401k": {
    unsplashId: "photo-1560520653-9e0e4c89eb11", // 401k
    alt: "401k retirement account",
    keywords: ["401k", "retirement", "savings", "account"]
  },
  "ira": {
    unsplashId: "photo-1560520653-9e0e4c89eb11", // IRA
    alt: "IRA retirement account", 
    keywords: ["ira", "retirement", "individual", "account"]
  },
  "trust": {
    unsplashId: "photo-1559526324-4b87b5e36e44", // Trust/legal
    alt: "Trust fund",
    keywords: ["trust", "fund", "legal", "estate"]
  },
  "trust fund": {
    unsplashId: "photo-1559526324-4b87b5e36e44", // Trust fund
    alt: "Trust fund holdings",
    keywords: ["trust", "fund", "inheritance", "estate"]
  },
  "insurance": {
    unsplashId: "photo-1559526324-4b87b5e36e44", // Insurance
    alt: "Insurance policy",
    keywords: ["insurance", "policy", "protection", "coverage"]
  },
  "life insurance": {
    unsplashId: "photo-1559526324-4b87b5e36e44", // Life insurance
    alt: "Life insurance policy",
    keywords: ["life", "insurance", "policy", "protection"]
  },
  "annuity": {
    unsplashId: "photo-1560520653-9e0e4c89eb11", // Annuity
    alt: "Annuity investment",
    keywords: ["annuity", "income", "retirement", "financial"]
  },

  // === DEFAULT FALLBACK ===
  "default": {
    unsplashId: "photo-1559526324-4b87b5e36e44", // Premium abstract
    alt: "Premium asset",
    keywords: ["premium", "luxury", "asset", "wealth"]
  }
};

// Intelligent title and type based image matching
export const getAssetImageByTitle = (assetTitle: string, assetType: string): AssetImageConfig => {
  const normalizedTitle = assetTitle.toLowerCase().trim();
  const normalizedType = assetType.toLowerCase().trim();
  
  // Title-based keyword matching (more specific)
  const titleKeywords = [
    // Land & Agriculture
    { keywords: ["plot", "land plot", "fenced plot", "development plot"], type: "plot" },
    { keywords: ["aquaculture", "fish farm", "fishery"], type: "land" },
    { keywords: ["mango orchard", "orchard", "fruit farm", "plantation"], type: "orchard" },
    { keywords: ["vineyard", "wine estate", "grape farm"], type: "vineyard" },
    { keywords: ["farm", "agricultural", "crop", "livestock"], type: "farm" },
    { keywords: ["ranch", "cattle", "horse farm"], type: "land" },
    
    // Precious Metals
    { keywords: ["gold bar", "gold bars", "gold bullion"], type: "gold" },
    { keywords: ["silver bar", "silver bars", "silver bullion"], type: "silver" },
    { keywords: ["platinum bar", "platinum bars"], type: "platinum" },
    { keywords: ["precious metal", "bullion", "metal bars"], type: "precious metals" },
    
    // Real Estate
    { keywords: ["villa", "luxury villa", "private villa"], type: "villa" },
    { keywords: ["mansion", "luxury mansion", "estate home"], type: "mansion" },
    { keywords: ["complex", "commercial complex", "business complex"], type: "commercial complex" },
    { keywords: ["penthouse", "luxury penthouse", "sky home"], type: "penthouse" },
    { keywords: ["apartment", "luxury apartment", "condo"], type: "apartment" },
    { keywords: ["office", "office building", "commercial office"], type: "office building" },
    { keywords: ["warehouse", "storage", "logistics"], type: "warehouse" },
    { keywords: ["hotel", "luxury hotel", "resort hotel"], type: "hotel" },
    { keywords: ["shopping", "mall", "retail"], type: "retail" },
    
    // Vehicles
    { keywords: ["rolls royce", "bentley", "luxury car"], type: "car" },
    { keywords: ["ferrari", "lamborghini", "supercar", "sports car"], type: "supercar" },
    { keywords: ["yacht", "luxury yacht", "mega yacht"], type: "yacht" },
    { keywords: ["private jet", "jet", "aircraft"], type: "private jet" },
    { keywords: ["helicopter", "chopper"], type: "helicopter" },
    
    // Luxury Items
    { keywords: ["rolex", "patek philippe", "luxury watch", "timepiece"], type: "watch" },
    { keywords: ["diamond", "jewelry", "precious stones"], type: "jewelry" },
    { keywords: ["art", "painting", "sculpture"], type: "art" },
    { keywords: ["wine", "vintage wine", "wine collection"], type: "wine" },
    
    // Investments
    { keywords: ["stock", "shares", "equity"], type: "stocks" },
    { keywords: ["bond", "treasury", "securities"], type: "bonds" },
    { keywords: ["bitcoin", "crypto", "cryptocurrency"], type: "crypto" },
    { keywords: ["business", "company", "enterprise"], type: "business" },
    { keywords: ["mutual fund", "index fund"], type: "mutual funds" },
    { keywords: ["etf", "exchange traded"], type: "etf" },
    
    // Financial Accounts
    { keywords: ["cash", "money", "liquid"], type: "cash" },
    { keywords: ["bank account", "savings account"], type: "bank account" },
    { keywords: ["pension", "retirement fund"], type: "pension" },
    { keywords: ["401k", "401(k)"], type: "401k" },
    { keywords: ["ira", "roth ira"], type: "ira" },
    { keywords: ["trust fund", "family trust"], type: "trust fund" },
    { keywords: ["life insurance", "insurance policy"], type: "life insurance" },
    { keywords: ["annuity", "fixed annuity"], type: "annuity" },
  ];
  
  // Check title for specific keywords first
  for (const item of titleKeywords) {
    if (item.keywords.some(keyword => normalizedTitle.includes(keyword))) {
      const config = ASSET_IMAGE_MAP[item.type];
      if (config) return config;
    }
  }
  
  // Fallback to type-based matching
  let config = ASSET_IMAGE_MAP[normalizedType];
  
  if (!config) {
    // Try partial matching for compound asset types
    const matchingKey = Object.keys(ASSET_IMAGE_MAP).find(key => 
      normalizedType.includes(key) || key.includes(normalizedType)
    );
    config = matchingKey ? ASSET_IMAGE_MAP[matchingKey] : ASSET_IMAGE_MAP.default;
  }
  
  return config;
};

// Generate Unsplash URL with optimal settings for asset cards
export const getAssetImageUrl = (assetTitle: string, assetType: string, size: "sm" | "md" | "lg" = "md"): string => {
  const config = getAssetImageByTitle(assetTitle, assetType);
  
  // Size configuration for responsive images
  const sizeConfig = {
    sm: { w: 400, h: 300 },
    md: { w: 600, h: 400 },
    lg: { w: 800, h: 600 }
  };
  
  const { w, h } = sizeConfig[size];
  
  return `https://images.unsplash.com/${config.unsplashId}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=${w}&h=${h}&q=80`;
};

// Get image alt text for accessibility
export const getAssetImageAlt = (assetTitle: string, assetType: string): string => {
  const config = getAssetImageByTitle(assetTitle, assetType);
  return config.alt;
};

// Get image keywords for additional metadata
export const getAssetImageKeywords = (assetType: string): string[] => {
  const normalizedType = assetType.toLowerCase().trim();
  let config = ASSET_IMAGE_MAP[normalizedType];
  
  if (!config) {
    const matchingKey = Object.keys(ASSET_IMAGE_MAP).find(key => 
      normalizedType.includes(key) || key.includes(normalizedType)
    );
    config = matchingKey ? ASSET_IMAGE_MAP[matchingKey] : ASSET_IMAGE_MAP.default;
  }
  
  return config.keywords;
};