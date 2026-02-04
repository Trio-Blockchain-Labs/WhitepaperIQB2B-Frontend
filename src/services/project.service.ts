import { api, getErrorMessage } from './api';
import type { ApiResponse } from '../types';
import type { 
  CreateProjectResponse, 
  CreateProjectPayload,
  ListProjectsResponse,
  ListProjectsParams,
  ProjectListItem,
  ProjectWithLatestAnalysis,
  ProjectHistoryResponse,
  ProjectHistoryParams
} from '../types/project';

const PROJECT_BASE_URL = '/projects';

export const projectService = {
  /**
   * Create project or return existing (find-or-create pattern)
   * POST /api/v1/projects
   * @param payload - Project creation payload (coingeckoId for CoinGecko-based, or manual fields)
   */
  createProject: async (payload: CreateProjectPayload): Promise<CreateProjectResponse> => {
    try {
      const response = await api.post<ApiResponse<CreateProjectResponse>>(PROJECT_BASE_URL, payload);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to create or fetch project');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * List projects with analyses for current organization
   * GET /api/v1/projects
   * @param params - Query parameters (page, limit, dataSource, search, analysisStatus)
   */
  listProjects: async (params?: ListProjectsParams): Promise<ListProjectsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.dataSource) queryParams.append('dataSource', params.dataSource);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.analysisStatus) queryParams.append('analysisStatus', params.analysisStatus);
      
      const queryString = queryParams.toString();
      const url = queryString ? `${PROJECT_BASE_URL}?${queryString}` : PROJECT_BASE_URL;
      
      // API returns: { success: true, data: [...], pagination: {...} }
      // Axios wraps it: response.data = { success: true, data: [...], pagination: {...} }
      type ProjectsApiResponse = ApiResponse<ProjectListItem[]> & { pagination?: ListProjectsResponse['pagination'] };
      const response = await api.get<ProjectsApiResponse>(url);
      
      if (response.data.success && response.data.data) {
        // Pagination is at response.data level (same level as success and data)
        const pagination = response.data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: response.data.data.length,
          totalPages: Math.ceil((response.data.data.length || 0) / (params?.limit || 10)),
        };
        
        return {
          data: response.data.data,
          pagination,
        };
      }
      
      throw new Error('Failed to fetch projects');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get project by ID (includes latestAnalysis)
   * GET /api/v1/projects/:id
   * @param id - Project UUID
   */
  getProjectById: async (id: string): Promise<ProjectWithLatestAnalysis> => {
    try {
      const response = await api.get<ApiResponse<ProjectWithLatestAnalysis>>(`${PROJECT_BASE_URL}/${id}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to fetch project');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get project analysis history
   * GET /api/v1/projects/:id/history
   * @param id - Project UUID
   * @param params - Query parameters (page, limit)
   */
  getProjectHistory: async (id: string, params?: ProjectHistoryParams): Promise<ProjectHistoryResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const queryString = queryParams.toString();
      const url = queryString ? `${PROJECT_BASE_URL}/${id}/history?${queryString}` : `${PROJECT_BASE_URL}/${id}/history`;
      
      type HistoryApiResponse = ApiResponse<ProjectHistoryResponse['data']> & { pagination?: ProjectHistoryResponse['pagination'] };
      const response = await api.get<HistoryApiResponse>(url);
      
      if (response.data.success && response.data.data) {
        const pagination = response.data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: response.data.data.length,
          totalPages: Math.ceil((response.data.data.length || 0) / (params?.limit || 10)),
        };
        
        return {
          data: response.data.data,
          pagination,
        };
      }
      
      throw new Error('Failed to fetch project history');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
