import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, TrendingUp, User, Plus, LogOut, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AddItemModal from './AddItemModal';
import { exportPortfolioToFile } from '../utils/portfolioExport';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/insights', icon: TrendingUp, label: 'Insights' },
];

export default function Layout() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'asset' | 'liability'>('asset');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleExportPortfolio = async () => {
    if (!user?.email) return;
    setExporting(true);
    try {
      await exportPortfolioToFile(user.email, user.name);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleAddClick = (type: 'asset' | 'liability') => {
    setAddType(type);
    setShowAddModal(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <main className="flex-1 pb-24 overflow-auto">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-40">
        <div className="relative group">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 bg-accent-green rounded-full shadow-lg shadow-accent-green/25 flex items-center justify-center text-dark-950 font-bold"
          >
            <Plus size={24} strokeWidth={2.5} />
          </motion.button>
          
          {/* Dropdown */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="glass rounded-xl overflow-hidden shadow-2xl min-w-[160px]">
              <button
                onClick={() => handleAddClick('asset')}
                className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-dark-700/50 transition-colors flex items-center gap-3 text-accent-green"
              >
                <Plus size={18} />
                New Asset
              </button>
              <button
                onClick={() => handleAddClick('liability')}
                className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-dark-700/50 transition-colors flex items-center gap-3 text-accent-red"
              >
                <span className="text-lg">−</span>
                New Liability
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-dark-700/50 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-accent-green'
                    : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{label}</span>
              </NavLink>
            );
          })}

          {/* Account/User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ${
                showUserMenu
                  ? 'text-accent-green'
                  : 'text-dark-500 hover:text-dark-300'
              }`}
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center text-[10px] font-bold text-white">
                  {user ? getInitials(user.name) : <User size={14} />}
                </div>
              )}
              <span className="text-xs font-medium">Account</span>
            </button>

            {/* User menu dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-2 glass rounded-xl shadow-2xl overflow-hidden min-w-[200px] z-50"
                  >
                    <div className="p-4 border-b border-dark-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center text-sm font-bold text-white">
                          {user ? getInitials(user.name) : '?'}
                        </div>
                        <div>
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-xs text-dark-400">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        void handleExportPortfolio();
                      }}
                      disabled={exporting || !user?.email}
                      className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-dark-700/50 transition-colors flex items-center gap-3 text-dark-200 disabled:opacity-50 border-b border-dark-700/50"
                    >
                      {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                      Export portfolio (JSON)
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-dark-700/50 transition-colors flex items-center gap-3 text-accent-red"
                    >
                      <LogOut size={18} />
                      Sign out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddItemModal
            type={addType}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
