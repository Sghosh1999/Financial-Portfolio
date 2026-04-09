import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  PieChart, 
  Shield, 
  Sparkles,
  ArrowRight,
  BarChart3,
  Wallet,
  Target,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Track Everything',
    description: 'Monitor stocks, real estate, crypto, savings, PPF, EPF, and any asset you own.',
    color: '#22c55e',
  },
  {
    icon: PieChart,
    title: 'Visual Insights',
    description: 'Beautiful charts showing your allocation, growth trends, and net worth over time.',
    color: '#3b82f6',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Track monthly and quarterly savings with detailed performance breakdowns.',
    color: '#8b5cf6',
  },
  {
    icon: Target,
    title: 'Liability Management',
    description: 'Keep credit cards and loans in check with liability-to-asset ratio tracking.',
    color: '#f97316',
  },
];

const benefits = [
  'Unlimited assets & liabilities',
  'Real-time net worth calculation',
  'Historical performance tracking',
  'Custom tags & categories',
  'Secure & private',
  'Mobile responsive',
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-purple/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center">
            <TrendingUp size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold">WealthTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 text-sm font-medium text-dark-200 hover:text-white transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-5 py-2.5 text-sm font-medium bg-accent-green text-dark-950 rounded-xl hover:bg-accent-green/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm font-medium mb-8"
          >
            <Sparkles size={16} />
            Your complete financial dashboard
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Track Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green via-accent-blue to-accent-purple">
              Net Worth
            </span>
            <br />
            Like Never Before
          </h1>

          <p className="text-xl text-dark-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A beautiful, professional portfolio tracker to monitor all your assets 
            and liabilities in one place. Get insights, track growth, and build wealth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-gradient-to-r from-accent-green to-emerald-500 text-dark-950 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-accent-green/25"
            >
              Start Free Today
              <ArrowRight size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-dark-800/50 text-dark-100 rounded-2xl border border-dark-700 hover:bg-dark-800 transition-colors"
            >
              I have an account
            </motion.button>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent z-10 pointer-events-none" />
          <div className="glass rounded-3xl p-2 border border-dark-700/50 shadow-2xl max-w-5xl mx-auto">
            <div className="bg-dark-900 rounded-2xl p-6 space-y-4">
              {/* Mock dashboard header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-green to-accent-blue" />
                  <div>
                    <div className="h-3 w-24 bg-dark-700 rounded" />
                    <div className="h-2 w-16 bg-dark-800 rounded mt-1" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-dark-800" />
                  <div className="w-8 h-8 rounded-lg bg-dark-800" />
                </div>
              </div>

              {/* Mock chart */}
              <div className="flex items-center justify-center h-48 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full border-[20px] border-accent-green/30" />
                  <div className="absolute w-40 h-40 rounded-full border-[20px] border-transparent border-t-accent-green border-r-accent-blue rotate-45" />
                </div>
                <div className="text-center z-10">
                  <p className="text-xs text-dark-500">Net Worth</p>
                  <p className="text-2xl font-bold text-accent-green">₹30,64,200</p>
                </div>
              </div>

              {/* Mock items */}
              <div className="space-y-2">
                {['House', 'Stocks Portfolio', 'Bank (Cash)'].map((name, i) => (
                  <div key={name} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl">
                    <div className={`w-12 h-8 rounded ${i === 0 ? 'bg-accent-green/20' : i === 1 ? 'bg-accent-blue/20' : 'bg-accent-yellow/20'}`} />
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-dark-700 rounded" />
                      <div className="h-2 w-16 bg-dark-800 rounded mt-1" />
                    </div>
                    <div className="text-right">
                      <div className="h-3 w-16 bg-dark-700 rounded" />
                      <div className="h-2 w-12 bg-accent-green/30 rounded mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-24 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="text-accent-green">Build Wealth</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Powerful features to help you track, analyze, and grow your financial portfolio.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-light rounded-2xl p-6 hover:border-dark-600 transition-colors group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-dark-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-blue">
                  WealthTrack
                </span>
                ?
              </h2>
              <p className="text-dark-400 text-lg mb-8">
                Built by investors, for investors. We understand what it takes to build 
                and track wealth across diverse asset classes.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 size={18} className="text-accent-green flex-shrink-0" />
                    <span className="text-sm text-dark-200">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <Shield size={24} className="text-accent-green" />
                  <div>
                    <p className="font-semibold">Secure & Private</p>
                    <p className="text-sm text-dark-400">Your data never leaves your control</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                    <span className="text-sm text-dark-300">All-Time High</span>
                    <span className="font-semibold text-accent-green">₹30.64L</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                    <span className="text-sm text-dark-300">This Month</span>
                    <span className="font-semibold text-accent-green">+₹3.89L</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                    <span className="text-sm text-dark-300">Liability Ratio</span>
                    <span className="font-semibold text-accent-blue">12.9%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="glass rounded-3xl p-12 border border-dark-700/50 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-accent-green/20 blur-3xl" />
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative">
              Start Tracking Your Wealth Today
            </h2>
            <p className="text-dark-400 text-lg mb-8 relative">
              Join thousands of users who trust WealthTrack to monitor their financial journey.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/signup')}
              className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-accent-green to-emerald-500 text-dark-950 rounded-2xl inline-flex items-center gap-2 shadow-lg shadow-accent-green/25 relative"
            >
              Create Free Account
              <ArrowRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-dark-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="font-semibold">WealthTrack</span>
          </div>
          <p className="text-sm text-dark-500">
            © 2026 WealthTrack. Track your wealth, build your future.
          </p>
        </div>
      </footer>
    </div>
  );
}
