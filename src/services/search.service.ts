import { api, getErrorMessage } from './api';
import type { ApiResponse } from '../types';
import type { SearchResponse } from '../types/search';

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
};
