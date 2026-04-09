import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { api } from '../api';
import type { Tag, Item } from '../types';

interface EditItemModalProps {
  item: Item;
  onClose: () => void;
  onSuccess: () => void;
}

const TAG_COLORS = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#f97316',
  '#eab308', '#06b6d4', '#ec4899', '#ef4444',
];

export default function EditItemModal({ item, onClose, onSuccess }: EditItemModalProps) {
  const [name, setName] = useState(item.name);
  const [currency, setCurrency] = useState(item.currency);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>(item.tags.map(t => t.id));
  const [newTagName, setNewTagName] = useState('');
  const [showNewTag, setShowNewTag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.tags.list().then(setTags).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await api.items.update(item.id, {
        name: name.trim(),
        currency,
        tag_ids: selectedTags,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update item:', error);
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

  const isAsset = item.type === 'asset';

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
          <div>
            <h2 className="text-lg font-semibold">Edit {isAsset ? 'Asset' : 'Liability'}</h2>
            <p className="text-sm text-dark-400">Update details for {item.name}</p>
          </div>
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
              placeholder={isAsset ? 'e.g., SBI PPF, Mutual Fund' : 'e.g., HDFC Credit Card'}
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/25 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">
              Currency
            </label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/25 transition-all"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
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

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold bg-dark-700 text-dark-200 hover:bg-dark-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                isAsset
                  ? 'bg-accent-green text-dark-950 hover:bg-accent-green/90'
                  : 'bg-accent-red text-white hover:bg-accent-red/90'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
