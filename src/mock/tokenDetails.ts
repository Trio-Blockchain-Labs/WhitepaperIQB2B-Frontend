import type { 
  TokenDetail, 
  TokenAnalysis, 
} from '../types/token';

// Mock Token Headers
export const mockTokenDetails: Record<string, TokenDetail> = {
  'ETH': {
    header: {
      id: '2',
      name: 'Ethereum',
      ticker: 'ETH',
      price: 3200.50,
      priceChange24h: -4.52,
      volume24h: 12400000000,
      marketCap: 384200000000,
      fdv: 384200000000,
      currentSupply: 120200000,
      maxSupply: null,
    },
    hasAnalysis: true,
    previousAnalysisId: 'eth-analysis-001',
    previousAnalysisDate: '2024-01-15T10:30:00Z',
  },
  'BTC': {
    header: {
      id: '1',
      name: 'Bitcoin',
      ticker: 'BTC',
      price: 98450.00,
      priceChange24h: 2.34,
      volume24h: 45600000000,
      marketCap: 1920000000000,
      fdv: 2070000000000,
      currentSupply: 19500000,
      maxSupply: 21000000,
    },
    hasAnalysis: true,
    previousAnalysisId: 'btc-analysis-001',
    previousAnalysisDate: '2024-01-14T08:15:00Z',
  },
  'SOL': {
    header: {
      id: '3',
      name: 'Solana',
      ticker: 'SOL',
      price: 185.20,
      priceChange24h: 5.67,
      volume24h: 3200000000,
      marketCap: 82500000000,
      fdv: 110000000000,
      currentSupply: 445000000,
      maxSupply: null,
    },
    hasAnalysis: false,
  },
  'ARB': {
    header: {
      id: '12',
      name: 'Arbitrum',
      ticker: 'ARB',
      price: 1.85,
      priceChange24h: -1.23,
      volume24h: 890000000,
      marketCap: 7200000000,
      fdv: 18500000000,
      currentSupply: 3900000000,
      maxSupply: 10000000000,
    },
    hasAnalysis: false,
  },
};

// Mock Analysis Data for ETH
export const mockAnalysisData: Record<string, TokenAnalysis> = {
  'eth-analysis-001': {
    id: 'eth-analysis-001',
    tokenId: 'ETH',
    analyzedAt: '2024-01-15T10:30:00Z',
    topHolders: [
      { address: '0x742d...44e', label: 'Binance 7', amount: 1240000, value: 3900000000 },
      { address: '0x3f5c...92a', label: 'Kraken 4', amount: 850200, value: 2700000000 },
      { address: '0xd90e...12b', label: 'Cold Wallet', amount: 430000, value: 1300000000 },
      { address: '0x55d3...6a1', label: 'Whale', amount: 125000, value: 400000000 },
    ],
    exchanges: [
      { name: 'Binance', volume: 4200000000, wtiScore: 9.8 },
      { name: 'Coinbase', volume: 2100000000, wtiScore: 9.2 },
      { name: 'OKX', volume: 1800000000, wtiScore: 8.5 },
      { name: 'Bybit', volume: 1400000000, wtiScore: 8.1 },
    ],
    flowData: [
      { type: 'DEX Inf', previous24h: 210000000, current: 85000000 },
      { type: 'DEX Outf', previous24h: -180000000, current: -120000000 },
      { type: 'CEX Inf', previous24h: 450000000, current: 620000000 },
      { type: 'CEX Outf', previous24h: -490000000, current: -310000000 },
    ],
    institutionalHoldings: [
      { name: 'Grayscale', type: 'fund', amount: 2800000, value: 8960000000, percentageOfSupply: 2.33 },
      { name: 'United States', type: 'country', amount: 198000, value: 633600000, percentageOfSupply: 0.16 },
      { name: 'BlackRock', type: 'etf', amount: 450000, value: 1440000000, percentageOfSupply: 0.37 },
      { name: 'Fidelity', type: 'etf', amount: 380000, value: 1216000000, percentageOfSupply: 0.32 },
      { name: 'MicroStrategy', type: 'company', amount: 150000, value: 480000000, percentageOfSupply: 0.12 },
      { name: 'Germany', type: 'country', amount: 50000, value: 160000000, percentageOfSupply: 0.04 },
    ],
    socialData: {
      sentimentType: 'BEARISH',
      sentimentPercentage: 65,
      weeklyCommitsChange: 12.4,
    },
    criteriaAssessments: [
      {
        id: 1,
        title: 'Originality & Innovation',
        description: 'Ethereum continues to lead as the primary L1 smart contract platform. The roadmap towards "The Splurge" focuses on user experience and verification efficiency.',
        highlightText: 'High originality score maintained through active EIP governance.',
      },
      {
        id: 2,
        title: 'Market Potential & Competitive Landscape',
        description: 'Increased competition from high-throughput L1s like Solana. However, L2 ecosystem growth (Arbitrum, Optimism) solidifies Ethereum\'s position as the settlement layer of choice for institutions.',
      },
      {
        id: 3,
        title: 'Tokenomics & Sustainability',
        description: 'EIP-1559 burn mechanism remains effective. Under current low-activity conditions, ETH is slightly inflationary (+0.12% APR), which adds downward pressure during bearish cycles.',
      },
      {
        id: 4,
        title: 'Security & Compliance',
        description: 'Network remains most secure PoS chain. Regulatory landscape in the US regarding "Staking-as-a-Service" presents a localized risk for centralized providers.',
      },
      {
        id: 5,
        title: 'Community & Ecosystem Growth',
        description: 'Strong developer community with consistent growth.',
        stats: [
          { label: 'ACTIVE DEVS', value: '6,800+' },
          { label: 'TVL CHANGE', value: '-8.4%', change: 'MoM' },
        ],
      },
      {
        id: 6,
        title: 'Adoption Metrics',
        description: 'Institutional adoption continues to grow with ETF approvals.',
      },
    ],
    aiInsights: [
      {
        section: 'Top 100 Holders',
        content: 'Significant accumulation detected from exchange labels in the last 24h, suggesting potential floor support near $3,150.',
      },
      {
        section: 'Exchanges',
        content: 'Liquidity profile remains strong across top-tier venues despite volatility. Spread remains tight at 0.01%.',
      },
      {
        section: 'Institutional Holdings',
        content: 'Institutional accumulation continues with ETF inflows showing strong momentum. Grayscale remains the largest holder with 2.33% of total supply.',
      },
      {
        section: 'Inflow & Outflow',
        content: 'CEX Net Flow is positive (+$310M), indicating potential selling pressure as assets move to exchanges. DEX activity shows reduced inflows.',
      },
      {
        section: 'Social & Developer Data',
        content: 'Technical development remains decoupled from price action. Long-term health is fundamentally intact.',
      },
    ],
  },
};

// Service-like functions (will be replaced with actual API calls)
export const getTokenDetail = async (ticker: string): Promise<TokenDetail | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const upperTicker = ticker.toUpperCase();
  return mockTokenDetails[upperTicker] || null;
};

export const getTokenAnalysis = async (analysisId: string): Promise<TokenAnalysis | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return mockAnalysisData[analysisId] || null;
};

export const startNewAnalysis = async (ticker: string): Promise<TokenAnalysis> => {
  // Simulate long analysis process
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // For demo, return ETH analysis data with modified ID
  const baseAnalysis = mockAnalysisData['eth-analysis-001'];
  return {
    ...baseAnalysis,
    id: `${ticker.toLowerCase()}-analysis-${Date.now()}`,
    tokenId: ticker.toUpperCase(),
    analyzedAt: new Date().toISOString(),
  };
};
