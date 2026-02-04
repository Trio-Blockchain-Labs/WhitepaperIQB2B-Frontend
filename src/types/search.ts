// Search Types - Based on actual API response

/**
 * Search result item from API (coin)
 */
export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  image: string | null; // Image URL
}

/**
 * Search category from API
 */
export interface SearchCategory {
  name: string;
}

/**
 * Search API response (actual structure)
 */
export interface SearchResponse {
  projects: SearchResult[];
  categories: SearchCategory[];
}

// Trending search (coins + pagination)
export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  marketCapRank: number;
  priceChange24h: number;
  marketCap: number;
}

export interface TrendingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TrendingResponse {
  projects: TrendingCoin[];
  pagination: TrendingPagination;
}
