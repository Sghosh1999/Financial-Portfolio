import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3,
  MoreVertical,
  Calendar,
  StickyNote,
  Pencil,
  ChevronDown
} from 'lucide-react';
import { api } from '../api';
import type { Item, Entry, TimeSeriesResponse, TimeRange } from '../types';
import { formatCurrency, formatRelativeTime, formatPercent } from '../utils/format';
import TimeSeriesChart from '../components/TimeSeriesChart';
import AddEntryModal from '../components/AddEntryModal';
import EditItemModal from '../components/EditItemModal';
import EditEntryModal from '../components/EditEntryModal';

const INITIAL_ENTRIES_COUNT = 15;

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<Item | null>(null);
  const [timeseries, setTimeseries] = useState<TimeSeriesResponse | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isTimeseriesLoading, setIsTimeseriesLoading] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [visibleEntriesCount, setVisibleEntriesCount] = useState(INITIAL_ENTRIES_COUNT);

  const itemId = parseInt(id || '0');

  const fetchData = async (resetPagination = false) => {
    try {
      const [itemData, timeseriesData] = await Promise.all([
        api.items.get(itemId),
        api.timeseries.get(itemId, timeRange),
      ]);
      setItem(itemData);
      setTimeseries(timeseriesData);
      if (resetPagination) {
        setVisibleEntriesCount(INITIAL_ENTRIES_COUNT);
      }
    } catch (error) {
      console.error('Failed to fetch item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchData();
    }
  }, [itemId]);

  useEffect(() => {
    if (itemId && !isLoading) {
      setIsTimeseriesLoading(true);
      api.timeseries.get(itemId, timeRange)
        .then(setTimeseries)
        .finally(() => setIsTimeseriesLoading(false));
    }
  }, [timeRange]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item? All entries will be lost.')) return;
    
    try {
      await api.items.delete(itemId);
      navigate('/home');
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('Delete this entry?')) return;
    
    try {
      await api.entries.delete(entryId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const sortedEntries = useMemo(() => {
    if (!item?.entries || item.entries.length === 0) return [];
    return [...item.entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [item?.entries]);

  const visibleEntries = sortedEntries.slice(0, visibleEntriesCount);
  const hasMoreEntries = sortedEntries.length > visibleEntriesCount;
  const remainingCount = sortedEntries.length - visibleEntriesCount;

  const handleShowMore = () => {
    setVisibleEntriesCount(prev => prev + 20);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-dark-600 border-t-accent-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-dark-500">
        <p>Item not found</p>
        <button
          onClick={() => navigate('/home')}
          className="mt-4 px-4 py-2 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  const latestEntry = sortedEntries[0];
  const previousEntry = sortedEntries[1];
  const changeAmount = latestEntry && previousEntry 
    ? latestEntry.amount - previousEntry.amount 
    : 0;
  const changePercent = previousEntry && previousEntry.amount !== 0
    ? (changeAmount / previousEntry.amount) * 100
    : null;

  const isAsset = item.type === 'asset';
  const isPositiveChange = isAsset ? changeAmount >= 0 : changeAmount <= 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-dark-700/50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-dark-800/50 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="font-semibold">{item.name}</h1>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isAsset 
                      ? 'bg-accent-green/20 text-accent-green' 
                      : 'bg-accent-red/20 text-accent-red'
                  }`}>
                    {isAsset ? 'Asset' : 'Liability'}
                  </span>
                  {item.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-dark-800/50 rounded-xl transition-colors"
              >
                <MoreVertical size={20} />
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 glass rounded-xl shadow-xl overflow-hidden min-w-[160px] z-30">
                    <button
                      onClick={() => { 
                        setShowMenu(false); 
                        setShowEditItem(true);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-dark-700/50 transition-colors flex items-center gap-2"
                    >
                      <Edit3 size={16} />
                      Edit Details
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); handleDelete(); }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-dark-700/50 transition-colors flex items-center gap-2 text-accent-red"
                    >
                      <Trash2 size={16} />
                      Delete Item
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Current Value & Change */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-dark-400 mb-1">Current Value</p>
          <h2 className="text-4xl font-bold font-mono">
            {formatCurrency(latestEntry?.amount || 0, item.currency)}
          </h2>
          {changeAmount !== 0 && (
            <p className={`text-sm mt-1 ${isPositiveChange ? 'text-accent-green' : 'text-accent-red'}`}>
              {changeAmount >= 0 ? '+' : ''}{formatCurrency(changeAmount, item.currency, true)}
              {changePercent !== null && ` (${formatPercent(changePercent)})`}
              <span className="text-dark-500"> vs last entry</span>
            </p>
          )}
        </motion.section>

        {/* Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <TimeSeriesChart
            data={timeseries?.data || []}
            currentRange={timeRange}
            onRangeChange={setTimeRange}
            isLoading={isTimeseriesLoading}
          />
        </motion.section>

        {/* Add Entry Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setShowAddEntry(true)}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            isAsset
              ? 'bg-accent-green text-dark-950 hover:bg-accent-green/90'
              : 'bg-accent-red text-white hover:bg-accent-red/90'
          }`}
        >
          <Plus size={20} />
          Add Entry
        </motion.button>

        {/* Entry History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">History</h3>
            <span className="text-sm text-dark-500">
              {sortedEntries.length} {sortedEntries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <div className="space-y-2">
            {visibleEntries.map((entry, index) => {
              const nextEntryInTime = sortedEntries[index + 1] as Entry | undefined;
              const entryChange = nextEntryInTime ? entry.amount - nextEntryInTime.amount : 0;
              const isEntryPositive = isAsset ? entryChange >= 0 : entryChange <= 0;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(0.3 + index * 0.03, 0.6) }}
                  className="flex items-center gap-4 p-4 bg-dark-900/50 hover:bg-dark-800/50 rounded-xl group transition-colors"
                >
                  <div className={`w-1 h-12 rounded-full ${
                    index === 0 
                      ? isAsset ? 'bg-accent-green' : 'bg-accent-red'
                      : 'bg-dark-700'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold font-mono">
                      {formatCurrency(entry.amount, item.currency)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-dark-500">
                      <Calendar size={12} />
                      {formatRelativeTime(entry.date)}
                      {entryChange !== 0 && nextEntryInTime && (
                        <span className={isEntryPositive ? 'text-accent-green' : 'text-accent-red'}>
                          ({entryChange >= 0 ? '+' : ''}{formatCurrency(entryChange, item.currency, true)})
                        </span>
                      )}
                    </div>
                    {entry.note && (
                      <div className="flex items-center gap-1 text-xs text-dark-400 mt-1">
                        <StickyNote size={12} />
                        {entry.note}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingEntry(entry);
                      }}
                      className="p-2 hover:bg-dark-700/50 rounded-lg text-dark-500 hover:text-accent-blue"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }}
                      className="p-2 hover:bg-dark-700/50 rounded-lg text-dark-500 hover:text-accent-red"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {hasMoreEntries && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleShowMore}
                className="w-full py-4 mt-4 rounded-xl border border-dark-700 hover:border-dark-600 hover:bg-dark-800/30 transition-all flex items-center justify-center gap-2 text-dark-400 hover:text-dark-200"
              >
                <ChevronDown size={18} />
                Show More ({remainingCount} more {remainingCount === 1 ? 'entry' : 'entries'})
              </motion.button>
            )}

            {sortedEntries.length === 0 && (
              <div className="text-center py-12 text-dark-500">
                <p>No entries yet</p>
                <p className="text-sm mt-1">Add your first entry to start tracking</p>
              </div>
            )}
          </div>
        </motion.section>
      </main>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddEntry && (
          <AddEntryModal
            itemId={item.id}
            itemName={item.name}
            itemType={item.type}
            onClose={() => setShowAddEntry(false)}
            onSuccess={fetchData}
          />
        )}
      </AnimatePresence>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {showEditItem && (
          <EditItemModal
            item={item}
            onClose={() => setShowEditItem(false)}
            onSuccess={fetchData}
          />
        )}
      </AnimatePresence>

      {/* Edit Entry Modal */}
      <AnimatePresence>
        {editingEntry && (
          <EditEntryModal
            entry={editingEntry}
            itemName={item.name}
            itemType={item.type}
            onClose={() => setEditingEntry(null)}
            onSuccess={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
