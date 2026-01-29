import type { Coin } from '../types/crypto';

export const mockCoins: Coin[] = [
  { id: '1', name: 'Bitcoin', ticker: 'BTC', category: 'Layer 1' },
  { id: '2', name: 'Ethereum', ticker: 'ETH', category: 'Layer 1' },
  { id: '3', name: 'Solana', ticker: 'SOL', category: 'Layer 1' },
  { id: '4', name: 'Cardano', ticker: 'ADA', category: 'Layer 1' },
  { id: '5', name: 'Polkadot', ticker: 'DOT', category: 'Layer 0' },
  { id: '6', name: 'Avalanche', ticker: 'AVAX', category: 'Layer 1' },
  { id: '7', name: 'Chainlink', ticker: 'LINK', category: 'Oracle' },
  { id: '8', name: 'Polygon', ticker: 'MATIC', category: 'Layer 2' },
  { id: '9', name: 'Uniswap', ticker: 'UNI', category: 'DeFi' },
  { id: '10', name: 'Aave', ticker: 'AAVE', category: 'DeFi' },
  { id: '11', name: 'Cosmos', ticker: 'ATOM', category: 'Layer 0' },
  { id: '12', name: 'Arbitrum', ticker: 'ARB', category: 'Layer 2' },
  { id: '13', name: 'Optimism', ticker: 'OP', category: 'Layer 2' },
  { id: '14', name: 'Near Protocol', ticker: 'NEAR', category: 'Layer 1' },
  { id: '15', name: 'Fantom', ticker: 'FTM', category: 'Layer 1' },
  { id: '16', name: 'Binance Coin', ticker: 'BNB', category: 'Layer 1' },
  { id: '17', name: 'Ripple', ticker: 'XRP', category: 'Payment' },
  { id: '18', name: 'Dogecoin', ticker: 'DOGE', category: 'Meme' },
  { id: '19', name: 'Shiba Inu', ticker: 'SHIB', category: 'Meme' },
  { id: '20', name: 'Litecoin', ticker: 'LTC', category: 'Payment' },
];

export const trendingCoins: Coin[] = [
  { id: '1', name: 'Bitcoin', ticker: 'BTC', category: 'Layer 1' },
  { id: '3', name: 'Solana', ticker: 'SOL', category: 'Layer 1' },
  { id: '12', name: 'Arbitrum', ticker: 'ARB', category: 'Layer 2' },
  { id: '2', name: 'Ethereum', ticker: 'ETH', category: 'Layer 1' },
];

export type CategoryIcon = 'layer1' | 'layer2' | 'defi' | 'oracle' | 'meme' | 'payment';

export interface Category {
  id: string;
  name: string;
  iconType: CategoryIcon;
  count: number;
}

export const categories: Category[] = [
  { id: 'layer1', name: 'Layer 1', iconType: 'layer1', count: 8 },
  { id: 'layer2', name: 'Layer 2', iconType: 'layer2', count: 3 },
  { id: 'defi', name: 'DeFi', iconType: 'defi', count: 2 },
  { id: 'oracle', name: 'Oracles', iconType: 'oracle', count: 1 },
  { id: 'meme', name: 'Meme Coins', iconType: 'meme', count: 2 },
  { id: 'payment', name: 'Payment', iconType: 'payment', count: 2 },
];

export const recentAnalyses = [
  { id: '1', coinName: 'Ethereum', ticker: 'ETH', date: '2 hours ago', score: 87 },
  { id: '2', coinName: 'Solana', ticker: 'SOL', date: '5 hours ago', score: 72 },
  { id: '3', coinName: 'Arbitrum', ticker: 'ARB', date: '1 day ago', score: 91 },
];

export const searchCoins = (query: string): Coin[] => {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  return mockCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(lowerQuery) ||
      coin.ticker.toLowerCase().includes(lowerQuery)
  );
};
