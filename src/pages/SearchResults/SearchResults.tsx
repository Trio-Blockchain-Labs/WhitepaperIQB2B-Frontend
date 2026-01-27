import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts';
import { searchCoins } from '../../mock';
import { getCategoryIcon } from '../../components/icons';
import type { Coin } from '../../types';
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

// Map category names to icon types
const categoryToIconType: Record<string, string> = {
  'Layer 1': 'layer1',
  'Layer 2': 'layer2',
  'Layer 0': 'layer1',
  'DeFi': 'defi',
  'Oracle': 'oracle',
  'Meme': 'meme',
  'Payment': 'payment',
};

export const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<Coin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate search
    setTimeout(() => {
      const searchResults = searchCoins(query);
      setResults(searchResults);
      setIsLoading(false);
    }, 300);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/results?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTokenClick = (coin: Coin) => {
    navigate(`/token/${coin.ticker}`);
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
            {!isLoading && (
              <p className="search-results__count">
                {results.length} {results.length === 1 ? 'result' : 'results'} found
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="search-results__loading">
              <span className="search-results__spinner" />
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="search-results__list">
              {results.map((coin) => (
                <button
                  key={coin.id}
                  className="search-results__item"
                  onClick={() => handleTokenClick(coin)}
                >
                  <div className="search-results__item-icon">
                    {getCategoryIcon(categoryToIconType[coin.category || ''] || 'layer1', 24)}
                  </div>
                  <div className="search-results__item-info">
                    <span className="search-results__item-name">{coin.name}</span>
                    <span className="search-results__item-category">{coin.category}</span>
                  </div>
                  <span className="search-results__item-ticker">${coin.ticker}</span>
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
