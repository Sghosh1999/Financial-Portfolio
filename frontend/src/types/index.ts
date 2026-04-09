export type ItemType = 'asset' | 'liability';

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Entry {
  id: number;
  item_id: number;
  amount: number;
  date: string;
  note?: string;
  created_at: string;
}

export interface Item {
  id: number;
  name: string;
  type: ItemType;
  currency: string;
  icon?: string;
  tags: Tag[];
  entries: Entry[];
  created_at: string;
  updated_at: string;
}

export interface ItemSummary {
  id: number;
  name: string;
  type: ItemType;
  currency: string;
  icon?: string;
  tags: Tag[];
  current_value: number;
  previous_value?: number;
  change_amount: number;
  change_percent?: number;
  last_updated?: string;
  sparkline: number[];
}

export interface DashboardSummary {
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  allocation: AllocationItem[];
  items: ItemSummary[];
}

export interface AllocationItem {
  name: string;
  value: number;
  color: string;
}

export interface MonthlySavings {
  month: string;
  savings: number;
  net_worth_end?: number;
  savings_rate_percent?: number | null;
}

export interface QuarterlySavings {
  quarter: string;
  savings: number;
}

export interface InsightsSummary {
  net_worth: number;
  month_change: number;
  month_change_percent?: number;
  avg_monthly_savings: number;
  all_time_high: number;
  all_time_high_date?: string;
  biggest_gainer?: {
    name: string;
    change_percent: number;
    change_amount: number;
  };
  biggest_loser?: {
    name: string;
    change_percent: number;
    change_amount: number;
  };
  liability_ratio?: number;
  monthly_savings: MonthlySavings[];
  quarterly_savings: QuarterlySavings[];
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface TimeSeriesResponse {
  item_id: number;
  item_name: string;
  data: TimeSeriesPoint[];
}

export type SortBy = 'value' | 'name' | 'updated';
export type SortOrder = 'asc' | 'desc';
export type TimeRange = '6m' | 'ytd' | '1y' | '2y' | '4y' | '5y' | 'all';

export interface NetWorthHistoryPoint {
  date: string;
  net_worth: number;
  assets: number;
  liabilities: number;
}

export interface NetWorthHistoryResponse {
  data: NetWorthHistoryPoint[];
}
