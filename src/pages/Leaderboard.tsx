import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/firebase';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

interface UserProfile {
  id: string;
  displayName: string;
  photoURL: string;
  totalEarnings: number;
  totalTransactions: number;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setUsers(data as UserProfile[]);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="p-8 text-center font-bold uppercase tracking-widest text-xs">Loading leaderboard...</div>;

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-swiss-black pb-4 gap-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">LEADERBOARD.</h1>
        <span className="swiss-label">Global / Top Savers</span>
      </div>

      <div className="border border-swiss-black bg-swiss-black">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-swiss-white">
                <th className="px-8 py-6 text-left swiss-label border-r border-swiss-black">Rank</th>
                <th className="px-8 py-6 text-left swiss-label border-r border-swiss-black">User</th>
                <th className="px-8 py-6 text-right swiss-label border-r border-swiss-black">Deposits</th>
                <th className="px-8 py-6 text-right swiss-label">Earnings</th>
              </tr>
            </thead>
            <tbody className="bg-swiss-white">
              {users.map((user, index) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-swiss-black hover:bg-swiss-black hover:text-white transition-colors group"
                >
                  <td className="px-8 py-8 border-r border-swiss-black">
                    <span className="text-4xl font-black tracking-tighter">
                      {index < 9 ? `0${index + 1}` : index + 1}
                    </span>
                  </td>
                  <td className="px-8 py-8 border-r border-swiss-black">
                    <div className="flex items-center gap-6">
                      <UserAvatar 
                        userId={user.id} 
                        fallbackPhoto={user.photoURL} 
                        fallbackName={user.displayName}
                        className="h-16 w-16 border border-swiss-black group-hover:border-white overflow-hidden shrink-0 grayscale group-hover:grayscale-0 transition-all"
                      />
                      <span className="text-2xl font-black tracking-tighter uppercase">{user.displayName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right border-r border-swiss-black font-bold text-lg">
                    {user.totalTransactions}
                  </td>
                  <td className="px-8 py-8 text-right">
                    <span className="text-3xl font-black tracking-tighter text-swiss-red group-hover:text-white">
                      $ {user.totalEarnings.toLocaleString()}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-swiss-black">
          {users.map((user, index) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-swiss-white p-6 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <span className="text-4xl font-black tracking-tighter opacity-20">
                  {index < 9 ? `0${index + 1}` : index + 1}
                </span>
                <span className="text-2xl font-black tracking-tighter text-swiss-green">
                  $ {user.totalEarnings.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <UserAvatar 
                  userId={user.id} 
                  fallbackPhoto={user.photoURL} 
                  fallbackName={user.displayName}
                  className="h-12 w-12 border border-swiss-black overflow-hidden shrink-0 grayscale"
                />
                <div>
                  <h3 className="text-xl font-black tracking-tighter uppercase">{user.displayName}</h3>
                  <p className="swiss-label">Deposits: {user.totalTransactions}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
