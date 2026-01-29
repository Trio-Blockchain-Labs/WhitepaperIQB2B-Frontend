import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts';
import { 
  getAnalyzedProjects, 
  riskLevelColors, 
  projectCategories 
} from '../../mock';
import type { AnalyzedProject, ProjectFilters, RiskLevel } from '../../types';
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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

// Helpers
const formatNumber = (num: number): string => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  return `$${num.toLocaleString()}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
};

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<AnalyzedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    riskLevel: 'all',
    category: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      const data = await getAnalyzedProjects(filters);
      setProjects(data);
      setIsLoading(false);
    };
    fetchProjects();
  }, [filters]);

  const handleFilterChange = (key: keyof ProjectFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleProjectClick = (project: AnalyzedProject) => {
    navigate(`/token/${project.tokenTicker}`);
  };

  return (
    <MainLayout>
      <div className="projects">
        <header className="projects__header">
          <div className="projects__header-left">
            <DocumentIcon />
            <h1 className="projects__title">Analyzed Projects</h1>
            <span className="projects__count">{projects.length} projects</span>
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
              <option value="score-desc">Highest Score</option>
              <option value="score-asc">Lowest Score</option>
              <option value="marketCap-desc">Highest Market Cap</option>
              <option value="name-asc">Name A-Z</option>
            </select>
            <ChevronDownIcon />
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="projects__filters-extended">
            <div className="projects__filter-group">
              <label>Risk Level</label>
              <select 
                value={filters.riskLevel}
                onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>

            <div className="projects__filter-group">
              <label>Category</label>
              <select 
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {projectCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
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
          <div className="projects__list">
            {projects.map(project => (
              <div 
                key={project.id} 
                className="projects__card"
                onClick={() => handleProjectClick(project)}
              >
                <div className="projects__card-header">
                  <div className="projects__card-title">
                    <h3>{project.tokenName}</h3>
                    <span className="projects__card-ticker">{project.tokenTicker}</span>
                  </div>
                  <div 
                    className="projects__card-score"
                    style={{ 
                      backgroundColor: `${getScoreColor(project.overallScore)}20`,
                      color: getScoreColor(project.overallScore),
                      borderColor: getScoreColor(project.overallScore)
                    }}
                  >
                    {project.overallScore}
                  </div>
                </div>

                <p className="projects__card-summary">{project.summary}</p>

                <div className="projects__card-meta">
                  <div className="projects__card-info">
                    <span 
                      className="projects__card-risk"
                      style={{ 
                        backgroundColor: riskLevelColors[project.riskLevel as RiskLevel].bg,
                        color: riskLevelColors[project.riskLevel as RiskLevel].text,
                        borderColor: riskLevelColors[project.riskLevel as RiskLevel].border
                      }}
                    >
                      {project.riskLevel.charAt(0).toUpperCase() + project.riskLevel.slice(1)} Risk
                    </span>
                    <span className="projects__card-category">{project.category}</span>
                    <span className="projects__card-mcap">{formatNumber(project.marketCap)}</span>
                  </div>
                  <div className="projects__card-date">
                    <CalendarIcon />
                    <span>{formatDate(project.analyzedAt)}</span>
                  </div>
                </div>

                <div className="projects__card-footer">
                  <span className="projects__card-analyst">by {project.analyzedBy}</span>
                  <div className="projects__card-price">
                    <span className="projects__card-price-value">
                      ${project.price < 1 ? project.price.toFixed(8) : project.price.toLocaleString()}
                    </span>
                    <span className={`projects__card-change ${project.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                      {project.priceChange24h >= 0 ? '+' : ''}{project.priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Projects;
