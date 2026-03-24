import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addTransaction, getUserTransactions, db, resetUserEarnings, resetUserHistory, deleteTransaction } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Leaf, Recycle, AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';

interface Transaction {
  id: string;
  wasteBankName: string;
  amount: number;
  date: string;
  wasteType: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEarnings: 0, totalTransactions: 0 });
  const [formData, setFormData] = useState({
    wasteBankName: '',
    amount: '',
    wasteType: 'Recyclable',
    weight: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listen to user stats
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStats({
          totalEarnings: data.totalEarnings || 0,
          totalTransactions: data.totalTransactions || 0
        });
      }
    });

    // Fetch transactions
    const fetchTransactions = async () => {
      try {
        const data = await getUserTransactions(user.uid);
        setTransactions(data as Transaction[]);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    return () => unsubUser();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await addTransaction(user.uid, {
        wasteBankName: formData.wasteBankName,
        amount: Number(formData.amount),
        wasteType: formData.wasteType,
        weight: formData.weight ? Number(formData.weight) : null
      });

      // Refresh transactions list
      const data = await getUserTransactions(user.uid);
      setTransactions(data as Transaction[]);
      
      // Reset form
      setFormData({
        wasteBankName: '',
        amount: '',
        wasteType: 'Recyclable',
        weight: ''
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetData = async () => {
    if (!user) return;
    
    setIsResetting(true);
    try {
      await resetUserHistory(user.uid);
      await resetUserEarnings(user.uid);
      
      // Refresh local state
      setTransactions([]);
      setStats({ totalEarnings: 0, totalTransactions: 0 });
      setShowResetConfirm(false);
    } catch (error) {
      console.error("Error resetting data:", error);
      alert("Failed to reset data. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!user || !transactionToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteTransaction(transactionToDelete.id, user.uid, transactionToDelete.amount);
      
      // Refresh local state
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
      setStats(prev => ({
        totalEarnings: prev.totalEarnings - transactionToDelete.amount,
        totalTransactions: prev.totalTransactions - 1
      }));
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="p-8 text-center font-bold uppercase tracking-widest text-xs">Loading dashboard...</div>;

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-swiss-black pb-4 gap-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">DASHBOARD.</h1>
        <span className="swiss-label">User / {user?.displayName}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-swiss-black border border-swiss-black">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-swiss-white p-6 sm:p-8 md:p-12"
        >
          <span className="swiss-label block mb-2 sm:mb-4">Total Earnings</span>
          <div className="flex items-baseline gap-2 sm:gap-4">
            <span className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-swiss-green">$ {stats.totalEarnings.toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-swiss-white p-6 sm:p-8 md:p-12"
        >
          <span className="swiss-label block mb-2 sm:mb-4">Total Transactions</span>
          <div className="flex items-baseline gap-2 sm:gap-4">
            <span className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter">{stats.totalTransactions}</span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-40">Deposits</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Input Form */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="border-t-4 border-swiss-black pt-8 lg:sticky lg:top-32">
            <h2 className="text-xl md:text-2xl font-black tracking-tighter mb-6 md:mb-8 flex items-center gap-4">
              <Plus className="w-5 h-5 md:w-6 md:h-6" /> NEW DEPOSIT
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <div className="space-y-2">
                <label className="swiss-label">Waste Bank Name</label>
                <input
                  type="text"
                  required
                  value={formData.wasteBankName}
                  onChange={(e) => setFormData({...formData, wasteBankName: e.target.value})}
                  className="w-full px-0 py-2 md:py-3 border-b border-swiss-black bg-transparent focus:border-swiss-green outline-none transition-all font-bold text-base md:text-lg"
                  placeholder="LOCATION NAME"
                />
              </div>
              
              <div className="space-y-2">
                <label className="swiss-label">Amount Earned ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-0 py-2 md:py-3 border-b border-swiss-black bg-transparent focus:border-swiss-green outline-none transition-all font-bold text-base md:text-lg"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="swiss-label">Waste Type</label>
                <select
                  value={formData.wasteType}
                  onChange={(e) => setFormData({...formData, wasteType: e.target.value})}
                  className="w-full px-0 py-2 md:py-3 border-b border-swiss-black bg-transparent focus:border-swiss-green outline-none transition-all font-bold text-base md:text-lg appearance-none cursor-pointer"
                >
                  <option value="Organic">ORGANIC</option>
                  <option value="Recyclable">RECYCLABLE</option>
                  <option value="Hazardous">HAZARDOUS</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="swiss-label">Weight (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full px-0 py-2 md:py-3 border-b border-swiss-black bg-transparent focus:border-swiss-green outline-none transition-all font-bold text-base md:text-lg"
                  placeholder="0.0"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="swiss-button-green w-full py-4 md:py-6"
              >
                {submitting ? 'PROCESSING...' : 'SUBMIT TRANSACTION'}
              </button>
            </form>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-8 space-y-8 md:space-y-12 order-1 lg:order-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-4">
              <Calendar className="w-5 h-5 md:w-6 md:h-6" /> RECENT HISTORY
            </h2>
            {transactions.length > 0 && (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-swiss-red hover:text-swiss-black transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Reset All Data
              </button>
            )}
          </div>
          
          {transactions.length === 0 ? (
            <div className="p-12 md:p-24 border-2 border-dashed border-swiss-black/10 text-center">
              <span className="swiss-label opacity-40">No data available.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-px bg-swiss-black border border-swiss-black">
              {transactions.map((t) => (
                <motion.div 
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-swiss-white p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-swiss-black hover:text-white transition-colors group gap-4"
                >
                  <div className="flex items-center gap-4 md:gap-8 w-full sm:w-auto">
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-swiss-black group-hover:border-white shrink-0">
                      {t.wasteType === 'Organic' ? <Leaf className="w-4 h-4 md:w-5 md:h-5" /> :
                       t.wasteType === 'Recyclable' ? <Recycle className="w-4 h-4 md:w-5 md:h-5" /> :
                       <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base md:text-xl font-black tracking-tighter uppercase truncate max-w-[150px] sm:max-w-none">{t.wasteBankName}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100">{format(new Date(t.date), 'PPP')}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 w-full sm:w-auto border-t sm:border-t-0 border-swiss-black/10 group-hover:border-white/10 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-lg md:text-2xl font-black tracking-tighter text-swiss-green group-hover:text-white">+ ${t.amount.toLocaleString()}</p>
                      <p className="swiss-label group-hover:opacity-100">{t.wasteType}</p>
                    </div>
                    <button 
                      onClick={() => setTransactionToDelete(t)}
                      className="p-2 border border-swiss-black group-hover:border-white hover:bg-swiss-red hover:text-white transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-swiss-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-swiss-white p-8 md:p-12 max-w-md w-full border-t-8 border-swiss-red space-y-8"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-swiss-red/10 flex items-center justify-center rounded-full">
                  <AlertCircle className="w-6 h-6 text-swiss-red" />
                </div>
                <button onClick={() => setShowResetConfirm(false)} className="text-gray-400 hover:text-swiss-black">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-black tracking-tighter uppercase">Reset All Data?</h3>
                <p className="swiss-label text-gray-500 leading-relaxed">
                  This action will permanently delete your entire transaction history and reset your leaderboard earnings to zero. This cannot be undone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="swiss-button bg-swiss-white text-swiss-black border border-swiss-black hover:bg-gray-100"
                >
                  <span className="swiss-label">Cancel</span>
                </button>
                <button 
                  onClick={handleResetData}
                  disabled={isResetting}
                  className="swiss-button bg-swiss-red border-none text-white hover:bg-swiss-black"
                >
                  <span className="swiss-label">{isResetting ? 'RESETTING...' : 'YES, RESET'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transaction Deletion Modal */}
      <AnimatePresence>
        {transactionToDelete && (
          <div className="fixed inset-0 bg-swiss-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-swiss-white p-8 md:p-12 max-w-md w-full border-t-8 border-swiss-red space-y-8"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-swiss-red/10 flex items-center justify-center rounded-full">
                  <AlertCircle className="w-6 h-6 text-swiss-red" />
                </div>
                <button onClick={() => setTransactionToDelete(null)} className="text-gray-400 hover:text-swiss-black">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-black tracking-tighter uppercase">Delete Transaction?</h3>
                <p className="swiss-label text-gray-500 leading-relaxed">
                  This will permanently delete this transaction record and subtract ${transactionToDelete.amount.toLocaleString()} from your total earnings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => setTransactionToDelete(null)}
                  className="swiss-button bg-swiss-white text-swiss-black border border-swiss-black hover:bg-gray-100"
                >
                  <span className="swiss-label">Cancel</span>
                </button>
                <button 
                  onClick={handleDeleteTransaction}
                  disabled={isDeleting}
                  className="swiss-button bg-swiss-red border-none text-white hover:bg-swiss-black"
                >
                  <span className="swiss-label">{isDeleting ? 'DELETING...' : 'YES, DELETE'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
