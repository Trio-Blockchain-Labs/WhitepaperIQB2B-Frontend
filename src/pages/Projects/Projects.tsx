import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts';
import { projectService } from '../../services';
import { useToast } from '../../context/ToastContext';
import type { ProjectListItem, AnalysisStatus } from '../../types/project';
import './Projects.css';

// Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const SortIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="6" x2="11" y2="6" />
    <line x1="4" y1="12" x2="11" y2="12" />
    <line x1="4" y1="18" x2="13" y2="18" />
    <polyline points="15 15 18 18 21 15" />
    <line x1="18" y1="6" x2="18" y2="18" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

// Helpers
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface ProjectFilters {
  search: string;
  analysisStatus: AnalysisStatus | 'all';
  sortBy: 'date' | 'name';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useToast();

  // Set page title
  useEffect(() => {
    document.title = 'Analyzed Projects - WhitepaperIQ';
  }, []);

  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    analysisStatus: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page: filters.page,
          limit: filters.limit,
          search: filters.search || undefined,
        };
        
        if (filters.analysisStatus !== 'all') {
          params.analysisStatus = filters.analysisStatus;
        }
        
        const response = await projectService.listProjects(params);
        setProjects(response.data);
        setPagination(response.pagination);
        
        // Apply client-side sorting (API doesn't support sort)
        let sortedProjects = [...response.data];
        if (filters.sortBy === 'date') {
          sortedProjects.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
          });
        } else if (filters.sortBy === 'name') {
          sortedProjects.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return filters.sortOrder === 'asc' 
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA);
          });
        }
        setProjects(sortedProjects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load projects';
        showError(errorMessage);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchProjects();
    }, filters.search ? 500 : 0);
    
    return () => clearTimeout(timeoutId);
  }, [filters, showError]);

  const handleFilterChange = (key: keyof ProjectFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProjectClick = (project: ProjectListItem) => {
    // Navigate using coingeckoId if available, otherwise use project id
    if (project.coingeckoId) {
      navigate(`/token/${project.coingeckoId}?projectId=${encodeURIComponent(project.id)}`);
    } else {
      // If no coingeckoId, we might need to handle this differently
      // For now, try to navigate with slug or id
      navigate(`/token/${project.slug || project.id}?projectId=${encodeURIComponent(project.id)}`);
    }
  };

  return (
    <MainLayout>
      <div className="projects">
        <header className="projects__header">
          <div className="projects__header-left">
            <DocumentIcon />
            <h1 className="projects__title">Analyzed Projects</h1>
            <span className="projects__count">{pagination.total} projects</span>
          </div>
        </header>

        {/* Filters Bar */}
        <div className="projects__filters">
          <div className="projects__search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <button 
            className={`projects__filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon />
            <span>Filters</span>
          </button>

          <div className="projects__sort">
            <SortIcon />
            <select 
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [ProjectFilters['sortBy'], ProjectFilters['sortOrder']];
                setFilters(prev => ({ ...prev, sortBy, sortOrder }));
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
            <ChevronDownIcon />
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="projects__filters-extended">
            <div className="projects__filter-group">
              <label>Analysis Status</label>
              <select 
                value={filters.analysisStatus}
                onChange={(e) => handleFilterChange('analysisStatus', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PROCESSING">Processing</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        )}

        {/* Projects List */}
        {isLoading ? (
          <div className="projects__loading">
            <span className="projects__spinner" />
            <span>Loading projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="projects__empty">
            <DocumentIcon />
            <h3>No projects found</h3>
            <p>Try adjusting your filters or search criteria.</p>
          </div>
        ) : (
          <>
            <div className="projects__list">
              {projects.map(project => (
                <div 
                  key={project.id} 
                  className="projects__card"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="projects__card-header">
                    <div className="projects__card-title">
                      {project.imageUrl && (
                        <img 
                          src={project.imageUrl} 
                          alt={project.name}
                          className="projects__card-logo"
                        />
                      )}
                      <div>
                        <h3>{project.name}</h3>
                        {project.symbol && (
                          <span className="projects__card-ticker">{project.symbol}</span>
                        )}
                      </div>
                    </div>
                    {project.latestAnalysisStatus && (
                      <div 
                        className="projects__card-status"
                        style={{ 
                          backgroundColor: project.latestAnalysisStatus === 'COMPLETED' 
                            ? 'rgba(34, 197, 94, 0.15)' 
                            : project.latestAnalysisStatus === 'PROCESSING'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : project.latestAnalysisStatus === 'FAILED'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                          color: project.latestAnalysisStatus === 'COMPLETED' 
                            ? '#16a34a' 
                            : project.latestAnalysisStatus === 'PROCESSING'
                            ? '#2563eb'
                            : project.latestAnalysisStatus === 'FAILED'
                            ? '#dc2626'
                            : '#d97706',
                        }}
                      >
                        {project.latestAnalysisStatus}
                      </div>
                    )}
                  </div>

                  <div className="projects__card-meta">
                    <div className="projects__card-info">
                      {project.analysisCount > 0 && (
                        <span className="projects__card-analyses">
                          {project.analysisCount} {project.analysisCount === 1 ? 'analysis' : 'analyses'}
                        </span>
                      )}
                    </div>
                    <div className="projects__card-date">
                      <CalendarIcon />
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                  </div>

                  {project.websiteUrl && (
                    <div className="projects__card-footer">
                      <a 
                        href={project.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="projects__card-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="projects__pagination">
                <button
                  className="projects__pagination-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <span className="projects__pagination-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="projects__pagination-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Projects;
