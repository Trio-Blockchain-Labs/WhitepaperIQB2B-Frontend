import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts';
import { Button } from '../../components/common';
import { getTokenDetail, getTokenAnalysis, startNewAnalysis } from '../../mock';
import type { TokenDetail as TokenDetailType, TokenAnalysis, AnalysisStatus, InstitutionalHolding } from '../../types';
import './TokenDetail.css';

// Icons
const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const CompareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);

const ChevronIcon = ({ direction = 'left' }: { direction?: 'left' | 'right' }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    style={{ transform: direction === 'right' ? 'rotate(180deg)' : 'none' }}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// Format helpers
const formatNumber = (num: number): string => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  return `$${num.toLocaleString()}`;
};

const formatSupply = (num: number): string => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  return num.toLocaleString();
};

const getHoldingTypeIcon = (type: InstitutionalHolding['type']) => {
  switch (type) {
    case 'country':
      return <GlobeIcon />;
    default:
      return <BuildingIcon />;
  }
};

const getHoldingTypeLabel = (type: InstitutionalHolding['type']) => {
  switch (type) {
    case 'company':
      return 'Company';
    case 'country':
      return 'Government';
    case 'etf':
      return 'ETF';
    case 'fund':
      return 'Fund';
    default:
      return type;
  }
};

export const TokenDetail: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  
  const [tokenData, setTokenData] = useState<TokenDetailType | null>(null);
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Slider state for Exchanges/Inflow card
  const [exchangeSlide, setExchangeSlide] = useState<'exchanges' | 'inflow'>('exchanges');

  useEffect(() => {
    // Reset analysis state when ticker changes
    // This ensures every token page starts with blurred analysis sections
    setAnalysis(null);
    setAnalysisStatus('idle');
    
    const fetchTokenData = async () => {
      if (!ticker) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Only fetch basic token data (header info)
        // Analysis data is NOT fetched automatically - user must click "Start Analysis"
        const data = await getTokenDetail(ticker);
        if (data) {
          setTokenData(data);
        } else {
          setError('Token not found');
        }
      } catch {
        setError('Failed to load token data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenData();
  }, [ticker]);

  const handleStartAnalysis = async () => {
    if (!ticker) return;
    
    setAnalysisStatus('loading');
    
    try {
      const result = await startNewAnalysis(ticker);
      setAnalysis(result);
      setAnalysisStatus('completed');
    } catch {
      setAnalysisStatus('error');
    }
  };

  const handleViewPreviousAnalysis = async () => {
    if (!tokenData?.previousAnalysisId) return;
    
    setAnalysisStatus('loading');
    
    try {
      const result = await getTokenAnalysis(tokenData.previousAnalysisId);
      if (result) {
        setAnalysis(result);
        setAnalysisStatus('completed');
      }
    } catch {
      setAnalysisStatus('error');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="token-detail__loading">
          <span className="token-detail__spinner" />
          <span>Loading token data...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !tokenData) {
    return (
      <MainLayout>
        <div className="token-detail__error">
          <h2>Token Not Found</h2>
          <p>{error || 'The requested token could not be found.'}</p>
          <Button onClick={() => navigate('/search')}>Back to Search</Button>
        </div>
      </MainLayout>
    );
  }

  const { header } = tokenData;
  const isAnalyzed = analysisStatus === 'completed' && analysis;
  const isAnalyzing = analysisStatus === 'loading';

  // Default mock data
  const defaultHoldings: InstitutionalHolding[] = [
    { name: 'Grayscale', type: 'fund', amount: 2800000, value: 8960000000, percentageOfSupply: 2.33 },
    { name: 'United States', type: 'country', amount: 198000, value: 633600000, percentageOfSupply: 0.16 },
    { name: 'BlackRock', type: 'etf', amount: 450000, value: 1440000000, percentageOfSupply: 0.37 },
    { name: 'Fidelity', type: 'etf', amount: 380000, value: 1216000000, percentageOfSupply: 0.32 },
    { name: 'MicroStrategy', type: 'company', amount: 150000, value: 480000000, percentageOfSupply: 0.12 },
    { name: 'Germany', type: 'country', amount: 50000, value: 160000000, percentageOfSupply: 0.04 },
  ];

  const defaultFlowData = [
    { type: 'DEX Inf' as const, previous24h: 210000000, current: 85000000 },
    { type: 'DEX Outf' as const, previous24h: -180000000, current: -120000000 },
    { type: 'CEX Inf' as const, previous24h: 450000000, current: 620000000 },
    { type: 'CEX Outf' as const, previous24h: -490000000, current: -310000000 },
  ];

  return (
    <MainLayout>
      <div className="token-detail">
        {/* Header Section */}
        <header className="token-detail__header">
          <div className="token-detail__header-left">
            <div className="token-detail__title-row">
              <h1 className="token-detail__name">
                {header.name} <span className="token-detail__ticker">({header.ticker})</span>
              </h1>
              <span className={`token-detail__change ${header.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                {header.priceChange24h >= 0 ? '↗' : '↘'} {Math.abs(header.priceChange24h).toFixed(2)}%
              </span>
            </div>
            <div className="token-detail__price-row">
              <span className="token-detail__price">${header.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <div className="token-detail__actions">
                <button className="token-detail__action-btn" title="Share">
                  <ShareIcon />
                </button>
                <button className="token-detail__action-btn" title="Refresh">
                  <RefreshIcon />
                </button>
                <button className="token-detail__action-btn" title="Compare">
                  <CompareIcon />
                </button>
              </div>
            </div>
          </div>
          <div className="token-detail__header-right">
            <div className="token-detail__stat">
              <span className="token-detail__stat-label">24H VOLUME</span>
              <span className="token-detail__stat-value">{formatNumber(header.volume24h)}</span>
            </div>
            <div className="token-detail__stat">
              <span className="token-detail__stat-label">MARKET CAP</span>
              <span className="token-detail__stat-value">{formatNumber(header.marketCap)}</span>
            </div>
            <div className="token-detail__stat">
              <span className="token-detail__stat-label">FDV</span>
              <span className="token-detail__stat-value">{formatNumber(header.fdv)}</span>
            </div>
            <div className="token-detail__stat">
              <span className="token-detail__stat-label">CURRENT SUPP</span>
              <span className="token-detail__stat-value">{formatSupply(header.currentSupply)}</span>
            </div>
            <div className="token-detail__stat">
              <span className="token-detail__stat-label">MAX SUPP</span>
              <span className="token-detail__stat-value">{header.maxSupply ? formatSupply(header.maxSupply) : '∞'}</span>
            </div>
          </div>
        </header>

        {/* Analysis Action Section */}
        {!isAnalyzed && (
          <div className="token-detail__analysis-prompt">
            <div className="token-detail__analysis-content">
              <h2>Ready to Analyze</h2>
              <p>Start a comprehensive AI-powered analysis to unlock detailed insights about {header.name}.</p>
              <div className="token-detail__analysis-actions">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleStartAnalysis}
                  isLoading={isAnalyzing}
                  leftIcon={<SparkleIcon />}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
                </Button>
                {tokenData.hasAnalysis && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleViewPreviousAnalysis}
                    leftIcon={<HistoryIcon />}
                    disabled={isAnalyzing}
                  >
                    View Previous Analysis
                  </Button>
                )}
              </div>
              {tokenData.hasAnalysis && tokenData.previousAnalysisDate && (
                <p className="token-detail__previous-date">
                  Last analyzed: {new Date(tokenData.previousAnalysisDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="token-detail__grid">
          {/* Top 100 Holders */}
          <div className={`token-detail__card token-detail__card--fixed ${!isAnalyzed ? 'token-detail__card--blur' : ''}`}>
            <div className="token-detail__card-header">
              <h3>Top 100 Holders</h3>
            </div>
            <div className="token-detail__card-body">
              <div className="token-detail__card-scrollable">
                <div className="token-detail__holders-header">
                  <span>Address (Label)</span>
                  <span>Amount Value ($)</span>
                </div>
                <div className="token-detail__holders-list">
                  {(isAnalyzed ? analysis.topHolders : [
                    { address: '0x742d...44e', label: 'Binance 7', amount: 1240000, value: 3900000000 },
                    { address: '0x3f5c...92a', label: 'Kraken 4', amount: 850200, value: 2700000000 },
                    { address: '0xd90e...12b', label: 'Cold Wallet', amount: 430000, value: 1300000000 },
                    { address: '0x55d3...6a1', label: 'Whale', amount: 125000, value: 400000000 },
                  ]).map((holder, i) => (
                    <div key={i} className="token-detail__holder-row">
                      <span className="token-detail__holder-address">
                        {holder.address} <span className="token-detail__holder-label">({holder.label})</span>
                      </span>
                      <span className="token-detail__holder-amount">{holder.amount.toLocaleString()}</span>
                      <span className="token-detail__holder-value">{formatNumber(holder.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {isAnalyzed && analysis.aiInsights.find(i => i.section === 'Top 100 Holders') && (
                <div className="token-detail__ai-insight">
                  <span className="token-detail__ai-label">AI INSIGHT</span>
                  <p>{analysis.aiInsights.find(i => i.section === 'Top 100 Holders')?.content}</p>
                </div>
              )}
            </div>
          </div>

          {/* Exchanges / Inflow & Outflow Slider */}
          <div className={`token-detail__card token-detail__card--fixed ${!isAnalyzed ? 'token-detail__card--blur' : ''}`}>
            <div className="token-detail__card-header">
              <h3>{exchangeSlide === 'exchanges' ? 'Exchanges' : 'Inflow & Outflow'}</h3>
              <div className="token-detail__card-nav">
                <button 
                  className={`token-detail__nav-btn ${exchangeSlide === 'exchanges' ? 'active' : ''}`}
                  onClick={() => setExchangeSlide('exchanges')}
                  title="Exchanges"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button 
                  className={`token-detail__nav-btn ${exchangeSlide === 'inflow' ? 'active' : ''}`}
                  onClick={() => setExchangeSlide('inflow')}
                  title="Inflow & Outflow"
                >
                  <ChevronIcon direction="right" />
                </button>
              </div>
            </div>
            <div className="token-detail__card-body">
              <div className="token-detail__card-scrollable">
                {/* Exchanges Slide */}
                {exchangeSlide === 'exchanges' && (
                  <div className="token-detail__exchanges-list">
                    {(isAnalyzed ? analysis.exchanges : [
                      { name: 'Binance', volume: 4200000000, wtiScore: 9.8 },
                      { name: 'Coinbase', volume: 2100000000, wtiScore: 9.2 },
                      { name: 'OKX', volume: 1800000000, wtiScore: 8.5 },
                      { name: 'Bybit', volume: 1400000000, wtiScore: 8.1 },
                    ]).map((exchange, i) => (
                      <div key={i} className="token-detail__exchange-row">
                        <span className="token-detail__exchange-name">{exchange.name}</span>
                        <span className="token-detail__exchange-volume">{formatNumber(exchange.volume)}</span>
                        <span className="token-detail__exchange-wti">WTI: {exchange.wtiScore}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inflow & Outflow Slide */}
                {exchangeSlide === 'inflow' && (
                  <div className="token-detail__flow-grid">
                    <div className="token-detail__flow-column">
                      <span className="token-detail__flow-label">PREVIOUS (24H)</span>
                      {(isAnalyzed ? analysis.flowData : defaultFlowData).map((flow, i) => (
                        <div key={i} className="token-detail__flow-row">
                          <span>{flow.type}</span>
                          <span className={flow.previous24h >= 0 ? 'positive' : 'negative'}>
                            {flow.previous24h >= 0 ? '+' : ''}{formatNumber(Math.abs(flow.previous24h))}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="token-detail__flow-column">
                      <span className="token-detail__flow-label">TODAY (CURRENT)</span>
                      {(isAnalyzed ? analysis.flowData : defaultFlowData).map((flow, i) => (
                        <div key={i} className="token-detail__flow-row">
                          <span>{flow.type}</span>
                          <span className={flow.current >= 0 ? 'positive' : 'negative'}>
                            {flow.current >= 0 ? '+' : ''}{formatNumber(Math.abs(flow.current))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Slide Indicators */}
              <div className="token-detail__slide-indicators">
                <button 
                  className={`token-detail__slide-dot ${exchangeSlide === 'exchanges' ? 'active' : ''}`}
                  onClick={() => setExchangeSlide('exchanges')}
                  aria-label="View Exchanges"
                />
                <button 
                  className={`token-detail__slide-dot ${exchangeSlide === 'inflow' ? 'active' : ''}`}
                  onClick={() => setExchangeSlide('inflow')}
                  aria-label="View Inflow & Outflow"
                />
              </div>
              
              {/* AI Insight - Always at bottom */}
              <div className="token-detail__ai-insight">
                <span className="token-detail__ai-label">AI INSIGHT</span>
                <p>
                  {isAnalyzed 
                    ? (exchangeSlide === 'exchanges' 
                        ? analysis.aiInsights.find(i => i.section === 'Exchanges')?.content
                        : analysis.aiInsights.find(i => i.section === 'Inflow & Outflow')?.content
                      )
                    : (exchangeSlide === 'exchanges'
                        ? 'Liquidity profile analysis will be available after running the analysis.'
                        : 'CEX/DEX flow analysis will be available after running the analysis.'
                      )
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Report */}
          <div className={`token-detail__card token-detail__card--report ${!isAnalyzed ? 'token-detail__card--blur' : ''}`}>
            <div className="token-detail__card-header">
              <div>
                <h3>Detailed Report</h3>
                <p className="token-detail__report-subtitle">Deep-dive technical & fundamental audit</p>
              </div>
              <Button variant="primary" size="sm" leftIcon={<DownloadIcon />}>
                Export as PDF
              </Button>
            </div>
            <div className="token-detail__card-body">
              <div className="token-detail__card-scrollable token-detail__card-scrollable--tall">
                <h4 className="token-detail__criteria-title">7 CRITERIA RISK ASSESSMENT</h4>
                <div className="token-detail__criteria-list">
                  {(isAnalyzed ? analysis.criteriaAssessments : [
                    { id: 1, title: 'Originality & Innovation', description: 'Assessment pending analysis...' },
                    { id: 2, title: 'Market Potential & Competitive Landscape', description: 'Assessment pending analysis...' },
                    { id: 3, title: 'Tokenomics & Sustainability', description: 'Assessment pending analysis...' },
                    { id: 4, title: 'Security & Compliance', description: 'Assessment pending analysis...' },
                    { id: 5, title: 'Community & Ecosystem Growth', description: 'Assessment pending analysis...' },
                    { id: 6, title: 'Adoption Metrics', description: 'Assessment pending analysis...' },
                    { id: 7, title: 'Risk Assessment', description: 'Assessment pending analysis...' },
                  ]).map((criteria) => (
                    <div key={criteria.id} className="token-detail__criteria-item">
                      <span className="token-detail__criteria-number">{criteria.id}</span>
                      <div className="token-detail__criteria-content">
                        <h5>{criteria.title}</h5>
                        <p>{criteria.description}</p>
                        {criteria.highlightText && (
                          <p className="token-detail__criteria-highlight">{criteria.highlightText}</p>
                        )}
                        {criteria.stats && (
                          <div className="token-detail__criteria-stats">
                            {criteria.stats.map((stat, i) => (
                              <div key={i} className="token-detail__criteria-stat">
                                <span className="token-detail__criteria-stat-label">{stat.label}</span>
                                <span className={`token-detail__criteria-stat-value ${stat.change ? 'has-change' : ''}`}>
                                  {stat.value} {stat.change && <span>({stat.change})</span>}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Holdings - Separate Card */}
          <div className={`token-detail__card token-detail__card--fixed ${!isAnalyzed ? 'token-detail__card--blur' : ''}`}>
            <div className="token-detail__card-header">
              <h3>Institutional Holdings</h3>
            </div>
            <div className="token-detail__card-body">
              <div className="token-detail__card-scrollable">
                <div className="token-detail__holdings-list">
                  {(isAnalyzed ? analysis.institutionalHoldings : defaultHoldings).map((holding, i) => (
                    <div key={i} className="token-detail__holding-row">
                      <div className="token-detail__holding-info">
                        <span className="token-detail__holding-icon">
                          {getHoldingTypeIcon(holding.type)}
                        </span>
                        <div className="token-detail__holding-details">
                          <span className="token-detail__holding-name">{holding.name}</span>
                          <span className="token-detail__holding-type">{getHoldingTypeLabel(holding.type)}</span>
                        </div>
                      </div>
                      <div className="token-detail__holding-stats">
                        <span className="token-detail__holding-value">{formatNumber(holding.value)}</span>
                        <span className="token-detail__holding-percent">{holding.percentageOfSupply.toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {isAnalyzed && analysis.aiInsights.find(i => i.section === 'Institutional Holdings') && (
                <div className="token-detail__ai-insight">
                  <span className="token-detail__ai-label">AI INSIGHT</span>
                  <p>{analysis.aiInsights.find(i => i.section === 'Institutional Holdings')?.content}</p>
                </div>
              )}
            </div>
          </div>

          {/* Social & Developer Data */}
          <div className={`token-detail__card token-detail__card--fixed ${!isAnalyzed ? 'token-detail__card--blur' : ''}`}>
            <div className="token-detail__card-header">
              <h3>Social & Developer Data</h3>
            </div>
            <div className="token-detail__card-body">
              <div className="token-detail__card-scrollable">
                <div className="token-detail__social-section">
                  <span className="token-detail__social-label">SOCIAL SENTIMENT</span>
                  <div className="token-detail__sentiment-bar">
                    <div 
                      className={`token-detail__sentiment-fill ${isAnalyzed ? analysis.socialData.sentimentType.toLowerCase() : 'neutral'}`}
                      style={{ width: `${isAnalyzed ? analysis.socialData.sentimentPercentage : 50}%` }}
                    />
                  </div>
                  <span className="token-detail__sentiment-text">
                    {isAnalyzed ? `${analysis.socialData.sentimentType} (${analysis.socialData.sentimentPercentage}%)` : 'NEUTRAL (50%)'}
                  </span>
                </div>
                <div className="token-detail__developer-section">
                  <span className="token-detail__social-label">DEVELOPER ACTIVITY</span>
                  <div className="token-detail__commits-chart">
                    <div className="token-detail__commits-bars">
                      {[40, 60, 80, 55, 90, 70, 85].map((h, i) => (
                        <div key={i} className="token-detail__commits-bar" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <span className="token-detail__commits-change positive">
                      +{isAnalyzed ? analysis.socialData.weeklyCommitsChange : 12.4}%
                    </span>
                    <span className="token-detail__commits-label">Weekly Commits</span>
                  </div>
                </div>
              </div>
              {isAnalyzed && analysis.aiInsights.find(i => i.section === 'Social & Developer Data') && (
                <div className="token-detail__ai-insight">
                  <span className="token-detail__ai-label">AI INSIGHT</span>
                  <p>{analysis.aiInsights.find(i => i.section === 'Social & Developer Data')?.content}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="token-detail__footer">
          <div className="token-detail__footer-left">
            <span className="token-detail__live-indicator" />
            <span>DATA LIVE</span>
            <span className="token-detail__update-time">UPDATE: 2S AGO</span>
          </div>
          <div className="token-detail__footer-right">
            WP IQ - WHITEPAPER INTELLIGENCE PLATFORM V2.4.0
          </div>
        </footer>
      </div>
    </MainLayout>
  );
};

export default TokenDetail;
