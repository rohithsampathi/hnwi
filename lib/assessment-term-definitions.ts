// lib/assessment-term-definitions.ts
// Comprehensive definitions for HNWI/wealth management abbreviations

export interface TermDefinition {
  term: string;
  fullName: string;
  definition: string;
  category: 'tax' | 'legal' | 'financial' | 'trust' | 'regulatory' | 'investment';
}

export const TERM_DEFINITIONS: Record<string, TermDefinition> = {
  'LRS': {
    term: 'LRS',
    fullName: 'Liberalised Remittance Scheme',
    definition: 'A scheme by the Reserve Bank of India allowing resident individuals to remit up to USD 250,000 per financial year for any permissible current or capital account transaction.',
    category: 'regulatory'
  },
  'SLAT': {
    term: 'SLAT',
    fullName: 'Spousal Lifetime Access Trust',
    definition: 'An irrevocable trust created by one spouse for the benefit of the other spouse, allowing indirect access to assets while removing them from the estate for tax purposes.',
    category: 'trust'
  },
  'GRAT': {
    term: 'GRAT',
    fullName: 'Grantor Retained Annuity Trust',
    definition: 'An estate planning tool that allows the grantor to freeze the value of assets and transfer future appreciation to beneficiaries at a reduced gift tax cost.',
    category: 'trust'
  },
  'ILIT': {
    term: 'ILIT',
    fullName: 'Irrevocable Life Insurance Trust',
    definition: 'A trust designed to own and be the beneficiary of life insurance policies, keeping death benefits out of the taxable estate.',
    category: 'trust'
  },
  'QPR': {
    term: 'QPR',
    fullName: 'Qualified Personal Residence Trust',
    definition: 'A trust that allows you to transfer your primary or vacation home out of your estate at a reduced gift tax value while retaining the right to live in it for a specified period.',
    category: 'trust'
  },
  'DAPT': {
    term: 'DAPT',
    fullName: 'Domestic Asset Protection Trust',
    definition: 'A self-settled trust established in certain U.S. states that allows the settlor to be a discretionary beneficiary while protecting assets from creditors.',
    category: 'trust'
  },
  'CRT': {
    term: 'CRT',
    fullName: 'Charitable Remainder Trust',
    definition: 'A tax-exempt irrevocable trust designed to reduce taxable income by dispersing income to beneficiaries for a period, then donating the remainder to charity.',
    category: 'trust'
  },
  'DAF': {
    term: 'DAF',
    fullName: 'Donor-Advised Fund',
    definition: 'A charitable giving vehicle that allows donors to make an immediate tax-deductible contribution to a fund, then recommend grants to charities over time. Provides immediate tax benefits while allowing flexible timing of charitable distributions.',
    category: 'tax'
  },
  'CLT': {
    term: 'CLT',
    fullName: 'Charitable Lead Trust',
    definition: 'A trust that pays income to a charity for a set period, after which the remaining assets pass to non-charitable beneficiaries, often with reduced transfer taxes.',
    category: 'trust'
  },
  'GRT': {
    term: 'GRT',
    fullName: 'Grantor Retained Trust',
    definition: 'A trust where the grantor retains certain rights or interests for a specified period, after which assets pass to beneficiaries at reduced tax cost.',
    category: 'trust'
  },
  'QPRT': {
    term: 'QPRT',
    fullName: 'Qualified Personal Residence Trust',
    definition: 'A trust specifically designed for transferring a personal residence out of your estate while you continue to live in it for a set term.',
    category: 'trust'
  },
  'DST': {
    term: 'DST',
    fullName: 'Delaware Statutory Trust',
    definition: 'A legal entity recognized as a real estate investment that can qualify for 1031 exchange treatment, allowing fractional ownership in institutional-grade properties.',
    category: 'legal'
  },
  'UHNW': {
    term: 'UHNW',
    fullName: 'Ultra-High-Net-Worth',
    definition: 'Individuals with investable assets exceeding $30 million, typically requiring sophisticated wealth management and estate planning strategies.',
    category: 'financial'
  },
  'HNW': {
    term: 'HNW',
    fullName: 'High-Net-Worth',
    definition: 'Individuals with investable assets between $1-10 million, requiring specialized financial planning and investment management.',
    category: 'financial'
  },
  'HNWI': {
    term: 'HNWI',
    fullName: 'High-Net-Worth Individual',
    definition: 'A person with liquid financial assets exceeding $1 million, excluding primary residence.',
    category: 'financial'
  },
  'AUM': {
    term: 'AUM',
    fullName: 'Assets Under Management',
    definition: 'The total market value of investments that a person or entity manages on behalf of clients.',
    category: 'financial'
  },
  'IRR': {
    term: 'IRR',
    fullName: 'Internal Rate of Return',
    definition: 'A metric used to estimate the profitability of potential investments, representing the discount rate that makes net present value zero.',
    category: 'investment'
  },
  'NAV': {
    term: 'NAV',
    fullName: 'Net Asset Value',
    definition: 'The value per share of a fund, calculated by dividing total assets minus liabilities by the number of outstanding shares.',
    category: 'investment'
  },
  'PE': {
    term: 'PE',
    fullName: 'Private Equity',
    definition: 'Investment in private companies or buyouts of public companies, typically with a focus on long-term value creation.',
    category: 'investment'
  },
  'VC': {
    term: 'VC',
    fullName: 'Venture Capital',
    definition: 'Financing provided to early-stage, high-potential startups in exchange for equity, typically with high risk and high reward potential.',
    category: 'investment'
  },
  'SPV': {
    term: 'SPV',
    fullName: 'Special Purpose Vehicle',
    definition: 'A legal entity created for a specific, limited purpose, often used to isolate financial risk or pool investments for a single deal.',
    category: 'legal'
  },
  'LLC': {
    term: 'LLC',
    fullName: 'Limited Liability Company',
    definition: 'A business structure that combines the pass-through taxation of a partnership with the limited liability of a corporation.',
    category: 'legal'
  },
  'S-CORP': {
    term: 'S-Corp',
    fullName: 'S Corporation',
    definition: 'A corporation that elects to pass corporate income, losses, deductions, and credits through to shareholders for federal tax purposes, avoiding double taxation while providing liability protection.',
    category: 'legal'
  },
  'C-CORP': {
    term: 'C-Corp',
    fullName: 'C Corporation',
    definition: 'A standard corporation that is taxed separately from its owners, potentially subject to double taxation on corporate profits and shareholder dividends.',
    category: 'legal'
  },
  'FATCA': {
    term: 'FATCA',
    fullName: 'Foreign Account Tax Compliance Act',
    definition: 'U.S. legislation requiring foreign financial institutions to report assets held by U.S. taxpayers to the IRS.',
    category: 'regulatory'
  },
  'CRS': {
    term: 'CRS',
    fullName: 'Common Reporting Standard',
    definition: 'OECD standard for automatic exchange of financial account information between tax authorities globally.',
    category: 'regulatory'
  },
  'KYC': {
    term: 'KYC',
    fullName: 'Know Your Customer',
    definition: 'Due diligence process to verify client identity and assess potential money laundering or terrorism financing risks.',
    category: 'regulatory'
  },
  'AML': {
    term: 'AML',
    fullName: 'Anti-Money Laundering',
    definition: 'Regulations and procedures designed to prevent criminals from disguising illegally obtained funds as legitimate income.',
    category: 'regulatory'
  },
  'EIN': {
    term: 'EIN',
    fullName: 'Employer Identification Number',
    definition: 'A unique identifier assigned by the IRS to business entities, trusts, and estates for tax purposes.',
    category: 'tax'
  },
  'IRS': {
    term: 'IRS',
    fullName: 'Internal Revenue Service',
    definition: 'The U.S. federal agency responsible for tax collection and enforcement of the Internal Revenue Code.',
    category: 'regulatory'
  },
  'FBAR': {
    term: 'FBAR',
    fullName: 'Foreign Bank Account Report',
    definition: 'Annual report required for U.S. persons with foreign financial accounts exceeding $10,000 aggregate value.',
    category: 'regulatory'
  },
  'QI': {
    term: 'QI',
    fullName: 'Qualified Intermediary',
    definition: 'A foreign financial institution that has entered into an agreement with the IRS to withhold and report on U.S. source income.',
    category: 'regulatory'
  },
  'PFIC': {
    term: 'PFIC',
    fullName: 'Passive Foreign Investment Company',
    definition: 'Foreign corporation with specific income or asset characteristics that trigger adverse U.S. tax treatment for shareholders.',
    category: 'tax'
  },
  'CFC': {
    term: 'CFC',
    fullName: 'Controlled Foreign Corporation',
    definition: 'Foreign corporation with more than 50% ownership by U.S. shareholders, subject to special tax reporting requirements.',
    category: 'tax'
  },
  'GILTI': {
    term: 'GILTI',
    fullName: 'Global Intangible Low-Taxed Income',
    definition: 'U.S. tax provision requiring current taxation of certain foreign income earned by controlled foreign corporations.',
    category: 'tax'
  },
  'FDII': {
    term: 'FDII',
    fullName: 'Foreign-Derived Intangible Income',
    definition: 'U.S. tax benefit providing reduced tax rate on certain foreign income derived from intangible assets.',
    category: 'tax'
  },
  'BASEL III': {
    term: 'Basel III',
    fullName: 'Basel III Banking Regulations',
    definition: 'International regulatory framework requiring banks to maintain higher capital reserves and reduce risk exposure, often forcing divestment of commercial real estate loans.',
    category: 'regulatory'
  },
  'CRE': {
    term: 'CRE',
    fullName: 'Commercial Real Estate',
    definition: 'Property used exclusively for business purposes, including office buildings, retail centers, hotels, and industrial facilities.',
    category: 'investment'
  },
  'DISTRESSED DEBT': {
    term: 'Distressed Debt',
    fullName: 'Distressed Debt Investment',
    definition: 'Securities of companies or government entities that are in or near bankruptcy, default, or financial distress, often trading at significant discounts.',
    category: 'investment'
  },
  'LTV': {
    term: 'LTV',
    fullName: 'Loan-to-Value Ratio',
    definition: 'The ratio of a loan amount to the appraised value or purchase price of an asset, used to assess lending risk.',
    category: 'financial'
  },
  'CAP RATE': {
    term: 'Cap Rate',
    fullName: 'Capitalization Rate',
    definition: 'The ratio of net operating income to property asset value, used to estimate the investor\'s potential return on a real estate investment.',
    category: 'investment'
  },
  'NOI': {
    term: 'NOI',
    fullName: 'Net Operating Income',
    definition: 'Total revenue from a property minus all operating expenses, excluding financing costs and capital expenditures.',
    category: 'financial'
  },
  'DSCR': {
    term: 'DSCR',
    fullName: 'Debt Service Coverage Ratio',
    definition: 'The ratio of cash available for debt servicing to interest, principal, and lease payments, measuring ability to cover debt obligations.',
    category: 'financial'
  },
  'INVESTMENT-GRADE': {
    term: 'Investment-Grade',
    fullName: 'Investment-Grade Credit Rating',
    definition: 'Credit rating of BBB- or higher by S&P/Fitch or Baa3 or higher by Moody\'s, indicating low default risk and high creditworthiness.',
    category: 'financial'
  },
  'CORE ASSET': {
    term: 'Core Asset',
    fullName: 'Core Real Estate Asset',
    definition: 'Stabilized, high-quality property with low risk, steady cash flow, and minimal need for capital improvements or repositioning.',
    category: 'investment'
  },
  'VALUE-ADD': {
    term: 'Value-Add',
    fullName: 'Value-Add Strategy',
    definition: 'Investment strategy targeting underperforming assets requiring operational improvements, renovations, or repositioning to increase returns.',
    category: 'investment'
  },
  '1031': {
    term: '1031',
    fullName: '1031 Exchange',
    definition: 'Tax-deferred exchange allowing real estate investors to defer capital gains taxes by reinvesting proceeds from a property sale into a like-kind property.',
    category: 'tax'
  },
  '1031 EXCHANGE': {
    term: '1031 Exchange',
    fullName: '1031 Exchange',
    definition: 'Tax-deferred exchange allowing real estate investors to defer capital gains taxes by reinvesting proceeds from a property sale into a like-kind property.',
    category: 'tax'
  },
  'OZ': {
    term: 'OZ',
    fullName: 'Opportunity Zone',
    definition: 'Economically distressed community where new investments may be eligible for preferential tax treatment, including deferral and potential elimination of capital gains. Investors can defer taxes on capital gains by reinvesting in qualified OZ funds.',
    category: 'tax'
  },
  'QOZ': {
    term: 'QOZ',
    fullName: 'Qualified Opportunity Zone',
    definition: 'Economically distressed community where new investments may be eligible for preferential tax treatment, including deferral and potential elimination of capital gains.',
    category: 'tax'
  },
  'QOZB': {
    term: 'QOZB',
    fullName: 'Qualified Opportunity Zone Business',
    definition: 'A business operating in a Qualified Opportunity Zone that meets specific requirements for QOZ tax benefits.',
    category: 'tax'
  },
  'REIT': {
    term: 'REIT',
    fullName: 'Real Estate Investment Trust',
    definition: 'A company that owns, operates, or finances income-producing real estate, required to distribute at least 90% of taxable income to shareholders.',
    category: 'investment'
  },
  'ROTH IRA': {
    term: 'Roth IRA',
    fullName: 'Roth Individual Retirement Account',
    definition: 'Tax-advantaged retirement account funded with after-tax dollars, offering tax-free growth and withdrawals in retirement.',
    category: 'tax'
  },
  'TRADITIONAL IRA': {
    term: 'Traditional IRA',
    fullName: 'Traditional Individual Retirement Account',
    definition: 'Tax-advantaged retirement account with pre-tax contributions, taxable withdrawals, and required minimum distributions after age 73.',
    category: 'tax'
  },
  '401(K)': {
    term: '401(k)',
    fullName: '401(k) Retirement Plan',
    definition: 'Employer-sponsored retirement savings plan allowing employees to save pre-tax dollars, often with employer matching contributions.',
    category: 'tax'
  },
  'RMD': {
    term: 'RMD',
    fullName: 'Required Minimum Distribution',
    definition: 'Mandatory annual withdrawals from retirement accounts starting at age 73, calculated based on account balance and life expectancy.',
    category: 'tax'
  },
  'ESOP': {
    term: 'ESOP',
    fullName: 'Employee Stock Ownership Plan',
    definition: 'Qualified retirement plan that invests primarily in employer stock, offering tax benefits to both company and employees.',
    category: 'tax'
  },
  'STEP-UP': {
    term: 'Step-Up',
    fullName: 'Step-Up in Basis',
    definition: 'Tax provision that resets the cost basis of inherited assets to their fair market value at the date of death, eliminating built-in capital gains.',
    category: 'tax'
  },
  'AMT': {
    term: 'AMT',
    fullName: 'Alternative Minimum Tax',
    definition: 'Parallel tax system that ensures high earners pay minimum tax by limiting certain deductions and preferences.',
    category: 'tax'
  },
  'NIIT': {
    term: 'NIIT',
    fullName: 'Net Investment Income Tax',
    definition: '3.8% surtax on investment income for individuals with modified adjusted gross income above statutory thresholds ($200K single/$250K married).',
    category: 'tax'
  },
  'CAPTIVE FINANCE': {
    term: 'Captive Finance',
    fullName: 'Captive Finance Company',
    definition: 'A subsidiary company created to provide financing and credit services exclusively for its parent company or affiliated entities, effectively becoming your own internal bank.',
    category: 'financial'
  },
  'CAPTIVE': {
    term: 'Captive',
    fullName: 'Captive Finance Company',
    definition: 'A subsidiary company created to provide financing and credit services exclusively for its parent company or affiliated entities, effectively becoming your own internal bank.',
    category: 'financial'
  },
  'PRIVATE CREDIT': {
    term: 'Private Credit',
    fullName: 'Private Credit Fund',
    definition: 'Non-bank lending provided by private funds or institutional investors, offering direct loans to companies or individuals outside traditional banking channels.',
    category: 'investment'
  },
  'SECURITIES-BASED LENDING': {
    term: 'Securities-Based Lending',
    fullName: 'Securities-Based Lending',
    definition: 'Loans that use investment portfolios (stocks, bonds, mutual funds) as collateral, offering liquidity without selling assets.',
    category: 'financial'
  },
  'CREDIT LINE': {
    term: 'Credit Line',
    fullName: 'Line of Credit',
    definition: 'Pre-approved borrowing limit from a lender that can be drawn upon as needed, with interest charged only on the amount borrowed.',
    category: 'financial'
  },
  'CREDIT FACILITY': {
    term: 'Credit Facility',
    fullName: 'Credit Facility',
    definition: 'Formal lending arrangement between a borrower and lender specifying terms, limits, and conditions for borrowing.',
    category: 'financial'
  },
  'DIP': {
    term: 'DIP',
    fullName: 'Debtor-in-Possession Financing',
    definition: 'Special financing provided to companies in bankruptcy, offering super-priority status over existing debt and high interest rates.',
    category: 'investment'
  },
  'DIP FINANCING': {
    term: 'DIP Financing',
    fullName: 'Debtor-in-Possession Financing',
    definition: 'Special financing provided to companies in bankruptcy, offering super-priority status over existing debt and high interest rates.',
    category: 'investment'
  },
  'WATERFALL': {
    term: 'Waterfall',
    fullName: 'Waterfall Structure',
    definition: 'Distribution methodology in private equity determining the order and timing of profit distributions between limited partners and general partners.',
    category: 'investment'
  },
  'GP': {
    term: 'GP',
    fullName: 'General Partner',
    definition: 'The managing partner of a private equity or venture capital fund who makes investment decisions and typically receives carried interest.',
    category: 'investment'
  },
  'LP': {
    term: 'LP',
    fullName: 'Limited Partner',
    definition: 'An investor in a private equity or venture capital fund with limited liability and no management responsibilities.',
    category: 'investment'
  },
  'CARRY': {
    term: 'Carry',
    fullName: 'Carried Interest',
    definition: 'Performance-based compensation (typically 20%) paid to fund managers based on investment profits above a hurdle rate.',
    category: 'investment'
  },
  'HURDLE RATE': {
    term: 'Hurdle Rate',
    fullName: 'Hurdle Rate',
    definition: 'Minimum rate of return that a fund must achieve before the general partner can receive carried interest, typically 8%.',
    category: 'investment'
  },
  'CLAWBACK': {
    term: 'Clawback',
    fullName: 'Clawback Provision',
    definition: 'Mechanism requiring general partners to return previously distributed carried interest if the fund ultimately underperforms.',
    category: 'investment'
  },
  'IDGT': {
    term: 'IDGT',
    fullName: 'Intentionally Defective Grantor Trust',
    definition: 'Trust structure that is ignored for income tax purposes but recognized for estate tax purposes, allowing tax-efficient wealth transfers.',
    category: 'trust'
  },
  'CREDIT BIDDING': {
    term: 'Credit Bidding',
    fullName: 'Credit Bidding',
    definition: 'Right of secured lenders in bankruptcy to bid their debt amount (rather than cash) to acquire collateral assets.',
    category: 'investment'
  },
  'DISTRESSED': {
    term: 'Distressed',
    fullName: 'Distressed Assets',
    definition: 'Securities or assets of companies in financial trouble, bankruptcy, or default, typically trading at significant discounts.',
    category: 'investment'
  },
  'CHAPTER 11': {
    term: 'Chapter 11',
    fullName: 'Chapter 11 Bankruptcy',
    definition: 'U.S. bankruptcy reorganization process allowing companies to continue operations while restructuring debt under court protection. Enables DIP financing with super-priority claims that jump ahead of existing creditors.',
    category: 'legal'
  },
  'ESTATE TAX': {
    term: 'Estate Tax',
    fullName: 'Federal Estate Tax',
    definition: 'A federal tax on the transfer of the estate of a deceased person. The tax applies to property transferred via your will or according to state intestacy laws if you die without a will. Rate reaches 40% on amounts above the exemption.',
    category: 'tax'
  },
  'EXEMPTION': {
    term: 'Exemption',
    fullName: 'Estate Tax Exemption',
    definition: 'The amount you can transfer tax-free during life or at death. Currently $13.61M per person in 2024, scheduled to drop to approximately $7M in 2026 unless Congress acts.',
    category: 'tax'
  },
  'GIFT TAX': {
    term: 'Gift Tax',
    fullName: 'Federal Gift Tax',
    definition: 'A federal tax applied to transfers of property or money to others while receiving nothing (or less than full value) in return. Shares the same lifetime exemption as estate tax.',
    category: 'tax'
  },
  'CAPITAL GAINS': {
    term: 'Capital Gains',
    fullName: 'Capital Gains Tax',
    definition: 'Tax on profit from the sale of assets or investments. Long-term gains (assets held >1 year) are taxed at 0%, 15%, or 20% depending on income, plus 3.8% NIIT for high earners.',
    category: 'tax'
  },
  'TRUST': {
    term: 'Trust',
    fullName: 'Trust',
    definition: 'A legal arrangement where one party (trustee) holds property for the benefit of another (beneficiary). Can be revocable or irrevocable, with different tax and asset protection implications.',
    category: 'legal'
  },
  'GRANTOR': {
    term: 'Grantor',
    fullName: 'Grantor/Settlor',
    definition: 'The person who creates and funds a trust. Also called the settlor, trustor, or trust maker.',
    category: 'legal'
  },
  'BENEFICIARY': {
    term: 'Beneficiary',
    fullName: 'Trust Beneficiary',
    definition: 'A person or entity designated to receive benefits from a trust, estate, insurance policy, or retirement account.',
    category: 'legal'
  },
  'TRUSTEE': {
    term: 'Trustee',
    fullName: 'Trustee',
    definition: 'An individual or institution appointed to manage trust assets for the benefit of beneficiaries, with fiduciary duty to act in their best interest.',
    category: 'legal'
  },
  'INHERITANCE': {
    term: 'Inheritance',
    fullName: 'Inheritance',
    definition: 'Assets passed to heirs upon death. In the U.S., there is no federal inheritance tax, but beneficiaries receive a step-up in basis, potentially eliminating capital gains.',
    category: 'tax'
  },
  'TAX-DEFERRED': {
    term: 'Tax-Deferred',
    fullName: 'Tax-Deferred Growth',
    definition: 'Investment growth that is not taxed until funds are withdrawn, typically in retirement accounts like 401(k)s and Traditional IRAs.',
    category: 'tax'
  },
  'TAX-FREE': {
    term: 'Tax-Free',
    fullName: 'Tax-Free Income',
    definition: 'Income or growth that is never subject to federal income tax, such as Roth IRA distributions or municipal bond interest.',
    category: 'tax'
  },
  'IRREVOCABLE': {
    term: 'Irrevocable',
    fullName: 'Irrevocable Trust',
    definition: 'A trust that cannot be modified or terminated without beneficiary permission. Removes assets from grantor\'s estate but grantor gives up control.',
    category: 'trust'
  },
  'REVOCABLE': {
    term: 'Revocable',
    fullName: 'Revocable Trust',
    definition: 'A trust that can be altered or canceled by the grantor during their lifetime. Assets remain in grantor\'s estate but avoid probate.',
    category: 'trust'
  },
  'BREAK GLASS': {
    term: 'Break Glass',
    fullName: 'Break Glass Assets',
    definition: 'Emergency liquidity reserves held in hard assets (physical gold, art, crypto) stored outside the traditional banking system. Designed to be accessible during extreme crises when banks may freeze accounts or currencies collapse.',
    category: 'financial'
  },
  'HARD ASSETS': {
    term: 'Hard Assets',
    fullName: 'Hard Assets',
    definition: 'Tangible physical assets with intrinsic value independent of currency or financial systems. Includes gold, real estate, art, and other collectibles that maintain value during economic instability.',
    category: 'investment'
  },
  'COLD STORAGE': {
    term: 'Cold Storage',
    fullName: 'Cold Storage',
    definition: 'Offline storage of cryptocurrency or digital assets, typically on hardware wallets or paper wallets, protected from online hacking attempts. Essential for securing large crypto holdings.',
    category: 'investment'
  },
  'WEALTH TAX': {
    term: 'Wealth Tax',
    fullName: 'Wealth Tax',
    definition: 'Annual tax on total net worth above a certain threshold, distinct from income tax. Proposed in some jurisdictions as a way to tax accumulated wealth rather than just annual income.',
    category: 'tax'
  },
  'FREEPORT': {
    term: 'Freeport',
    fullName: 'Freeport Warehouse',
    definition: 'High-security storage facilities in tax-advantaged jurisdictions (Singapore, Switzerland, Luxembourg) where valuable assets can be stored duty-free and without triggering import taxes until removed.',
    category: 'investment'
  },
  'OFFSHORE': {
    term: 'Offshore',
    fullName: 'Offshore Jurisdiction',
    definition: 'Foreign jurisdiction used for legal tax optimization, asset protection, or privacy. Includes countries like Cayman Islands, BVI, and Switzerland with favorable tax and regulatory structures.',
    category: 'legal'
  },
  'PROPERTY RIGHTS': {
    term: 'Property Rights',
    fullName: 'Property Rights',
    definition: 'Legal framework protecting ownership and use of assets. Strong property rights jurisdictions have established legal systems that prevent government confiscation or arbitrary seizure of assets.',
    category: 'legal'
  },
  'POLITICAL NEUTRALITY': {
    term: 'Political Neutrality',
    fullName: 'Political Neutrality',
    definition: 'Status of countries (like Switzerland) that maintain independence from geopolitical conflicts and sanctions, providing stability for wealth preservation and reducing risk of asset freezes.',
    category: 'regulatory'
  },
  'GOLD VAULT': {
    term: 'Gold Vault',
    fullName: 'Gold Vault Storage',
    definition: 'Secure facility for storing physical gold bars and coins, typically in politically stable jurisdictions. Switzerland is known for private gold vaults with high security and confidentiality.',
    category: 'investment'
  },
  'CRYPTO': {
    term: 'Crypto',
    fullName: 'Cryptocurrency',
    definition: 'Digital or virtual currency using cryptography for security, operating independently of central banks. Bitcoin and Ethereum are the most established, used by some HNWIs as alternative stores of value.',
    category: 'investment'
  },
  'STIGMA': {
    term: 'Stigma',
    fullName: 'Offshore Stigma',
    definition: 'Negative perception or reputational risk associated with using offshore financial structures, despite their legality. Can affect business relationships and public image for high-profile individuals.',
    category: 'legal'
  },
  'CLAWBACK': {
    term: 'Clawback',
    fullName: 'Estate Tax Clawback',
    definition: 'Potential retroactive taxation of gifts or transfers made before tax law changes. The IRS has confirmed no clawback for gifts made before 2026 exemption reduction, creating a use-it-or-lose-it window.',
    category: 'tax'
  },
  'GIFT': {
    term: 'Gift',
    fullName: 'Gift Transfer',
    definition: 'Transfer of property or assets to another person without receiving full compensation in return. Subject to gift tax, but can use lifetime exemption to transfer wealth tax-free.',
    category: 'tax'
  },
  'CIO': {
    term: 'CIO',
    fullName: 'Chief Investment Officer',
    definition: 'A senior executive responsible for managing an organization\'s investment portfolio and strategy. For HNWIs, a CIO oversees asset allocation, risk management, and investment decisions across all holdings.',
    category: 'financial'
  },
  'OECD': {
    term: 'OECD',
    fullName: 'Organisation for Economic Co-operation and Development',
    definition: 'International organization of 38 developed countries that develops global standards on taxation, regulatory compliance, and economic policy. Key architect of tax transparency initiatives including CRS and Pillar Two global minimum tax.',
    category: 'regulatory'
  },
  'NHR': {
    term: 'NHR',
    fullName: 'Non-Habitual Resident',
    definition: 'Tax regime (notably in Portugal) offering favorable tax treatment for new residents, typically exempting foreign-source income for 10 years. Part of fiscal residence optimization strategies for HNWIs seeking legal tax reduction.',
    category: 'tax'
  },
  'PORTUGAL NHR': {
    term: 'Portugal NHR',
    fullName: 'Portugal Non-Habitual Resident Regime',
    definition: 'Portugal\'s tax program offering 10 years of favorable treatment for new residents, exempting most foreign-source income and offering reduced rates on Portuguese income. Requires 183+ days/year residence.',
    category: 'tax'
  },
  'PORTABLE INCOME': {
    term: 'Portable Income',
    fullName: 'Portable Income',
    definition: 'Income that can be earned from anywhere in the world, independent of physical location. Includes investment returns, royalties, consulting fees, and digital business income. Critical for fiscal residence optimization strategies.',
    category: 'financial'
  },
  'MARGINAL RATE': {
    term: 'Marginal Rate',
    fullName: 'Marginal Tax Rate',
    definition: 'The tax rate applied to your last dollar of income. In progressive tax systems, this is your highest tax bracket. For high earners, federal + state marginal rates can exceed 50% (37% federal + 13.3% California = 50.3%).',
    category: 'tax'
  },
  'OECD PILLAR TWO': {
    term: 'OECD Pillar Two',
    fullName: 'OECD Pillar Two Global Minimum Tax',
    definition: '15% global minimum corporate tax framework agreed by 140+ countries, effective 2024. Eliminates pure zero-tax havens by ensuring multinationals pay at least 15% tax globally. Shifts optimization from 0% jurisdictions to low-tax (0-15% personal) residency strategies.',
    category: 'tax'
  },
  'PILLAR TWO': {
    term: 'Pillar Two',
    fullName: 'OECD Pillar Two Global Minimum Tax',
    definition: '15% global minimum corporate tax framework agreed by 140+ countries, effective 2024. Eliminates pure zero-tax havens by ensuring multinationals pay at least 15% tax globally. Shifts optimization from 0% jurisdictions to low-tax (0-15% personal) residency strategies.',
    category: 'tax'
  },
  'FISCAL RESIDENCE': {
    term: 'Fiscal Residence',
    fullName: 'Fiscal Residence',
    definition: 'The country where you are considered a tax resident, typically determined by days of physical presence (183+ days/year) or center of vital interests. Your fiscal residence determines which country has primary right to tax your worldwide income.',
    category: 'tax'
  },
  'FISCAL RESIDENCE OPTIMIZATION': {
    term: 'Fiscal Residence Optimization',
    fullName: 'Fiscal Residence Optimization',
    definition: 'Legal strategy of establishing tax residency in a low-tax jurisdiction to reduce tax burden on portable income. Post-OECD Pillar Two, focuses on 0% personal tax countries (Dubai, Monaco) or special regimes (Switzerland forfait, Portugal NHR).',
    category: 'tax'
  },
  'DUBAI': {
    term: 'Dubai',
    fullName: 'Dubai (UAE) Tax Residency',
    definition: 'UAE emirate offering 0% personal income tax with Golden Visa program for investors, entrepreneurs, and professionals. Requires 183+ days/year presence. Popular post-Pillar Two destination for fiscal residence optimization.',
    category: 'tax'
  },
  'SWITZERLAND FORFAIT': {
    term: 'Switzerland Forfait',
    fullName: 'Swiss Lump-Sum Taxation (Forfait)',
    definition: 'Swiss cantonal tax regime allowing foreign nationals to pay tax based on living expenses rather than worldwide income. Minimum tax typically CHF 150K-400K/year depending on canton. Offers predictability and privacy for HNWIs.',
    category: 'tax'
  },
  'FORFAIT': {
    term: 'Forfait',
    fullName: 'Swiss Lump-Sum Taxation',
    definition: 'Swiss tax regime allowing eligible foreigners to pay fixed lump-sum tax based on living expenses instead of actual income. Minimum annual tax CHF 150K-400K depending on canton. Provides tax certainty and confidentiality.',
    category: 'tax'
  },
  'FOUNDATION': {
    term: 'Foundation',
    fullName: 'Private Foundation',
    definition: 'A tax-exempt nonprofit organization established by an individual or family to support charitable causes. Offers significant tax deductions, estate planning benefits, and family legacy building, but subject to strict IRS regulations including minimum 5% annual distributions and excise taxes on self-dealing.',
    category: 'trust'
  },
  'PRIVATE FOUNDATION': {
    term: 'Private Foundation',
    fullName: 'Private Foundation',
    definition: 'A tax-exempt nonprofit organization established by an individual or family to support charitable causes. Offers significant tax deductions, estate planning benefits, and family legacy building, but subject to strict IRS regulations including minimum 5% annual distributions and excise taxes on self-dealing.',
    category: 'trust'
  },
  'MONACO': {
    term: 'Monaco',
    fullName: 'Monaco Tax Residency',
    definition: 'Sovereign city-state offering 0% personal income tax for residents (excluding French nationals). Requires purchasing or renting property and demonstrating financial self-sufficiency. High cost of living but ultimate privacy and tax efficiency for portable income.',
    category: 'tax'
  },
  'QSBS': {
    term: 'QSBS',
    fullName: 'Qualified Small Business Stock',
    definition: 'IRS Section 1202 provision allowing up to $10M+ in tax-free capital gains when selling stock in a C-corp held for 5+ years. Requires C-corp structure with <$50M assets at issuance and active business operations. LLC structures do not qualify for QSBS benefits despite operational simplicity.',
    category: 'tax'
  },
  'QSBS STRUCTURE': {
    term: 'QSBS Structure',
    fullName: 'QSBS Qualifying Structure',
    definition: 'C-corporation structure that qualifies for Section 1202 tax benefits, enabling $10M+ in tax-free capital gains on exit. Must maintain C-corp status continuously, stay under $50M assets, and meet active business requirements. Alternative LLC structures offer operational flexibility but sacrifice QSBS eligibility.',
    category: 'tax'
  },
  'SECTION 1202': {
    term: 'Section 1202',
    fullName: 'IRC Section 1202',
    definition: 'Tax code provision allowing exclusion of up to 100% of capital gains (minimum $10M or 10x cost basis) from sale of qualified small business stock held 5+ years. Applies only to original-issue C-corp stock in companies with <$50M gross assets when issued.',
    category: 'tax'
  },
  'DELAWARE': {
    term: 'Delaware',
    fullName: 'Delaware Corporation',
    definition: 'Most popular state for incorporating businesses due to specialized Court of Chancery, extensive case law, flexible corporate governance, and strong director protections. Preferred by VCs and required for many institutional investments.',
    category: 'legal'
  },
  'VESTING': {
    term: 'Vesting',
    fullName: 'Equity Vesting',
    definition: 'Schedule determining when founders and employees earn full ownership of granted equity. Typical structure is 4-year vesting with 1-year cliff, protecting the company if early team members leave before contributing meaningful value.',
    category: 'legal'
  },
  'FOUNDER SHARES': {
    term: 'Founder Shares',
    fullName: 'Founder Equity',
    definition: 'Common stock issued to company founders at formation, typically subject to vesting schedules and buy-back provisions. Critical to structure properly for QSBS eligibility and future fundraising.',
    category: 'legal'
  },
  'OPERATING AGREEMENT': {
    term: 'Operating Agreement',
    fullName: 'LLC Operating Agreement',
    definition: 'Legal document governing ownership, management, and operations of an LLC. Defines member rights, profit distributions, decision-making authority, and transfer restrictions. More flexible than corporate bylaws but precludes QSBS benefits.',
    category: 'legal'
  },
  'BYLAWS': {
    term: 'Bylaws',
    fullName: 'Corporate Bylaws',
    definition: 'Internal rules governing a corporation\'s operations, including board structure, voting procedures, officer roles, and shareholder rights. Less flexible than LLC operating agreements but required for C-corp QSBS eligibility.',
    category: 'legal'
  },
  'ANGEL INVESTOR': {
    term: 'Angel Investor',
    fullName: 'Angel Investor',
    definition: 'High-net-worth individual who provides capital to early-stage startups, typically $25K-$500K in exchange for equity or convertible notes. Often the first outside capital after friends and family.',
    category: 'investment'
  },
  'SEED ROUND': {
    term: 'Seed Round',
    fullName: 'Seed Funding Round',
    definition: 'First significant institutional fundraising round, typically $500K-$3M, used to validate product-market fit. Often led by seed funds or angel syndicates with SAFE or convertible note structures.',
    category: 'investment'
  },
  'SAFE': {
    term: 'SAFE',
    fullName: 'Simple Agreement for Future Equity',
    definition: 'Investment instrument created by Y Combinator that converts to equity in future priced rounds. Simpler and faster than convertible notes, with no interest rate or maturity date. Commonly used in seed-stage fundraising.',
    category: 'investment'
  },
  'CONVERTIBLE NOTE': {
    term: 'Convertible Note',
    fullName: 'Convertible Note',
    definition: 'Short-term debt that converts to equity in a future financing round, typically with valuation cap and discount rate (15-25%). Allows early funding without setting company valuation, but accrues interest unlike SAFEs.',
    category: 'investment'
  },
  'VALUATION CAP': {
    term: 'Valuation Cap',
    fullName: 'Valuation Cap',
    definition: 'Maximum company valuation at which a SAFE or convertible note converts to equity, protecting early investors from dilution if the company\'s value increases significantly. Typical caps are $5M-$15M for seed-stage companies.',
    category: 'investment'
  },
  'CARRIED INTEREST': {
    term: 'Carried Interest',
    fullName: 'Carried Interest',
    definition: 'Share of investment profits (typically 20%) paid to fund managers, taxed as long-term capital gains rather than ordinary income. Subject to ongoing political debate and potential tax reform.',
    category: 'tax'
  },
  'PASS-THROUGH': {
    term: 'Pass-Through',
    fullName: 'Pass-Through Taxation',
    definition: 'Tax treatment where business income passes directly to owners and is taxed at individual rates. LLCs and S-corps use pass-through taxation, avoiding corporate-level tax but disqualifying from QSBS benefits.',
    category: 'tax'
  },
  'DOUBLE TAXATION': {
    term: 'Double Taxation',
    fullName: 'Corporate Double Taxation',
    definition: 'C-corp tax burden where profits are taxed at corporate level (21%) and again at individual level when distributed as dividends (up to 20% + 3.8% NIIT). Trade-off for QSBS eligibility and institutional investment access.',
    category: 'tax'
  },
  '83(B) ELECTION': {
    term: '83(b) Election',
    fullName: '83(b) Tax Election',
    definition: 'IRS filing allowing founders to pay tax on restricted stock at grant date (often $0 value) rather than at vesting. Must file within 30 days of grant. Critical for minimizing tax on founder equity and starting QSBS holding period.',
    category: 'tax'
  },
  'RESTRICTED STOCK': {
    term: 'Restricted Stock',
    fullName: 'Restricted Stock',
    definition: 'Company shares granted with vesting schedule or performance conditions. Typically issued to founders at formation with 4-year vesting. Without 83(b) election, taxable as ordinary income when shares vest.',
    category: 'legal'
  },
  'NNN': {
    term: 'NNN',
    fullName: 'Triple Net Lease',
    definition: 'Commercial lease where the tenant pays all property expenses (taxes, insurance, maintenance) in addition to rent. Landlord receives passive income with minimal management responsibilities but lower returns (5-6% cap rates). Contrast with active management properties that require hands-on oversight but offer higher returns (8-10%).',
    category: 'investment'
  },
  'NNN LEASE': {
    term: 'NNN Lease',
    fullName: 'Triple Net Lease',
    definition: 'Commercial lease where the tenant pays all property expenses (taxes, insurance, maintenance) in addition to rent. Landlord receives passive income with minimal management responsibilities but lower returns (5-6% cap rates). Contrast with active management properties that require hands-on oversight but offer higher returns (8-10%).',
    category: 'investment'
  },
  'TRIPLE NET': {
    term: 'Triple Net',
    fullName: 'Triple Net Lease',
    definition: 'Commercial lease where the tenant pays all property expenses (taxes, insurance, maintenance) in addition to rent. Landlord receives passive income with minimal management responsibilities but lower returns (5-6% cap rates). Contrast with active management properties that require hands-on oversight but offer higher returns (8-10%).',
    category: 'investment'
  },
  'BVI': {
    term: 'BVI',
    fullName: 'British Virgin Islands',
    definition: 'Popular offshore jurisdiction for establishing holding companies and investment structures. Known for strong privacy laws, zero corporate tax on foreign income, and business-friendly regulations. Commonly used for asset protection and international investment structuring.',
    category: 'legal'
  },
  'BVI HOLDING COMPANY': {
    term: 'BVI Holding Company',
    fullName: 'British Virgin Islands Holding Company',
    definition: 'Offshore company structure established in the British Virgin Islands primarily to hold assets, investments, or subsidiary companies. Offers tax efficiency (0% on foreign income), privacy protection, and flexible corporate governance. Commonly used for international real estate holdings and investment fund structures.',
    category: 'legal'
  }
};

// Function to check if a word is a defined term
export function isDefinedTerm(word: string): boolean {
  const cleanWord = word.replace(/[.,;:!?()]/g, '').toUpperCase();
  return cleanWord in TERM_DEFINITIONS;
}

// Function to get definition for a term
export function getTermDefinition(term: string): TermDefinition | undefined {
  const cleanTerm = term.replace(/[.,;:!?()]/g, '').toUpperCase();
  return TERM_DEFINITIONS[cleanTerm];
}

// Function to extract all defined terms from text
export function extractDefinedTerms(text: string): string[] {
  const words = text.split(/\s+/);
  const terms: string[] = [];

  for (const word of words) {
    const cleanWord = word.replace(/[.,;:!?()]/g, '');
    if (isDefinedTerm(cleanWord)) {
      terms.push(cleanWord);
    }
  }

  return Array.from(new Set(terms)); // Remove duplicates
}
