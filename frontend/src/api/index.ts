import type {
  Tag,
  Item,
  Entry,
  DashboardSummary,
  InsightsSummary,
  TimeSeriesResponse,
  NetWorthHistoryResponse,
  SortBy,
  SortOrder,
  TimeRange,
  ItemType,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...options,
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'An error occurred');
  }

  return response.json();
}

export const api = {
  tags: {
    list: () => fetchAPI<Tag[]>('/tags'),
    create: (data: { name: string; color?: string }) =>
      fetchAPI<Tag>('/tags', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI<void>(`/tags/${id}`, { method: 'DELETE' }),
  },

  items: {
    list: (type?: ItemType) =>
      fetchAPI<Item[]>(`/items${type ? `?type=${type}` : ''}`),
    get: (id: number) => fetchAPI<Item>(`/items/${id}`),
    create: (data: {
      name: string;
      type: ItemType;
      currency?: string;
      icon?: string;
      tag_ids?: number[];
    }) =>
      fetchAPI<Item>('/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (
      id: number,
      data: {
        name?: string;
        currency?: string;
        icon?: string;
        tag_ids?: number[];
      }
    ) =>
      fetchAPI<Item>(`/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI<void>(`/items/${id}`, { method: 'DELETE' }),
    clearAll: () =>
      fetchAPI<{ message: string; deleted: number }>('/items/clear', {
        method: 'DELETE',
      }),
  },

  entries: {
    list: (itemId: number) => fetchAPI<Entry[]>(`/items/${itemId}/entries`),
    create: (itemId: number, data: { amount: number; date?: string; note?: string }) =>
      fetchAPI<Entry>(`/items/${itemId}/entries`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (
      entryId: number,
      data: { amount?: number; date?: string; note?: string }
    ) =>
      fetchAPI<Entry>(`/entries/${entryId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (entryId: number) =>
      fetchAPI<void>(`/entries/${entryId}`, { method: 'DELETE' }),
  },

  dashboard: {
    get: (params?: {
      sort_by?: SortBy;
      sort_order?: SortOrder;
      tag_id?: number;
      search?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
      if (params?.sort_order) searchParams.set('sort_order', params.sort_order);
      if (params?.tag_id) searchParams.set('tag_id', params.tag_id.toString());
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return fetchAPI<DashboardSummary>(`/dashboard${query ? `?${query}` : ''}`);
    },
  },

  insights: {
    get: () => fetchAPI<InsightsSummary>('/insights'),
  },

  timeseries: {
    get: (itemId: number, range: TimeRange = 'all') =>
      fetchAPI<TimeSeriesResponse>(`/items/${itemId}/timeseries?range=${range}`),
  },

  networthHistory: {
    get: (range: TimeRange = '1y') =>
      fetchAPI<NetWorthHistoryResponse>(`/networth-history?range=${range}`),
  },

  seed: () => fetchAPI<{ message: string }>('/seed', { method: 'POST' }),
};
