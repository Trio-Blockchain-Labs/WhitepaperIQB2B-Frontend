import { api, getErrorMessage } from './api';
import type { ApiResponse } from '../types';
import type { Analysis, CreateAnalysisPayload } from '../types/analysis';

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
