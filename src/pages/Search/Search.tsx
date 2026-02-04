import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts';
import { trendingCoins, categories, recentAnalyses } from '../../mock';
import { getCategoryIcon } from '../../components/icons';
import { Logo } from '../../components/Logo';
import { searchService } from '../../services';
import type { SearchResult, Coin } from '../../types';
import './Search.css';

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const TrendingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const AnalysisIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    
    const trimmed = searchQuery.trim();

    // Require at least 2 characters before hitting the search endpoint
    if (trimmed.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);
    
    try {
      const searchResponse = await searchService.search(trimmed, 7); // Limit to 7 for autocomplete
      setResults(searchResponse.projects || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle form submit (Enter key or search button) - immediate navigation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      setShowDropdown(false);
      // Navigate immediately to results page (which will make its own API call)
      navigate(`/search/results?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Handle dropdown result click - go directly to token detail
  const handleResultClick = (result: SearchResult) => {
    setShowDropdown(false);
    setQuery('');
    // Use coingeckoId (id field) for navigation
    navigate(`/token/${result.id}`);
  };

  const handleTrendingClick = (coin: Coin) => {
    navigate(`/token/${coin.ticker}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/search/results?category=${categoryId}`);
  };

  const handleRecentClick = (ticker: string) => {
    navigate(`/token/${ticker}`);
  };

  const handleInputBlur = () => {
    // Delay to allow click on results
    setTimeout(() => setShowDropdown(false), 200);
  };

  const handleInputFocus = () => {
    if (query.trim() && results.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <MainLayout>
      <div className="search">
        <div className="search__centered">
          <div className="search__header">
            <Logo className="search__logo" size="lg" />
            <p className="search__tagline">AI-Powered Crypto Research & Analysis</p>
          </div>

          <form className="search__container" onSubmit={handleSubmit}>
            <div className="search__input-wrapper">
              <input
                type="text"
                className="search__input"
                placeholder="Search for any coin or token..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                autoFocus
              />
              <button type="submit" className="search__input-icon" aria-label="Search">
                <SearchIcon />
              </button>
            </div>

            {showDropdown && query.trim() && (
              <div className="search__results">
                {isSearching ? (
                  <div className="search__loading">
                    <span className="search__loading-spinner" />
                    Searching...
                  </div>
                ) : results.length > 0 ? (
                  <>
                    {results.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        className="search__result-item"
                        onClick={() => handleResultClick(result)}
                      >
                        {result.image && (
                          <div className="search__result-icon">
                            <img 
                              src={result.image.replace('/image/', '/small/')} 
                              alt={result.name}
                              onError={(e) => {
                                // Fallback to original image if small fails
                                const target = e.target as HTMLImageElement;
                                if (result.image && target.src !== result.image) {
                                  target.src = result.image;
                                }
                              }}
                            />
                          </div>
                        )}
                        <div className="search__result-info">
                          <span className="search__result-name">{result.name}</span>
                        </div>
                        <span className="search__result-ticker">${result.symbol}</span>
                      </button>
                    ))}
                    <div className="search__results-footer">
                      <button 
                        type="submit" 
                        className="search__view-all"
                      >
                        View all results for "{query}" →
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="search__no-results">
                    No coins found for "{query}"
                    <button 
                      type="submit" 
                      className="search__search-anyway"
                    >
                      Search anyway →
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Trending Section */}
          <div className="search__trending">
            <div className="search__section-header">
              <TrendingIcon />
              <span>Trending Now</span>
            </div>
            <div className="search__trending-list">
              {trendingCoins.map((coin) => (
                <button
                  key={coin.id}
                  className="search__trending-item"
                  onClick={() => handleTrendingClick(coin)}
                >
                  <span className="search__trending-name">{coin.name}</span>
                  <span className="search__trending-ticker">${coin.ticker}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="search__categories">
          <h3 className="search__section-title">Browse by Category</h3>
          <div className="search__categories-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                className="search__category-card"
                onClick={() => handleCategoryClick(category.id)}
              >
                <span className="search__category-icon">
                  {getCategoryIcon(category.iconType, 28)}
                </span>
                <span className="search__category-name">{category.name}</span>
                <span className="search__category-count">{category.count} projects</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Analyses Section */}
        <div className="search__recent">
          <h3 className="search__section-title">Recent Analyses</h3>
          <div className="search__recent-list">
            {recentAnalyses.map((analysis) => (
              <button 
                key={analysis.id} 
                className="search__recent-item"
                onClick={() => handleRecentClick(analysis.ticker)}
              >
                <div className="search__recent-icon">
                  <AnalysisIcon />
                </div>
                <div className="search__recent-info">
                  <span className="search__recent-name">
                    {analysis.coinName} <span className="search__recent-ticker">${analysis.ticker}</span>
                  </span>
                  <span className="search__recent-date">{analysis.date}</span>
                </div>
                <div className="search__recent-score" data-score={analysis.score >= 80 ? 'high' : analysis.score >= 60 ? 'medium' : 'low'}>
                  {analysis.score}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Search;
