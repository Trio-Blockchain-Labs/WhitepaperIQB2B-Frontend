import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts';
import { getCategoryIcon } from '../../components/icons';
import { searchService } from '../../services';
import { getErrorMessage } from '../../services/api';
import type { SearchResult } from '../../types';
import './SearchResults.css';

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const searchResponse = await searchService.search(query.trim()); // No limit - get all results
        setResults(searchResponse.projects || []);
        setTotalCount(searchResponse.projects?.length || 0);
      } catch (err) {
        console.error('Search failed:', err);
        setError(getErrorMessage(err));
        setResults([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/results?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTokenClick = (result: SearchResult) => {
    // Use coingeckoId (id field) for navigation
    navigate(`/token/${result.id}`);
  };

  return (
    <MainLayout>
      <div className="search-results">
        <div className="search-results__header">
          <form className="search-results__form" onSubmit={handleSearch}>
            <div className="search-results__input-wrapper">
              <span className="search-results__input-icon">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="search-results__input"
                placeholder="Search for any coin or token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-results__submit">
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="search-results__content">
          <div className="search-results__info">
            <h1 className="search-results__title">
              Search Results for "{query}"
            </h1>
            {!isLoading && !error && (
              <p className="search-results__count">
                {totalCount} {totalCount === 1 ? 'result' : 'results'} found
              </p>
            )}
          </div>

          {error ? (
            <div className="search-results__error">
              <p>{error}</p>
            </div>
          ) : isLoading ? (
            <div className="search-results__loading">
              <span className="search-results__spinner" />
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="search-results__list">
              {results.map((result) => (
                <button
                  key={result.id}
                  className="search-results__item"
                  onClick={() => handleTokenClick(result)}
                >
                  {result.image && (
                    <div className="search-results__item-icon">
                      <img 
                        src={result.image.includes('/thumb/') ? result.image.replace('/thumb/', '/small/') : result.image} 
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
                  {!result.image && (
                    <div className="search-results__item-icon">
                      {getCategoryIcon('layer1', 24)}
                    </div>
                  )}
                  <div className="search-results__item-info">
                    <span className="search-results__item-name">{result.name}</span>
                  </div>
                  <span className="search-results__item-ticker">${result.symbol}</span>
                  <span className="search-results__item-arrow">
                    <ArrowRightIcon />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="search-results__empty">
              <div className="search-results__empty-icon">
                <SearchIcon />
              </div>
              <h2 className="search-results__empty-title">No results found</h2>
              <p className="search-results__empty-text">
                We couldn't find any coins or tokens matching "{query}". Try a different search term.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchResults;
