// Project Types - Based on API Documentation

// Import and re-export AnalysisStatus from analysis.ts to avoid duplicate exports
import type { AnalysisStatus } from './analysis';
export type { AnalysisStatus };

// Analyzed Project Types (for Projects page)
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

// Project API Types
export type DataSource = 'COINGECKO' | 'MANUAL';

export interface Project {
  id: string;
  coingeckoId: string | null;
  slug: string | null;
  name: string;
  symbol: string | null;
  imageUrl: string | null;
  contractAddress: string | null;
  websiteUrl: string | null;
  whitepaperUrl: string | null;
  dataSource: DataSource;
  createdAt: string;
}

export interface PriceData {
  currentPrice: number;
  priceChange24h: number;
  totalVolume: number;
  marketCap: number;
  fullyDilutedValuation: number;
  totalSupply: number;
  maxSupply: number;
}

export interface CreateProjectResponse {
  project: Project;
  priceData?: PriceData; // Only present when coingeckoId is provided
}

export interface CreateProjectPayload {
  coingeckoId?: string; // For CoinGecko-based creation
  name?: string; // For manual creation (required if no coingeckoId)
  symbol?: string;
  slug?: string;
  websiteUrl?: string;
  whitepaperUrl?: string;
  imageUrl?: string;
  contractAddress?: string;
}

// List Projects API Types

export interface ProjectListItem {
  id: string;
  coingeckoId: string | null;
  slug: string | null;
  name: string;
  symbol: string | null;
  imageUrl: string | null;
  contractAddress: string | null;
  websiteUrl: string | null;
  whitepaperUrl: string | null;
  dataSource: DataSource;
  createdAt: string;
  analysisCount: number;
  latestAnalysisStatus: AnalysisStatus | null;
}

export interface ListProjectsResponse {
  data: ProjectListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  dataSource?: DataSource;
  search?: string;
  analysisStatus?: AnalysisStatus;
}

// Get Project by ID API Types (includes latest analysis)
export interface ProjectAnalysisUser {
  id: string;
  email: string;
  fullName: string | null;
}

export interface ProjectWithLatestAnalysis extends Project {
  latestAnalysis?: (import('./analysis').Analysis & { user?: ProjectAnalysisUser }) | null;
}

// Project History API Types
export interface AnalysisHistoryItem {
  id: string;
  status: AnalysisStatus;
  createdAt: string;
  user: {
    id: string;
    fullName: string | null;
    email: string;
  };
}

export interface ProjectHistoryResponse {
  data: AnalysisHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProjectHistoryParams {
  page?: number;
  limit?: number;
}
