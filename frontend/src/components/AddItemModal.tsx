import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { api } from '../api';
import type { Tag, ItemType } from '../types';

interface AddItemModalProps {
  type: ItemType;
  onClose: () => void;
}

const TAG_COLORS = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#f97316',
  '#eab308', '#06b6d4', '#ec4899', '#ef4444',
];

export default function AddItemModal({ type, onClose }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTag, setShowNewTag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.tags.list().then(setTags).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    setIsSubmitting(true);
    try {
      const item = await api.items.create({
        name: name.trim(),
        type,
        tag_ids: selectedTags,
      });

      await api.entries.create(item.id, {
        amount: parseFloat(amount),
      });

      window.location.reload();
    } catch (error) {
      console.error('Failed to create item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const tag = await api.tags.create({
        name: newTagName.trim(),
        color: TAG_COLORS[tags.length % TAG_COLORS.length],
      });
      setTags([...tags, tag]);
      setSelectedTags([...selectedTags, tag.id]);
      setNewTagName('');
      setShowNewTag(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md glass rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-dark-700/50">
          <h2 className="text-lg font-semibold">
            Add New {type === 'asset' ? 'Asset' : 'Liability'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-700/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={type === 'asset' ? 'e.g., SBI PPF, Mutual Fund' : 'e.g., HDFC Credit Card'}
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/25 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">
              Current Value (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/25 transition-all font-mono text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'ring-2 ring-offset-2 ring-offset-dark-900'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    ...(selectedTags.includes(tag.id) && { ringColor: tag.color }),
                  }}
                >
                  {tag.name}
                </button>
              ))}
              
              {showNewTag ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    placeholder="Tag name"
                    className="px-3 py-1.5 bg-dark-800/50 border border-dark-700 rounded-full text-sm focus:outline-none focus:border-accent-green/50"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreateTag())}
                  />
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    className="p-1.5 bg-accent-green/20 text-accent-green rounded-full hover:bg-accent-green/30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewTag(true)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-dark-700/50 text-dark-400 hover:bg-dark-700 hover:text-dark-200 transition-colors flex items-center gap-1.5"
                >
                  <TagIcon size={14} />
                  New Tag
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !amount || isSubmitting}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              type === 'asset'
                ? 'bg-accent-green text-dark-950 hover:bg-accent-green/90'
                : 'bg-accent-red text-white hover:bg-accent-red/90'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Creating...' : `Add ${type === 'asset' ? 'Asset' : 'Liability'}`}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
