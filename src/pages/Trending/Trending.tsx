import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts';
import { searchService } from '../../services';
import type { TrendingCoin, TrendingPagination } from '../../types/search';
import './Trending.css';

export const Trending: React.FC = () => {
  const navigate = useNavigate();
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [pagination, setPagination] = useState<TrendingPagination | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadPage = async (pageToLoad: number) => {
    try {
      setIsLoading(true);
      const response = await searchService.getTrending(pageToLoad, 20);
      setCoins(response.projects || []);
      setPagination(response.pagination);
      setPage(pageToLoad);
    } catch (error) {
      console.error('Failed to load trending list:', error);
      setCoins([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCoinClick = (coin: TrendingCoin) => {
    navigate(`/token/${coin.id}`);
  };

  const totalPages = pagination ? Math.min(pagination.totalPages, 10) : 10;

  return (
    <MainLayout>
      <div className="trending">
        <div className="trending__header">
          <h1 className="trending__title">Trending Tokens</h1>
          <p className="trending__subtitle">
            Top trending coins based on current market activity. Click any token to open its analysis.
          </p>
        </div>

        <div className="trending__content">
          {isLoading ? (
            <div className="trending__loading">Loading trending tokens...</div>
          ) : (
            <div className="trending__list">
              {coins.map((coin) => (
                <button
                  key={coin.id}
                  className="trending__item"
                  onClick={() => handleCoinClick(coin)}
                >
                  <div className="trending__item-main">
                    <div className="trending__item-avatar">
                      {coin.image && <img src={coin.image} alt={coin.name} />}
                    </div>
                    <div className="trending__item-info">
                      <span className="trending__item-name">{coin.name}</span>
                      <span className="trending__item-symbol">{coin.symbol.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="trending__item-stats">
                    <span className="trending__item-marketcap">
                      MCap: ${coin.marketCap.toLocaleString()}
                    </span>
                    <span
                      className={
                        'trending__item-change ' +
                        (coin.priceChange24h >= 0 ? 'positive' : 'negative')
                      }
                    >
                      {coin.priceChange24h >= 0 ? '+' : ''}
                      {coin.priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="trending__pagination">
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={
                'trending__page-btn ' + (p === page ? 'trending__page-btn--active' : '')
              }
              onClick={() => loadPage(p)}
              disabled={p === page}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

