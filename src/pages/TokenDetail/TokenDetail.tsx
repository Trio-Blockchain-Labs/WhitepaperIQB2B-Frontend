import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../layouts';
import { Button } from '../../components/common';
import { projectService, analysisService } from '../../services';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { 
  Analysis, 
  Holder,
  Ticker,
  CompanyHolding,
  Criteria
} from '../../types/analysis';
import type { Project, PriceData, ProjectWithLatestAnalysis } from '../../types/project';
import './TokenDetail.css';

// Local Analysis Status (for UI state)
type AnalysisStatus = 'idle' | 'loading' | 'completed' | 'error';

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

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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

const getHoldingTypeIcon = () => {
  return <BuildingIcon />;
};

export const TokenDetail: React.FC = () => {
  const { coingeckoId } = useParams<{ coingeckoId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  
  // Slider state for Exchanges/Inflow card
  const [exchangeSlide, setExchangeSlide] = useState<'exchanges' | 'inflow'>('exchanges');

  // AI Insight modal state
  const [activeInsight, setActiveInsight] = useState<{
    title: string;
    text: string;
  } | null>(null);

  useEffect(() => {
    // Reset analysis state when coingeckoId changes
    // This ensures every token page starts with blurred analysis sections
    setAnalysis(null);
    setAnalysisStatus('idle');
    
    const fetchProjectData = async () => {
      if (!coingeckoId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const projectIdFromQuery = searchParams.get('projectId');

        // If coming from Projects page, fetch project + latest analysis via /projects/:id
        if (projectIdFromQuery) {
          const projectWithLatest: ProjectWithLatestAnalysis = await projectService.getProjectById(projectIdFromQuery);
          setProject(projectWithLatest);

          // If latest analysis exists, hydrate analysis and mark as completed so sections are unblurred
          if (projectWithLatest.latestAnalysis?.resultData) {
            setAnalysis(projectWithLatest.latestAnalysis);
            setAnalysisStatus('completed');

            // Price data isn't returned by /projects/:id; derive from analysis marketData if available
            const market = projectWithLatest.latestAnalysis.resultData.coinData.marketData;
            setPriceData({
              currentPrice: market.currentPrice,
              priceChange24h: market.priceChangePercentage24h,
              totalVolume: market.totalVolume,
              marketCap: market.marketCap,
              fullyDilutedValuation: market.fullyDilutedValuation,
              totalSupply: market.totalSupply,
              maxSupply: (market.maxSupply ?? 0) as number,
            });
          } else {
            // No latest analysis -> fall back to normal behavior (project info still shown, analysis stays blurred)
            setAnalysis(null);
            setAnalysisStatus('idle');
          }
          return;
        }

        // Default behavior: create or fetch project using coingeckoId
        const response = await projectService.createProject({ coingeckoId });
        setProject(response.project);
        setPriceData(response.priceData || null);
      } catch (err) {
        console.error('Failed to fetch project:', err);
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [coingeckoId, searchParams, showError]);

  const handleStartAnalysis = async () => {
    if (!project) return;
    
    setAnalysisStatus('loading');
    
    try {
      const result = await analysisService.createAnalysis({ projectId: project.id });
      setAnalysis(result);
      setAnalysisStatus('completed');
      showSuccess('Analysis completed successfully!');
    } catch (err) {
      console.error('Failed to create analysis:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create analysis';
      setAnalysisStatus('error');
      showError(errorMessage);
    }
  };

  const handleExportPdf = async () => {
    if (!analysis?.id) {
      showError('You need to run an analysis before exporting the PDF.');
      return;
    }

    try {
      setIsExportingPdf(true);
      const pdfBlob = await analysisService.downloadAnalysisPdf(analysis.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${project?.slug || project?.name || 'analysis'}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('Analysis PDF downloaded successfully.');
    } catch (err) {
      console.error('Failed to download analysis PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to download analysis PDF';
      showError(errorMessage);
    } finally {
      setIsExportingPdf(false);
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

  if (error || !project) {
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

  const isAnalyzed = analysisStatus === 'completed' && analysis && analysis.resultData;
  const isAnalyzing = analysisStatus === 'loading';
  
  // Build header data from project and priceData
  const header = {
    id: project.id,
    name: project.name,
    ticker: project.symbol || 'N/A',
    price: priceData?.currentPrice || 0,
    priceChange24h: priceData?.priceChange24h || 0,
    volume24h: priceData?.totalVolume || 0,
    marketCap: priceData?.marketCap || 0,
    fdv: priceData?.fullyDilutedValuation || 0,
    currentSupply: priceData?.totalSupply || 0,
    maxSupply: priceData?.maxSupply || null,
  };

  // Helper functions to map API data to UI format
  const getHolders = (): Holder[] => {
    if (!isAnalyzed || !analysis?.resultData?.topHoldersData?.addressTopHolders) return [];
    
    // Get all holders from all chains
    const allHolders: Holder[] = [];
    const addressTopHolders = analysis.resultData.topHoldersData.addressTopHolders;
    
    // Iterate through all chains (ethereum, arbitrum_one, base, optimism, etc.)
    Object.keys(addressTopHolders).forEach((chain) => {
      const chainHolders = addressTopHolders[chain]?.holders || [];
      allHolders.push(...chainHolders);
    });
    
    // Sort by USD value (descending) and take top 100
    return allHolders.sort((a, b) => b.usd - a.usd).slice(0, 100);
  };

  const getExchanges = (): Ticker[] => {
    if (!isAnalyzed || !analysis?.resultData?.coinData?.tickers) return [];
    // Sort by volume and take top exchanges
    return analysis.resultData.coinData.tickers
      .sort((a, b) => b.convertedVolume - a.convertedVolume)
      .slice(0, 20);
  };

  const getInstitutionalHoldings = (): CompanyHolding[] => {
    if (!isAnalyzed || !analysis?.resultData?.treasuryData?.companies) return [];
    return analysis.resultData.treasuryData.companies
      .filter(c => c.totalHoldings > 0)
      .sort((a, b) => b.totalCurrentValueUsd - a.totalCurrentValueUsd);
  };

  const getFlowData = () => {
    if (!isAnalyzed || !analysis?.resultData?.inflowOutflowData) return [];
    const flow = analysis.resultData.inflowOutflowData;

    // Some analyses may not include full inflow/outflow metrics
    if (!flow.previous || !flow.current) {
      return [];
    }

    return [
      { type: 'DEX Inf' as const, previous24h: flow.previous.inflowDexVolume, current: flow.current.inflowDexVolume },
      { type: 'DEX Outf' as const, previous24h: -flow.previous.outflowDexVolume, current: -flow.current.outflowDexVolume },
      { type: 'CEX Inf' as const, previous24h: flow.previous.inflowCexVolume, current: flow.current.inflowCexVolume },
      { type: 'CEX Outf' as const, previous24h: -flow.previous.outflowCexVolume, current: -flow.current.outflowCexVolume },
    ];
  };

  const getCriteria = (): Criteria[] => {
    if (!isAnalyzed || !analysis?.resultData?.detailedAnalysis?.data?.analysis?.criteria) return [];
    return analysis.resultData.detailedAnalysis.data.analysis.criteria;
  };

  const getScoreRating = (score: number, maxScore: number): { label: string; className: string } => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) {
      return { label: 'Good', className: 'rating-good' };
    } else if (percentage >= 50) {
      return { label: 'Moderate', className: 'rating-moderate' };
    } else {
      return { label: 'Poor', className: 'rating-poor' };
    }
  };

  const getAIInsight = (category: string): string | undefined => {
    if (!isAnalyzed || !analysis?.resultData?.aiInsights?.data?.insights) {
      console.log('AI Insights check failed:', { 
        isAnalyzed, 
        hasInsights: !!analysis?.resultData?.aiInsights?.data?.insights,
        hasData: !!analysis?.resultData?.aiInsights?.data,
        analysisStatus,
        hasResultData: !!analysis?.resultData
      });
      return undefined;
    }
    const insight = analysis.resultData.aiInsights.data.insights.find(i => i.category === category);
    if (!insight) {
      console.log('AI Insight not found for category:', category, 'Available categories:', analysis.resultData.aiInsights.data.insights.map(i => i.category));
    }
    return insight?.summary || undefined;
  };

  const getGeneralFinancialInsight = (): string | undefined => {
    return getAIInsight('GeneralFinancialModule');
  };

  return (
    <MainLayout>
      <div className="token-detail">
        {/* Header Section */}
        <header className="token-detail__header">
          <div className="token-detail__header-left">
            <div className="token-detail__title-row">
              {project.imageUrl && (
                <div className="token-detail__logo">
                  <img src={project.imageUrl} alt={project.name} />
                </div>
              )}
              <h1 className="token-detail__name">
                {header.name} <span className="token-detail__ticker">({header.ticker})</span>
              </h1>
              <span className={`token-detail__change ${header.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                {header.priceChange24h >= 0 ? '↗' : '↘'} {Math.abs(header.priceChange24h).toFixed(2)}%
              </span>
            </div>
            <div className="token-detail__price-row">
              <span className="token-detail__price">${header.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 10 })}</span>
              <div className="token-detail__actions">
                {project.websiteUrl && (
                  <a 
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="token-detail__action-btn" 
                    title="Visit Website"
                  >
                    <ShareIcon />
                  </a>
                )}
                {project.whitepaperUrl && (
                  <a 
                    href={project.whitepaperUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="token-detail__action-btn" 
                    title="View Whitepaper"
                  >
                    <BookIcon />
                  </a>
                )}
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

        {/* General Financial Insight - Show if analyzed */}
        {isAnalyzed && getGeneralFinancialInsight() && (
          <div className="token-detail__financial-insight">
            <div className="token-detail__financial-insight-header">
              <h3>General Financial Overview</h3>
            </div>
            <div className="token-detail__financial-insight-content">
              <p>{getGeneralFinancialInsight()}</p>
            </div>
          </div>
        )}

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
                {/* TODO: Show "View Previous Analysis" button when previous analysis API is ready */}
                {/* <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleViewPreviousAnalysis}
                  leftIcon={<HistoryIcon />}
                  disabled={isAnalyzing}
                >
                  View Previous Analysis
                </Button> */}
              </div>
              {/* TODO: Show previous analysis date when available */}
              {/* {previousAnalysisDate && (
                <p className="token-detail__previous-date">
                  Last analyzed: {new Date(previousAnalysisDate).toLocaleDateString()}
                </p>
              )} */}
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
                  {getHolders().map((holder, i) => {
                    const addressLabel = holder.address.label?.name || '';
                    const entityName = holder.address.entity?.name || '';
                    const displayLabel = addressLabel || entityName || 'Unknown';
                    const shortAddress = `${holder.address.address.slice(0, 6)}...${holder.address.address.slice(-4)}`;
                    
                    return (
                      <div key={i} className="token-detail__holder-row">
                        <span className="token-detail__holder-address">
                          {shortAddress} <span className="token-detail__holder-label">({displayLabel})</span>
                        </span>
                        <span className="token-detail__holder-amount">{holder.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        <span className="token-detail__holder-value">{formatNumber(holder.usd)}</span>
                      </div>
                    );
                  })}
                  {!isAnalyzed && (
                    <>
                      <div className="token-detail__holder-row">
                        <span className="token-detail__holder-address">
                          <span className="token-detail__holder-label">(Loading...)</span>
                        </span>
                        <span className="token-detail__holder-amount">-</span>
                        <span className="token-detail__holder-value">-</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {isAnalyzed && getAIInsight('TopHoldersModule') && (
                <div className="token-detail__ai-preview">
                  <div className="token-detail__ai-preview-pill" />
                  <div className="token-detail__ai-preview-content">
                    <span className="token-detail__ai-preview-label">AI INSIGHT</span>
                    <p className="token-detail__ai-preview-text">
                      {getAIInsight('TopHoldersModule')}
                    </p>
                    <button
                      type="button"
                      className="token-detail__ai-preview-more"
                      onClick={() =>
                        setActiveInsight({
                          title: 'Top Holders – AI Insight',
                          text: getAIInsight('TopHoldersModule') || '',
                        })
                      }
                    />
                  </div>
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
                    <div className="token-detail__exchange-header">
                      <span className="token-detail__exchange-header-label">Exchange</span>
                      <span className="token-detail__exchange-header-label">24h Volume (USD)</span>
                      <span className="token-detail__exchange-header-label">WTI Score</span>
                    </div>
                    {getExchanges().map((ticker, i) => (
                      <div key={i} className="token-detail__exchange-row">
                        {ticker.tradeUrl ? (
                          <a 
                            href={ticker.tradeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="token-detail__exchange-name token-detail__exchange-name--link"
                          >
                            {ticker.market.name}
                          </a>
                        ) : (
                          <span className="token-detail__exchange-name">{ticker.market.name}</span>
                        )}
                        <span className="token-detail__exchange-volume">{formatNumber(ticker.convertedVolume)}</span>
                        <span className="token-detail__exchange-wti">WTI: {ticker.wtiScore.toFixed(2)}</span>
                      </div>
                    ))}
                    {!isAnalyzed && (
                      <div className="token-detail__exchange-row">
                        <span className="token-detail__exchange-name">-</span>
                        <span className="token-detail__exchange-volume">-</span>
                        <span className="token-detail__exchange-wti">-</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Inflow & Outflow Slide */}
                {exchangeSlide === 'inflow' && (
                  <div className="token-detail__flow-grid">
                    <div className="token-detail__flow-column">
                      <span className="token-detail__flow-label">PREVIOUS (24H)</span>
                      {getFlowData().map((flow, i) => (
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
                      {getFlowData().map((flow, i) => (
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
              {isAnalyzed && (getAIInsight('ExchangesTickersModule') || getAIInsight('InflowOutflowModule')) && (
                <div className="token-detail__ai-preview">
                  <div className="token-detail__ai-preview-pill" />
                  <div className="token-detail__ai-preview-content">
                    <span className="token-detail__ai-preview-label">AI INSIGHT</span>
                    <p className="token-detail__ai-preview-text">
                      {exchangeSlide === 'exchanges'
                        ? getAIInsight('ExchangesTickersModule')
                        : getAIInsight('InflowOutflowModule')}
                    </p>
                    <button
                      type="button"
                      className="token-detail__ai-preview-more"
                      onClick={() =>
                        setActiveInsight({
                          title:
                            exchangeSlide === 'exchanges'
                              ? 'Exchanges – AI Insight'
                              : 'Inflow & Outflow – AI Insight',
                          text:
                            (exchangeSlide === 'exchanges'
                              ? getAIInsight('ExchangesTickersModule')
                              : getAIInsight('InflowOutflowModule')) || '',
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Report */}
          <div className={`token-detail__card token-detail__card--report ${!isAnalyzed ? 'token-detail__card--blur' : ''}`}>
            <div className="token-detail__card-header">
              <div>
                <h3>Detailed Report</h3>
                <p className="token-detail__report-subtitle">Deep-dive technical & fundamental audit</p>
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                leftIcon={<DownloadIcon />}
                onClick={handleExportPdf}
                disabled={!isAnalyzed || isExportingPdf}
              >
                {isExportingPdf ? 'Exporting...' : 'Export as PDF'}
              </Button>
            </div>
            <div className="token-detail__card-body">
              <div className="token-detail__card-scrollable token-detail__card-scrollable--tall">
                <h4 className="token-detail__criteria-title">7 CRITERIA RISK ASSESSMENT</h4>
                <div className="token-detail__criteria-list">
                  {getCriteria().map((criteria) => (
                    <div key={criteria.id} className="token-detail__criteria-item">
                      <span className="token-detail__criteria-number">{criteria.id}</span>
                      <div className="token-detail__criteria-content">
                        <div className="token-detail__criteria-header">
                          <h5>{criteria.name}</h5>
                          {(() => {
                            const rating = getScoreRating(criteria.score, criteria.maxScore);
                            return (
                              <span className={`token-detail__criteria-rating ${rating.className}`}>
                                {rating.label}
                              </span>
                            );
                          })()}
                        </div>
                        <p>{criteria.analysis}</p>
                        {criteria.strengths && criteria.strengths.length > 0 && (
                          <div className="token-detail__criteria-strengths">
                            <strong>Strengths:</strong>
                            <ul>
                              {criteria.strengths.map((strength, i) => (
                                <li key={i}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {criteria.weaknesses && criteria.weaknesses.length > 0 && (
                          <div className="token-detail__criteria-weaknesses">
                            <strong>Weaknesses:</strong>
                            <ul>
                              {criteria.weaknesses.map((weakness, i) => (
                                <li key={i}>{weakness}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {!isAnalyzed && (
                    <div className="token-detail__criteria-item">
                      <span className="token-detail__criteria-number">-</span>
                      <div className="token-detail__criteria-content">
                        <h5>Analysis pending...</h5>
                        <p>Detailed criteria assessment will be available after running the analysis.</p>
                      </div>
                    </div>
                  )}
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
                <div className="token-detail__holdings-header">
                  <span className="token-detail__holdings-header-label">Company/Country</span>
                  <span className="token-detail__holdings-header-label">Value</span>
                  
                </div>
                <div className="token-detail__holdings-list">
                  {getInstitutionalHoldings().map((holding, i) => (
                    <div key={i} className="token-detail__holding-row">
                      <div className="token-detail__holding-info">
                        <span className="token-detail__holding-icon">
                          {getHoldingTypeIcon()}
                        </span>
                        <div className="token-detail__holding-details">
                          <span className="token-detail__holding-name">{holding.name}</span>
                          <span className="token-detail__holding-type">{holding.country}</span>
                        </div>
                      </div>
                      <div className="token-detail__holding-stats">
                        <span className="token-detail__holding-value">{formatNumber(holding.totalCurrentValueUsd)}</span>
                        <span className="token-detail__holding-percent">{holding.percentageOfTotalSupply.toFixed(3)}%</span>
                      </div>
                    </div>
                  ))}
                  {!isAnalyzed && (
                    <div className="token-detail__holding-row">
                      <div className="token-detail__holding-info">
                        <span className="token-detail__holding-icon">-</span>
                        <div className="token-detail__holding-details">
                          <span className="token-detail__holding-name">Loading...</span>
                          <span className="token-detail__holding-type">-</span>
                        </div>
                      </div>
                      <div className="token-detail__holding-stats">
                        <span className="token-detail__holding-value">-</span>
                        <span className="token-detail__holding-percent">-</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {isAnalyzed && getAIInsight('InstitutionalHoldingsModule') && (
                <div className="token-detail__ai-preview">
                  <div className="token-detail__ai-preview-pill" />
                  <div className="token-detail__ai-preview-content">
                    <span className="token-detail__ai-preview-label">AI INSIGHT</span>
                    <p className="token-detail__ai-preview-text">
                      {getAIInsight('InstitutionalHoldingsModule')}
                    </p>
                    <button
                      type="button"
                      className="token-detail__ai-preview-more"
                      onClick={() =>
                        setActiveInsight({
                          title: 'Institutional Holdings – AI Insight',
                          text: getAIInsight('InstitutionalHoldingsModule') || '',
                        })
                      }
                    />
                  </div>
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
                  <span className="token-detail__social-label">COMMUNITY METRICS</span>
                  {isAnalyzed && analysis?.resultData?.coinData?.communityData && (
                    <div className="token-detail__social-stats">
                      <div className="token-detail__social-stat">
                        <span className="token-detail__social-stat-label">Reddit Subscribers</span>
                        <span className="token-detail__social-stat-value">
                          {analysis.resultData.coinData.communityData.redditSubscribers?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="token-detail__social-stat">
                        <span className="token-detail__social-stat-label">Telegram Users</span>
                        <span className="token-detail__social-stat-value">
                          {analysis.resultData.coinData.communityData.telegramChannelUserCount?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="token-detail__social-stat">
                        <span className="token-detail__social-stat-label">Reddit Posts (48h)</span>
                        <span className="token-detail__social-stat-value">
                          {analysis.resultData.coinData.communityData.redditAveragePosts48h?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                  {!isAnalyzed && (
                    <div className="token-detail__social-stats">
                      <div className="token-detail__social-stat">
                        <span className="token-detail__social-stat-label">-</span>
                        <span className="token-detail__social-stat-value">-</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="token-detail__developer-section">
                  <span className="token-detail__social-label">DEVELOPER ACTIVITY</span>
                  {isAnalyzed && analysis?.resultData?.coinData?.developerData && (
                    <div className="token-detail__developer-stats">
                      <div className="token-detail__developer-stat">
                        <span className="token-detail__developer-stat-label">GitHub Stars</span>
                        <span className="token-detail__developer-stat-value">
                          {analysis.resultData.coinData.developerData.stars?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="token-detail__developer-stat">
                        <span className="token-detail__developer-stat-label">Forks</span>
                        <span className="token-detail__developer-stat-value">
                          {analysis.resultData.coinData.developerData.forks?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="token-detail__developer-stat">
                        <span className="token-detail__developer-stat-label">Contributors</span>
                        <span className="token-detail__developer-stat-value">
                          {analysis.resultData.coinData.developerData.pullRequestContributors?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="token-detail__developer-stat">
                        <span className="token-detail__developer-stat-label">Commits (4 weeks)</span>
                        <span className="token-detail__developer-stat-value">
                          {analysis.resultData.coinData.developerData.commitCount4Weeks?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="token-detail__developer-stat">
                        <span className="token-detail__developer-stat-label">Code Changes (4 weeks)</span>
                        <span className="token-detail__developer-stat-value">
                          +{analysis.resultData.coinData.developerData.codeAdditionsDeletions4Weeks?.additions?.toLocaleString() || '0'} / 
                          -{Math.abs(analysis.resultData.coinData.developerData.codeAdditionsDeletions4Weeks?.deletions || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  {!isAnalyzed && (
                    <div className="token-detail__developer-stats">
                      <div className="token-detail__developer-stat">
                        <span className="token-detail__developer-stat-label">-</span>
                        <span className="token-detail__developer-stat-value">-</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {isAnalyzed && getAIInsight('SocialAndDeveloperModule') && (
                <div className="token-detail__ai-preview">
                  <div className="token-detail__ai-preview-pill" />
                  <div className="token-detail__ai-preview-content">
                    <span className="token-detail__ai-preview-label">AI INSIGHT</span>
                    <p className="token-detail__ai-preview-text">
                      {getAIInsight('SocialAndDeveloperModule')}
                    </p>
                    <button
                      type="button"
                      className="token-detail__ai-preview-more"
                      onClick={() =>
                        setActiveInsight({
                          title: 'Social & Developer – AI Insight',
                          text: getAIInsight('SocialAndDeveloperModule') || '',
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insight Modal */}
        {activeInsight && (
          <div
            className="token-detail__ai-modal-backdrop"
            onClick={() => setActiveInsight(null)}
          >
            <div
              className="token-detail__ai-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="token-detail__ai-modal-title">{activeInsight.title}</h4>
              <div className="token-detail__ai-modal-content">
                {activeInsight.text}
              </div>
              <div className="token-detail__ai-modal-actions">
                <Button size="sm" variant="secondary" onClick={() => setActiveInsight(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

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
