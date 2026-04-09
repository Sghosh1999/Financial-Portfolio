import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Eye, EyeOff, ArrowUpDown, Filter } from 'lucide-react';
import { api } from '../api';
import type { DashboardSummary, Tag, SortBy, SortOrder } from '../types';
import { formatCurrency, getGreeting } from '../utils/format';
import AllocationChart from '../components/AllocationChart';
import NetWorthTrendChart from '../components/NetWorthTrendChart';
import ItemCard from '../components/ItemCard';
import { useAuth } from '../context/AuthContext';

type ViewFilter = 'all' | 'assets' | 'liabilities';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('value');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedTagId, setSelectedTagId] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [hideValues, setHideValues] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, tagsData] = await Promise.all([
          api.dashboard.get({ sort_by: sortBy, sort_order: sortOrder, tag_id: selectedTagId, search }),
          api.tags.list(),
        ]);
        setData(dashboardData);
        setTags(tagsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sortBy, sortOrder, selectedTagId, search]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    
    let items = data.items;
    
    if (viewFilter === 'assets') {
      items = items.filter(item => item.type === 'asset');
    } else if (viewFilter === 'liabilities') {
      items = items.filter(item => item.type === 'liability');
    }
    
    return items;
  }, [data, viewFilter]);

  const assets = useMemo(() => 
    filteredItems.filter(item => item.type === 'asset'),
    [filteredItems]
  );
  
  const liabilities = useMemo(() => 
    filteredItems.filter(item => item.type === 'liability'),
    [filteredItems]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-dark-600 border-t-accent-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-dark-500">
        Failed to load data
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center text-dark-950 font-bold text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </div>
              <div>
                <p className="text-sm text-dark-400">{getGreeting()},</p>
                <p className="font-semibold">{user?.name || 'User'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHideValues(!hideValues)}
                className="p-2.5 hover:bg-dark-800/50 rounded-xl transition-colors"
              >
                {hideValues ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition-colors ${
                  showFilters ? 'bg-accent-green/20 text-accent-green' : 'hover:bg-dark-800/50'
                }`}
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Net Worth Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
        >
          <p className="text-sm text-dark-400 mb-1">Your total net worth is</p>
          <h1 className="text-4xl md:text-5xl font-bold font-mono tracking-tight">
            {hideValues ? '••••••••' : formatCurrency(data.net_worth)}
          </h1>
        </motion.section>

        {/* Charts Row - Side by Side on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allocation Chart */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <AllocationChart data={data.allocation} totalAssets={data.total_assets} />
          </motion.section>

          {/* Net Worth Trend Chart */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <NetWorthTrendChart />
          </motion.section>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-4 space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search assets & liabilities..."
                className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl focus:outline-none focus:border-accent-green/50 text-sm"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-sm text-dark-400">
                <ArrowUpDown size={14} />
                Sort:
              </div>
              {(['value', 'name', 'updated'] as SortBy[]).map(sort => (
                <button
                  key={sort}
                  onClick={() => {
                    if (sortBy === sort) {
                      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                    } else {
                      setSortBy(sort);
                      setSortOrder('desc');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sortBy === sort
                      ? 'bg-accent-green/20 text-accent-green'
                      : 'bg-dark-800/50 text-dark-400 hover:text-dark-200'
                  }`}
                >
                  {sort === 'value' ? 'Highest Value' : sort === 'name' ? 'Name' : 'Recently Updated'}
                  {sortBy === sort && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
                </button>
              ))}
            </div>

            {/* Tags Filter */}
            {tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-sm text-dark-400">
                  <Filter size={14} />
                  Tags:
                </div>
                <button
                  onClick={() => setSelectedTagId(undefined)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !selectedTagId
                      ? 'bg-accent-green/20 text-accent-green'
                      : 'bg-dark-800/50 text-dark-400 hover:text-dark-200'
                  }`}
                >
                  All
                </button>
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTagId(tag.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedTagId === tag.id
                        ? ''
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* View Toggle & List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Assets & Liabilities</h2>
            <div className="flex bg-dark-800 rounded-lg p-1">
              {(['all', 'assets', 'liabilities'] as ViewFilter[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setViewFilter(filter)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                    viewFilter === filter
                      ? 'bg-dark-700 text-white'
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Assets */}
          {(viewFilter === 'all' || viewFilter === 'assets') && assets.length > 0 && (
            <div className="mb-6">
              {viewFilter === 'all' && (
                <h3 className="text-sm font-medium text-dark-400 mb-3">Assets</h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {assets.map((item, index) => (
                  <ItemCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Liabilities */}
          {(viewFilter === 'all' || viewFilter === 'liabilities') && liabilities.length > 0 && (
            <div>
              {viewFilter === 'all' && (
                <h3 className="text-sm font-medium text-dark-400 mb-3">Liabilities</h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {liabilities.map((item, index) => (
                  <ItemCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-dark-500">
              <p>No items found</p>
              <p className="text-sm mt-1">Add your first asset or liability to get started</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
