import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../../layouts';
import { analysisService } from '../../services';
import type { AnalysisListItem, ListAnalysesResponse } from '../../types/analysis';
import { useNavigate } from 'react-router-dom';
import './Analyses.css';

const normalizeRiskLevel = (risk?: string | null): 'low' | 'medium' | 'high' | 'unknown' => {
  if (!risk) return 'unknown';
  const value = risk.toLowerCase();
  if (value.includes('high')) return 'high';
  if (value.includes('medium') || value.includes('moderate')) return 'medium';
  if (value.includes('low')) return 'low';
  return 'unknown';
};

export const Analyses: React.FC = () => {
  const navigate = useNavigate();

  // Set page title
  useEffect(() => {
    document.title = 'All Analyses - WhitepaperIQ';
  }, []);

  const [response, setResponse] = useState<ListAnalysesResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<'all' | string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await analysisService.listAnalyses({ page, limit: 20 });
        setResponse(data);
      } catch (err) {
        console.error('Failed to load analyses:', err);
        setError((err as Error).message || 'Failed to load analyses');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyses();
  }, [page]);

  const analyses = response?.data || [];

  const users = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    analyses.forEach((a) => {
      // Some analyses might not have user info (null from API)
      if (!a.user) return;
      const label = a.user.fullName || a.user.email || 'Unknown user';
      map.set(a.user.id, { id: a.user.id, label });
    });
    return Array.from(map.values());
  }, [analyses]);

  const filteredAnalyses = useMemo(() => {
    const byUser =
      selectedUserId === 'all'
        ? analyses
        : analyses.filter((a) => a.user && a.user.id === selectedUserId);

    const byStatus = byUser.filter((a) => a.status !== 'FAILED');

    if (!searchTerm.trim()) return byStatus;

    const term = searchTerm.toLowerCase();
    return byStatus.filter((a) => {
      const name = a.project.name.toLowerCase();
      const symbol = a.project.symbol?.toLowerCase() || '';
      return name.includes(term) || symbol.includes(term);
    });
  }, [analyses, selectedUserId, searchTerm]);

  const handleAnalysisClick = (analysis: AnalysisListItem) => {
    const project = analysis.project;
    if (project.coingeckoId) {
      navigate(`/token/${project.coingeckoId}?projectId=${encodeURIComponent(project.id)}`);
    } else {
      navigate(`/token/${project.slug || project.id}?projectId=${encodeURIComponent(project.id)}`);
    }
  };

  const handleUserFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedUserId(value === 'all' ? 'all' : value);
  };

  const pagination = response?.pagination;

  return (
    <MainLayout>
      <div className="analyses">
        <div className="analyses__header">
          <div>
            <h1 className="analyses__title">All Analyses</h1>
            {pagination && (
              <p className="analyses__subtitle">
                Showing page {pagination.page} of {pagination.totalPages} &middot;{' '}
                {pagination.total} analyses total
              </p>
            )}
          </div>
          <div className="analyses__filters">
            <label className="analyses__filter">
              <span>User</span>
              <select value={selectedUserId} onChange={handleUserFilterChange}>
                <option value="all">All users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="analyses__filter">
              <span>Search</span>
              <input
                type="text"
                className="analyses__search-input"
                placeholder="Search by project name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="analyses__error">
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="analyses__loading">Loading analyses...</div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="analyses__empty">No analyses found.</div>
        ) : (
          <div className="analyses__list">
            {filteredAnalyses.map((analysis) => (
              <button
                key={analysis.id}
                className="analyses__item"
                onClick={() => handleAnalysisClick(analysis)}
              >
                <div className="analyses__item-main">
                  <div className="analyses__item-project">
                    {analysis.project.imageUrl && (
                      <div className="analyses__item-avatar">
                        <img src={analysis.project.imageUrl} alt={analysis.project.name} />
                      </div>
                    )}
                    <div className="analyses__item-project-info">
                      <span className="analyses__item-project-name">
                        {analysis.project.name}{' '}
                        {analysis.project.symbol && (
                          <span className="analyses__item-project-symbol">
                            ({analysis.project.symbol.toUpperCase()})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="analyses__item-user">
                    <span className="analyses__item-user-name">
                      {analysis.user
                        ? analysis.user.fullName || analysis.user.email
                        : 'Unknown user'}
                    </span>
                    {analysis.user && (
                      <span className="analyses__item-user-email">
                        {analysis.user.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="analyses__item-side">
                  <span
                    className={
                      'analyses__item-status analyses__item-status--' +
                      analysis.status.toLowerCase()
                    }
                  >
                    {analysis.status}
                  </span>
                  {analysis.riskLevel && (
                    <div
                      className={
                        'analyses__item-risk analyses__item-risk--' +
                        normalizeRiskLevel(analysis.riskLevel)
                      }
                    >
                      <span className="analyses__item-risk-label">Risk Level</span>
                      <span className="analyses__item-risk-value">
                        {analysis.riskLevel}
                      </span>
                    </div>
                  )}
                  <span className="analyses__item-date">
                    {new Date(analysis.createdAt).toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="analyses__pagination">
            <button
              type="button"
              className="analyses__pagination-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </button>
            <span className="analyses__pagination-info">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              className="analyses__pagination-btn"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages || isLoading}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

