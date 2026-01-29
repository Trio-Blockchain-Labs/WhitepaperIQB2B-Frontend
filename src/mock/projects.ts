import type { AnalyzedProject, ProjectFilters, RiskLevel } from '../types/project';

// Mock Analyzed Projects
export const mockAnalyzedProjects: AnalyzedProject[] = [
  {
    id: 'proj-001',
    tokenId: 'BTC',
    tokenName: 'Bitcoin',
    tokenTicker: 'BTC',
    analyzedAt: '2026-01-25T14:30:00Z',
    analyzedBy: 'Kerem Kaya',
    overallScore: 92,
    riskLevel: 'low',
    marketCap: 1920000000000,
    price: 98450,
    priceChange24h: 2.34,
    category: 'Layer 1',
    summary: 'Strong fundamentals with institutional adoption. Network security remains unmatched.',
    criteriaScores: {
      originality: 95,
      marketPotential: 90,
      tokenomics: 88,
      security: 98,
      community: 94,
      adoption: 92,
      risk: 90,
    },
  },
  {
    id: 'proj-002',
    tokenId: 'ETH',
    tokenName: 'Ethereum',
    tokenTicker: 'ETH',
    analyzedAt: '2026-01-24T10:15:00Z',
    analyzedBy: 'Fatih Altınışık',
    overallScore: 88,
    riskLevel: 'low',
    marketCap: 384200000000,
    price: 3200.50,
    priceChange24h: -4.52,
    category: 'Layer 1',
    summary: 'Leading smart contract platform with strong L2 ecosystem growth.',
    criteriaScores: {
      originality: 92,
      marketPotential: 88,
      tokenomics: 82,
      security: 95,
      community: 90,
      adoption: 88,
      risk: 85,
    },
  },
  {
    id: 'proj-003',
    tokenId: 'SOL',
    tokenName: 'Solana',
    tokenTicker: 'SOL',
    analyzedAt: '2026-01-23T16:45:00Z',
    analyzedBy: 'Kerem Kaya',
    overallScore: 76,
    riskLevel: 'medium',
    marketCap: 82500000000,
    price: 185.20,
    priceChange24h: 5.67,
    category: 'Layer 1',
    summary: 'High throughput chain with growing DeFi ecosystem. Past outages remain a concern.',
    criteriaScores: {
      originality: 78,
      marketPotential: 82,
      tokenomics: 70,
      security: 68,
      community: 80,
      adoption: 78,
      risk: 72,
    },
  },
  {
    id: 'proj-004',
    tokenId: 'ARB',
    tokenName: 'Arbitrum',
    tokenTicker: 'ARB',
    analyzedAt: '2026-01-22T09:00:00Z',
    analyzedBy: 'Ahmet Yılmaz',
    overallScore: 81,
    riskLevel: 'medium',
    marketCap: 7200000000,
    price: 1.85,
    priceChange24h: -1.23,
    category: 'Layer 2',
    summary: 'Leading Ethereum L2 with strong TVL. Token unlock schedule needs monitoring.',
    criteriaScores: {
      originality: 75,
      marketPotential: 85,
      tokenomics: 72,
      security: 88,
      community: 82,
      adoption: 84,
      risk: 78,
    },
  },
  {
    id: 'proj-005',
    tokenId: 'PEPE',
    tokenName: 'Pepe',
    tokenTicker: 'PEPE',
    analyzedAt: '2026-01-21T11:30:00Z',
    analyzedBy: 'Fatih Altınışık',
    overallScore: 35,
    riskLevel: 'high',
    marketCap: 4200000000,
    price: 0.0000098,
    priceChange24h: 12.45,
    category: 'Meme',
    summary: 'High volatility meme coin. No utility, purely speculative asset.',
    criteriaScores: {
      originality: 20,
      marketPotential: 40,
      tokenomics: 25,
      security: 45,
      community: 60,
      adoption: 30,
      risk: 20,
    },
  },
  {
    id: 'proj-006',
    tokenId: 'LINK',
    tokenName: 'Chainlink',
    tokenTicker: 'LINK',
    analyzedAt: '2026-01-20T14:00:00Z',
    analyzedBy: 'Kerem Kaya',
    overallScore: 85,
    riskLevel: 'low',
    marketCap: 12500000000,
    price: 22.50,
    priceChange24h: 3.21,
    category: 'Infrastructure',
    summary: 'Dominant oracle provider with expanding CCIP adoption.',
    criteriaScores: {
      originality: 90,
      marketPotential: 85,
      tokenomics: 78,
      security: 92,
      community: 84,
      adoption: 88,
      risk: 82,
    },
  },
];

// Risk level colors
export const riskLevelColors: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  low: { bg: 'rgba(34, 197, 94, 0.15)', text: '#16a34a', border: '#22c55e' },
  medium: { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706', border: '#f59e0b' },
  high: { bg: 'rgba(239, 68, 68, 0.15)', text: '#dc2626', border: '#ef4444' },
};

// Category list
export const projectCategories = [
  'Layer 1',
  'Layer 2',
  'DeFi',
  'Infrastructure',
  'Gaming',
  'Meme',
  'AI',
  'RWA',
];

// Service-like functions
export const getAnalyzedProjects = async (filters?: ProjectFilters): Promise<AnalyzedProject[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let results = [...mockAnalyzedProjects];
  
  if (filters) {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(p => 
        p.tokenName.toLowerCase().includes(searchLower) ||
        p.tokenTicker.toLowerCase().includes(searchLower)
      );
    }
    
    // Risk level filter
    if (filters.riskLevel && filters.riskLevel !== 'all') {
      results = results.filter(p => p.riskLevel === filters.riskLevel);
    }
    
    // Category filter
    if (filters.category && filters.category !== 'all') {
      results = results.filter(p => p.category === filters.category);
    }
    
    // Sorting
    if (filters.sortBy) {
      results.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'date':
            comparison = new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime();
            break;
          case 'score':
            comparison = b.overallScore - a.overallScore;
            break;
          case 'marketCap':
            comparison = b.marketCap - a.marketCap;
            break;
          case 'name':
            comparison = a.tokenName.localeCompare(b.tokenName);
            break;
        }
        return filters.sortOrder === 'asc' ? -comparison : comparison;
      });
    }
  }
  
  return results;
};

export const getProjectById = async (id: string): Promise<AnalyzedProject | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockAnalyzedProjects.find(p => p.id === id) || null;
};
