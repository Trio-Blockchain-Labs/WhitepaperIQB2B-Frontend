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
