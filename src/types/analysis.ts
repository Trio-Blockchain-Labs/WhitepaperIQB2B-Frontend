// Analysis Types - Based on API Documentation

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/**
 * Coin Data from Analysis
 */
export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: {
    large: string;
    small: string;
    thumb: string;
  };
  links: {
    homepage: string[];
    whitepaper: string;
    reposUrl: {
      github: string[];
      bitbucket: string[];
    };
    blockchainSite: string[];
    twitterScreenName: string;
    subredditUrl: string;
    [key: string]: any;
  };
  tickers: Ticker[];
  marketData: MarketData;
  wtiAnalysis: WTIAnalysis;
  communityData: CommunityData;
  developerData: DeveloperData;
  genesisDate: string;
  [key: string]: any;
}

export interface Ticker {
  base: string;
  target: string;
  market: {
    name: string;
  };
  tradeUrl: string;
  wtiScore: number;
  convertedLast: number;
  convertedVolume: number;
  bidAskSpreadPercentage: number;
}

export interface MarketData {
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  marketCapRank: number;
  fullyDilutedValuation: number;
  totalVolume: number;
  totalSupply: number;
  maxSupply: number | null;
  circulatingSupply: number;
  high24h: number;
  low24h: number;
  ath: number;
  athChangePercentage: number;
  athDate: string;
  atl: number;
  atlChangePercentage: number;
  atlDate: string;
  [key: string]: any;
}

export interface WTIAnalysis {
  score: number;
  verdict: string;
  risk_level: string;
  details: {
    turnover_ratio: string;
    turnover_status: string;
    weighted_spread: string;
    penalty_multiplier: number;
    analyzed_ticker_count: number;
  };
}

export interface CommunityData {
  redditSubscribers: number;
  redditAveragePosts48h: number;
  redditAccountsActive48h: number;
  redditAverageComments48h: number;
  telegramChannelUserCount: number | null;
  facebookLikes: number | null;
}

export interface DeveloperData {
  forks: number;
  stars: number;
  subscribers: number;
  totalIssues: number;
  closedIssues: number;
  commitCount4Weeks: number;
  pullRequestsMerged: number;
  pullRequestContributors: number;
  codeAdditionsDeletions4Weeks: {
    additions: number;
    deletions: number;
  };
}

/**
 * Top Holders Data
 */
export interface TopHoldersData {
  token: {
    name: string;
    symbol: string;
  };
  addressTopHolders: {
    [chain: string]: {
      holders: Holder[];
      totalPctOfCap: number;
    };
  };
}

export interface Holder {
  address: {
    chain: string;
    address: string;
    contract: boolean;
    label?: {
      name: string;
    };
    entity?: {
      name: string;
      type: string;
      website?: string;
    };
  };
  balance: number;
  usd: number;
  pctOfCap: number;
}

/**
 * Treasury Data (Institutional Holdings)
 */
export interface TreasuryData {
  companies: CompanyHolding[];
  totalHoldings: number;
  totalValueUsd: number;
  marketCapDominance: number;
}

export interface CompanyHolding {
  name: string;
  country: string;
  totalHoldings: number;
  totalEntryValueUsd: number;
  totalCurrentValueUsd: number;
  percentageOfTotalSupply: number;
}

/**
 * Inflow & Outflow Data
 */
export interface InflowOutflowData {
  token: {
    id: string;
    symbol: string;
    marketCap: number;
  };
  current: {
    price: number;
    inflowCexVolume: number;
    outflowCexVolume: number;
    inflowDexVolume: number;
    outflowDexVolume: number;
  };
  previous: {
    price: number;
    inflowCexVolume: number;
    outflowCexVolume: number;
    inflowDexVolume: number;
    outflowDexVolume: number;
  };
}

/**
 * AI Insights
 */
export interface AIInsights {
  data: {
    summary: string;
    insights: AIInsight[];
    generatedAt: string;
  };
}

export interface AIInsight {
  title: string;
  summary: string;
  category: string;
  details: Record<string, any>;
}

/**
 * Detailed Analysis
 */
export interface DetailedAnalysis {
  data: {
    analysis: {
      status: string;
      criteria: Criteria[];
      riskLevel: string;
      overallAssessment: string;
    };
    maxScore: number;
    totalScore: number;
    generatedAt: string;
  };
}

export interface Criteria {
  id: number;
  name: string;
  score: number;
  maxScore: number;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
}

/**
 * Analysis Result Data
 */
export interface AnalysisResultData {
  coinData: CoinData;
  topHoldersData: TopHoldersData;
  treasuryData: TreasuryData;
  inflowOutflowData: InflowOutflowData;
  aiInsights: AIInsights;
  detailedAnalysis: DetailedAnalysis;
}

/**
 * Analysis Response from API
 */
export interface Analysis {
  id: string;
  organizationId: string;
  projectId: string;
  createdBy: string;
  status: AnalysisStatus;
  resultData: AnalysisResultData | null;
  aiTokenUsage: number;
  errorMessage: string | null;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    symbol: string;
    imageUrl: string;
  };
}

/**
 * Create Analysis Payload
 */
export interface CreateAnalysisPayload {
  projectId: string;
}
