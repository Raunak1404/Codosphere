import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Shield, ShieldOff, Trash2, AlertTriangle,
  Trophy, Flame, Target, Swords, ChevronDown, ChevronUp,
  RefreshCw, Ban, CheckCircle2, X, Clock,
} from 'lucide-react';
import AdminNavbar from '../components/admin/AdminNavbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../services/firebase/admin';
import {
  getAllPlayers,
  banPlayer,
  deletePlayer,
  PlayerData,
} from '../services/firebase/playerManagement';
import { getRankFromPoints } from '../config/constants';

type SortField =
  | 'name'
  | 'problemsSolved'
  | 'totalRankPoints'
  | 'rankWins'
  | 'rankMatches'
  | 'currentStreak'
  | 'bestStreak';
type SortDir = 'asc' | 'desc';

const getRankColor = (rank: string) => {
  switch (rank) {
    case 'Diamond': return 'text-cyan-300 bg-cyan-400/10 border-cyan-400/30';
    case 'Platinum': return 'text-blue-300 bg-blue-400/10 border-blue-400/30';
    case 'Gold': return 'text-yellow-300 bg-yellow-400/10 border-yellow-400/30';
    case 'Silver': return 'text-gray-300 bg-gray-400/10 border-gray-400/30';
    case 'Bronze': return 'text-orange-300 bg-orange-400/10 border-orange-400/30';
    default: return 'text-[var(--text-secondary)] bg-white/[0.04] border-white/[0.08]';
  }
};

const AdminPlayerManagement = () => {
  const { currentUser } = useAuth();
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('problemsSolved');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'ban' | 'unban' | 'delete';
    player: PlayerData;
    reason?: string;
  } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Expanded player detail
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && !isAdmin(currentUser)) {
      window.location.href = '/';
    }
  }, [currentUser]);

  useEffect(() => {
    loadPlayers();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const loadPlayers = async () => {
    setLoading(true);
    setError('');
    try {
      const { players: fetched, error: fetchError } = await getAllPlayers();
      if (fetchError) {
        setError(fetchError);
      } else {
        setPlayers(fetched);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Sorting & filtering
  const filteredPlayers = useMemo(() => {
    let result = [...players];

    // Status filter
    if (filterStatus === 'active') result = result.filter((p) => !p.isBanned);
    if (filterStatus === 'banned') result = result.filter((p) => p.isBanned);

    // Search
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.coderName.toLowerCase().includes(lower) ||
          p.uid.toLowerCase().includes(lower) ||
          (p.email || '').toLowerCase().includes(lower)
      );
    }

    // Sort
    result.sort((a, b) => {
      let va: any, vb: any;
      switch (sortField) {
        case 'name':
          va = (a.name || '').toLowerCase();
          vb = (b.name || '').toLowerCase();
          break;
        case 'problemsSolved':
          va = a.stats.problemsSolved;
          vb = b.stats.problemsSolved;
          break;
        case 'totalRankPoints':
          va = a.stats.totalRankPoints;
          vb = b.stats.totalRankPoints;
          break;
        case 'rankWins':
          va = a.stats.rankWins;
          vb = b.stats.rankWins;
          break;
        case 'rankMatches':
          va = a.stats.rankMatches;
          vb = b.stats.rankMatches;
          break;
        case 'currentStreak':
          va = a.stats.currentStreak;
          vb = b.stats.currentStreak;
          break;
        case 'bestStreak':
          va = a.stats.bestStreak;
          vb = b.stats.bestStreak;
          break;
        default:
          va = 0;
          vb = 0;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [players, searchTerm, sortField, sortDir, filterStatus]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />;
  };

  // Actions
  const handleBan = async () => {
    if (!confirmDialog || confirmDialog.type === 'delete') return;
    const { player, type } = confirmDialog;
    const ban = type === 'ban';
    setActionLoading(player.uid);
    setConfirmDialog(null);
    try {
      const { success, error: err } = await banPlayer(player.uid, ban, banReason);
      if (success) {
        setToast({ message: `${player.name} ${ban ? 'banned' : 'unbanned'} successfully.`, type: 'success' });
        await loadPlayers();
      } else {
        setToast({ message: err || 'Action failed.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setActionLoading(null);
      setBanReason('');
    }
  };

  const handleDelete = async () => {
    if (!confirmDialog || confirmDialog.type !== 'delete') return;
    const { player } = confirmDialog;
    setActionLoading(player.uid);
    setConfirmDialog(null);
    try {
      const { success, error: err } = await deletePlayer(player.uid);
      if (success) {
        setToast({ message: `${player.name}'s account deleted successfully.`, type: 'success' });
        await loadPlayers();
      } else {
        setToast({ message: err || 'Delete failed.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const getWinRate = (p: PlayerData) => {
    if (!p.stats.rankMatches || p.stats.rankMatches === 0) return '—';
    return `${Math.round((p.stats.rankWins / p.stats.rankMatches) * 100)}%`;
  };

  if (!currentUser || !isAdmin(currentUser)) return null;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <AdminNavbar />
        <main className="flex-grow py-12">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center">
                  <Users className="text-[var(--accent)] mr-3" size={28} />
                  <div>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Player Management</h1>
                    <p className="text-[var(--text-secondary)]">View, manage, and moderate all registered players</p>
                  </div>
                </div>
                <button
                  onClick={loadPlayers}
                  className="btn-secondary flex items-center gap-2 text-sm"
                  disabled={loading}
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="card-interactive mb-8 border-red-500 bg-red-900 bg-opacity-20">
                  <div className="flex items-start">
                    <AlertTriangle className="text-red-400 mr-3 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="text-red-400 font-semibold mb-2">Error Loading Players</h3>
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card-interactive text-center">
                  <Users className="text-[var(--accent)] mx-auto mb-2" size={22} />
                  <h3 className="text-2xl font-bold font-display">{players.length}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Total Players</p>
                </div>
                <div className="card-interactive text-center">
                  <CheckCircle2 className="text-emerald-400 mx-auto mb-2" size={22} />
                  <h3 className="text-2xl font-bold font-display">{players.filter((p) => !p.isBanned).length}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Active</p>
                </div>
                <div className="card-interactive text-center">
                  <Ban className="text-red-400 mx-auto mb-2" size={22} />
                  <h3 className="text-2xl font-bold font-display">{players.filter((p) => p.isBanned).length}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Banned</p>
                </div>
                <div className="card-interactive text-center">
                  <Trophy className="text-yellow-400 mx-auto mb-2" size={22} />
                  <h3 className="text-2xl font-bold font-display">
                    {players.filter((p) => (p.stats.totalRankPoints || 0) > 0).length}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">Ranked Players</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search by name, coder name, UID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--primary)] rounded-xl border border-white/[0.06] focus:outline-none focus:border-[var(--accent)] text-sm"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'banned')}
                  className="px-4 py-2.5 bg-[var(--primary)] rounded-xl border border-white/[0.06] focus:outline-none focus:border-[var(--accent)] text-sm"
                >
                  <option value="all">All Players</option>
                  <option value="active">Active Only</option>
                  <option value="banned">Banned Only</option>
                </select>
              </div>

              {/* Table */}
              {!error && (
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                            Player
                          </th>
                          <th
                            className="text-center px-3 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-white select-none"
                            onClick={() => toggleSort('problemsSolved')}
                          >
                            <span className="flex items-center justify-center gap-1">
                              Problems <SortIcon field="problemsSolved" />
                            </span>
                          </th>
                          <th
                            className="text-center px-3 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-white select-none"
                            onClick={() => toggleSort('totalRankPoints')}
                          >
                            <span className="flex items-center justify-center gap-1">
                              Rank Pts <SortIcon field="totalRankPoints" />
                            </span>
                          </th>
                          <th className="text-center px-3 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                            Rank
                          </th>
                          <th
                            className="text-center px-3 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-white select-none"
                            onClick={() => toggleSort('rankMatches')}
                          >
                            <span className="flex items-center justify-center gap-1">
                              Matches <SortIcon field="rankMatches" />
                            </span>
                          </th>
                          <th
                            className="text-center px-3 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-white select-none"
                            onClick={() => toggleSort('rankWins')}
                          >
                            <span className="flex items-center justify-center gap-1">
                              Win % <SortIcon field="rankWins" />
                            </span>
                          </th>
                          <th
                            className="text-center px-3 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-white select-none"
                            onClick={() => toggleSort('currentStreak')}
                          >
                            <span className="flex items-center justify-center gap-1">
                              Streak <SortIcon field="currentStreak" />
                            </span>
                          </th>
                          <th className="text-center px-3 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-white/[0.04]">
                              {Array.from({ length: 9 }).map((_, j) => (
                                <td key={j} className="px-4 py-4">
                                  <div className="h-4 bg-white/[0.04] rounded animate-pulse" />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : filteredPlayers.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-12 text-[var(--text-secondary)]">
                              <Users size={32} className="mx-auto mb-3 opacity-30" />
                              <p>No players found.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredPlayers.map((player) => (
                            <React.Fragment key={player.uid}>
                              <tr
                                className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer ${
                                  player.isBanned ? 'opacity-60' : ''
                                } ${expandedPlayer === player.uid ? 'bg-white/[0.02]' : ''}`}
                                onClick={() => setExpandedPlayer(expandedPlayer === player.uid ? null : player.uid)}
                              >
                                {/* Player info */}
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                      {(player.name || '?')[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium text-white truncate text-sm">
                                        {player.name}
                                        {player.isBanned && (
                                          <span className="ml-2 text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full border border-red-400/20">
                                            BANNED
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-[11px] text-[var(--text-secondary)] truncate">
                                        {player.coderName || player.uid.substring(0, 12) + '...'}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* Problems solved */}
                                <td className="text-center px-3 py-3">
                                  <span className="font-mono font-semibold text-sm">{player.stats.problemsSolved}</span>
                                </td>

                                {/* Rank points */}
                                <td className="text-center px-3 py-3">
                                  <span className="font-mono font-semibold text-sm">{player.stats.totalRankPoints}</span>
                                </td>

                                {/* Rank badge */}
                                <td className="text-center px-3 py-3">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getRankColor(getRankFromPoints(player.stats.totalRankPoints))}`}>
                                    {getRankFromPoints(player.stats.totalRankPoints)}
                                  </span>
                                </td>

                                {/* Matches */}
                                <td className="text-center px-3 py-3">
                                  <span className="text-sm">{player.stats.rankMatches}</span>
                                </td>

                                {/* Win % */}
                                <td className="text-center px-3 py-3">
                                  <span className={`text-sm font-medium ${
                                    getWinRate(player) !== '—'
                                      ? parseInt(getWinRate(player)) >= 50
                                        ? 'text-emerald-400'
                                        : 'text-red-400'
                                      : 'text-[var(--text-secondary)]'
                                  }`}>
                                    {getWinRate(player)}
                                  </span>
                                </td>

                                {/* Streak */}
                                <td className="text-center px-3 py-3">
                                  <div className="flex items-center justify-center gap-1">
                                    {player.stats.currentStreak > 0 && <Flame size={12} className="text-orange-400" />}
                                    <span className="text-sm">{player.stats.currentStreak}</span>
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="text-center px-3 py-3">
                                  {player.isBanned ? (
                                    <span className="flex items-center justify-center gap-1 text-red-400 text-xs">
                                      <Ban size={12} /> Banned
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-1 text-emerald-400 text-xs">
                                      <CheckCircle2 size={12} /> Active
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="text-right px-4 py-3">
                                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    {player.isBanned ? (
                                      <button
                                        onClick={() => setConfirmDialog({ type: 'unban', player })}
                                        disabled={actionLoading === player.uid}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
                                        title="Unban player"
                                      >
                                        <ShieldOff size={12} /> Unban
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => { setBanReason(''); setConfirmDialog({ type: 'ban', player }); }}
                                        disabled={actionLoading === player.uid}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors disabled:opacity-40"
                                        title="Ban player"
                                      >
                                        <Shield size={12} /> Ban
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setConfirmDialog({ type: 'delete', player })}
                                      disabled={actionLoading === player.uid}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                                      title="Delete account"
                                    >
                                      <Trash2 size={12} /> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Expanded row */}
                              <AnimatePresence>
                                {expandedPlayer === player.uid && (
                                  <tr>
                                    <td colSpan={9} className="p-0">
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="px-6 py-5 bg-white/[0.01] border-b border-white/[0.06]">
                                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            <DetailCard icon={<Target size={14} />} label="UID" value={player.uid} small />
                                            <DetailCard icon={<Users size={14} />} label="Display Name" value={player.name} />
                                            <DetailCard icon={<Users size={14} />} label="Coder Name" value={player.coderName || '—'} />
                                            <DetailCard icon={<Trophy size={14} />} label="Problems Solved" value={String(player.stats.problemsSolved)} />
                                            <DetailCard icon={<Swords size={14} />} label="Rank Wins" value={`${player.stats.rankWins} / ${player.stats.rankMatches}`} />
                                            <DetailCard icon={<Flame size={14} />} label="Best Streak" value={String(player.stats.bestStreak)} />
                                            <DetailCard
                                              icon={<Clock size={14} />}
                                              label="Last Solve"
                                              value={player.lastSolveDate || 'Never'}
                                            />
                                            <DetailCard
                                              icon={<Target size={14} />}
                                              label="Solved IDs"
                                              value={
                                                player.solvedProblems.length > 0
                                                  ? player.solvedProblems.slice(0, 10).join(', ') +
                                                    (player.solvedProblems.length > 10 ? ` +${player.solvedProblems.length - 10} more` : '')
                                                  : 'None'
                                              }
                                              small
                                            />
                                            {player.isBanned && player.bannedReason && (
                                              <DetailCard
                                                icon={<Ban size={14} />}
                                                label="Ban Reason"
                                                value={player.bannedReason}
                                                accent="red"
                                              />
                                            )}
                                          </div>
                                        </div>
                                      </motion.div>
                                    </td>
                                  </tr>
                                )}
                              </AnimatePresence>
                            </React.Fragment>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer row */}
                  {!loading && filteredPlayers.length > 0 && (
                    <div className="px-4 py-3 bg-white/[0.01] border-t border-white/[0.06] text-xs text-[var(--text-secondary)]">
                      Showing {filteredPlayers.length} of {players.length} players
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </main>
        <Footer />

        {/* ── Confirm Dialog ── */}
        <AnimatePresence>
          {confirmDialog && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-[var(--secondary)] rounded-xl max-w-md w-full p-6 border border-white/[0.08]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  {confirmDialog.type === 'delete' ? (
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <Trash2 size={20} className="text-red-400" />
                    </div>
                  ) : confirmDialog.type === 'ban' ? (
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Shield size={20} className="text-amber-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <ShieldOff size={20} className="text-emerald-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white">
                      {confirmDialog.type === 'delete'
                        ? 'Delete Account'
                        : confirmDialog.type === 'ban'
                        ? 'Ban Player'
                        : 'Unban Player'}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">{confirmDialog.player.name}</p>
                  </div>
                  <button onClick={() => setConfirmDialog(null)} className="ml-auto p-1.5 hover:bg-white/[0.06] rounded-lg">
                    <X size={16} />
                  </button>
                </div>

                {confirmDialog.type === 'delete' && (
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    This will <strong className="text-red-400">permanently delete</strong>{' '}
                    <strong className="text-white">{confirmDialog.player.name}</strong>'s account, including
                    all their stats, solved problems, and profile data. This action cannot be undone.
                  </p>
                )}

                {confirmDialog.type === 'ban' && (
                  <>
                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                      Ban <strong className="text-white">{confirmDialog.player.name}</strong> from the platform.
                      They won't be able to use the site while banned.
                    </p>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Reason (optional)
                    </label>
                    <input
                      type="text"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--primary)] rounded-lg border border-gray-700 focus:outline-none focus:border-amber-400 text-sm mb-4"
                      placeholder="e.g. Cheating, abusive behavior…"
                    />
                  </>
                )}

                {confirmDialog.type === 'unban' && (
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Unban <strong className="text-white">{confirmDialog.player.name}</strong>?
                    They'll be able to use the platform again.
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmDialog(null)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDialog.type === 'delete' ? handleDelete : handleBan}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      confirmDialog.type === 'delete'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : confirmDialog.type === 'ban'
                        ? 'bg-amber-500 hover:bg-amber-600 text-black'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {confirmDialog.type === 'delete' ? (
                      <><Trash2 size={14} /> Delete Permanently</>
                    ) : confirmDialog.type === 'ban' ? (
                      <><Shield size={14} /> Confirm Ban</>
                    ) : (
                      <><ShieldOff size={14} /> Confirm Unban</>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Toast notification ── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium ${
                toast.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 20, x: 20 }}
            >
              {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-2 hover:opacity-60">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

/* Small reusable detail card for expanded row */
const DetailCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  small?: boolean;
  accent?: string;
}> = ({ icon, label, value, small, accent }) => (
  <div className={`${small ? 'col-span-2' : ''}`}>
    <div className="flex items-center gap-1.5 mb-1">
      <span className={accent === 'red' ? 'text-red-400' : 'text-[var(--accent)]'}>{icon}</span>
      <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{label}</span>
    </div>
    <p className={`text-xs font-medium text-white/80 ${small ? 'break-all' : 'truncate'}`}>{value}</p>
  </div>
);

export default AdminPlayerManagement;
