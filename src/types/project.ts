// Analyzed Project Types

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AnalyzedProject {
  id: string;
  tokenId: string;
  tokenName: string;
  tokenTicker: string;
  analyzedAt: string;
  analyzedBy: string;
  overallScore: number; // 0-100
  riskLevel: RiskLevel;
  marketCap: number;
  price: number;
  priceChange24h: number;
  category: string;
  summary: string;
  criteriaScores: {
    originality: number;
    marketPotential: number;
    tokenomics: number;
    security: number;
    community: number;
    adoption: number;
    risk: number;
  };
}

export interface ProjectFilters {
  search?: string;
  riskLevel?: RiskLevel | 'all';
  category?: string | 'all';
  sortBy?: 'date' | 'score' | 'marketCap' | 'name';
  sortOrder?: 'asc' | 'desc';
}
