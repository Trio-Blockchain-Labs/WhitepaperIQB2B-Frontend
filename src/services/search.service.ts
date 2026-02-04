import { api, getErrorMessage } from './api';
import type { ApiResponse } from '../types';
import type { SearchResponse, TrendingResponse } from '../types/search';

const SEARCH_BASE_URL = '/search';

export const searchService = {
  /**
   * Search for projects/tokens
   * GET /api/v1/search
   * @param query - Search query string
   * @param limit - Maximum number of results (default: 10)
   */
  search: async (query: string, limit: number = 10): Promise<SearchResponse> => {
    try {
      const response = await api.get<ApiResponse<SearchResponse>>(SEARCH_BASE_URL, {
        params: {
          q: query,
          limit,
        },
      });
      
      if (response.data.success && response.data.data) {
        // Map thumb to imageUrl for backward compatibility in UI
        const mappedData: SearchResponse = {
          ...response.data.data,
          projects: response.data.data.projects || [],
          categories: response.data.data.categories || [],
        };
        return mappedData;
      }
      
      throw new Error('Failed to fetch search results');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get trending coins.
   * Backend: GET /api/v1/search with EMPTY query returns trending:
   * {
   *   projects: [...],
   *   pagination: { page, limit, total, totalPages }
   * }
   */
  getTrending: async (page: number = 1, limit: number = 20): Promise<TrendingResponse> => {
    try {
      const response = await api.get<ApiResponse<TrendingResponse>>(SEARCH_BASE_URL, {
        params: {
          page,
          limit,
        },
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        return {
          projects: data.projects || [],
          pagination: data.pagination || {
            page,
            limit,
            total: data.projects?.length || 0,
            totalPages: 1,
          },
        };
      }

      throw new Error('Failed to fetch trending coins');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
