import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { api } from '../api';

interface AddEntryModalProps {
  itemId: number;
  itemName: string;
  itemType: 'asset' | 'liability';
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEntryModal({ 
  itemId, 
  itemName, 
  itemType,
  onClose, 
  onSuccess 
}: AddEntryModalProps) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSubmitting(true);
    try {
      await api.entries.create(itemId, {
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        note: note || undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to add entry:', error);
    } finally {
      setIsSubmitting(false);
    }
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
          <div>
            <h2 className="text-lg font-semibold">Add Entry</h2>
            <p className="text-sm text-dark-400">{itemName}</p>
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
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/25 transition-all font-mono text-lg"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/25 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g., Monthly contribution"
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/25 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!amount || isSubmitting}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              itemType === 'asset'
                ? 'bg-accent-green text-dark-950 hover:bg-accent-green/90'
                : 'bg-accent-red text-white hover:bg-accent-red/90'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Adding...' : 'Add Entry'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
