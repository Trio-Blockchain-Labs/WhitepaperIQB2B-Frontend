export interface Coin {
  id: string;
  name: string;
  ticker: string;
  logo?: string;
  category?: string;
}

export interface UsageStats {
  used: number;
  total: number;
  planName: string;
}

export interface Business {
  id: string;
  name: string;
  logo?: string;
}
