import { api, getErrorMessage } from './api';
import type { ApiResponse } from '../types';
import type { Analysis, CreateAnalysisPayload, AnalysisListItem, ListAnalysesResponse, ListAnalysesParams } from '../types/analysis';

const ANALYSIS_BASE_URL = '/analyses';

export const analysisService = {
  /**
   * Create new analysis
   * POST /api/v1/analyses
   * @param payload - Analysis creation payload (projectId)
   * Note: Analysis processing can take 30-60 seconds, so timeout is set to 120 seconds
   */
  createAnalysis: async (payload: CreateAnalysisPayload): Promise<Analysis> => {
    try {
      const response = await api.post<ApiResponse<Analysis>>(ANALYSIS_BASE_URL, payload, {
        timeout: 120000, // 120 seconds (2 minutes) - analysis can take 30-60 seconds
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to create analysis');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get analysis by ID
   * GET /api/v1/analyses/:id
   * @param id - Analysis ID
   */
  getAnalysis: async (id: string): Promise<Analysis> => {
    try {
      const response = await api.get<ApiResponse<Analysis>>(`${ANALYSIS_BASE_URL}/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch analysis');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * List analyses (paginated)
   * GET /api/v1/analyses
   */
  listAnalyses: async (params?: ListAnalysesParams): Promise<ListAnalysesResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const url = queryString ? `${ANALYSIS_BASE_URL}?${queryString}` : ANALYSIS_BASE_URL;

      type AnalysesApiResponse = ApiResponse<AnalysisListItem[]> & {
        pagination?: ListAnalysesResponse['pagination'];
      };

      const response = await api.get<AnalysesApiResponse>(url);

      if (response.data.success && response.data.data) {
        const pagination = response.data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 20,
          total: response.data.data.length,
          totalPages: 1,
        };

        return {
          data: response.data.data,
          pagination,
        };
      }

      throw new Error('Failed to fetch analyses');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Download analysis PDF
   * GET /api/v1/analyses/:id/pdf
   * @param id - Analysis ID
   */
  downloadAnalysisPdf: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get(`${ANALYSIS_BASE_URL}/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
