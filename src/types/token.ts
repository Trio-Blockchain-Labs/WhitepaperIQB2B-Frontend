// Token Detail Types
export interface TokenHeader {
  id: string;
  name: string;
  ticker: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  fdv: number;
  currentSupply: number;
  maxSupply: number | null; // null means infinite
}

export interface HolderInfo {
  address: string;
  label: string;
  amount: number;
  value: number;
}

export interface ExchangeInfo {
  name: string;
  volume: number;
  wtiScore: number;
}

export interface FlowData {
  type: 'DEX Inf' | 'DEX Outf' | 'CEX Inf' | 'CEX Outf';
  previous24h: number;
  current: number;
}

export interface InstitutionalHolding {
  name: string;
  type: 'company' | 'country' | 'etf' | 'fund';
  amount: number;
  value: number;
  percentageOfSupply: number;
}

export interface SocialData {
  sentimentType: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sentimentPercentage: number;
  weeklyCommitsChange: number;
}

export interface CriteriaAssessment {
  id: number;
  title: string;
  description: string;
  highlightText?: string;
  stats?: {
    label: string;
    value: string;
    change?: string;
  }[];
}

export interface AIInsight {
  section: string;
  content: string;
}

export interface TokenAnalysis {
  id: string;
  tokenId: string;
  analyzedAt: string;
  topHolders: HolderInfo[];
  exchanges: ExchangeInfo[];
  flowData: FlowData[];
  institutionalHoldings: InstitutionalHolding[];
  socialData: SocialData;
  criteriaAssessments: CriteriaAssessment[];
  aiInsights: AIInsight[];
}

export interface TokenDetail {
  header: TokenHeader;
  hasAnalysis: boolean;
  previousAnalysisId?: string;
  previousAnalysisDate?: string;
}

// Analysis Status
export type AnalysisStatus = 'idle' | 'loading' | 'completed' | 'error';
