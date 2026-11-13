import React, { useState, useEffect } from 'react';
import { Download, Search, RefreshCw, ChevronLeft, ChevronRight, ClipboardList, Trash2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';
import type { SensorReading, CowProfile } from '../services/api';

interface RawDataPageProps {
  selectedCowId: string;
}

export const RawDataPage: React.FC<RawDataPageProps> = ({ selectedCowId }) => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [cows, setCows] = useState<CowProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [cowFilter, setCowFilter] = useState(selectedCowId || 'all');
  const [page, setPage] = useState(0);
  const [limit] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteScope, setDeleteScope] = useState<'all' | 'filtered'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCows = () => {
    api.getCows()
      .then((data) => setCows(data))
      .catch((err) => console.error('Failed to load cows for raw data page:', err));
  };

  useEffect(() => {
    fetchCows();
    const interval = setInterval(fetchCows, 5000);
    const handleCowsUpdated = () => fetchCows();
    window.addEventListener('cows-updated', handleCowsUpdated);
    return () => {
      clearInterval(interval);
      window.removeEventListener('cows-updated', handleCowsUpdated);
    };
  }, []);

  // Synchronize when the user changes the selected cow in the top header
  useEffect(() => {
    if (selectedCowId) {
      setCowFilter(selectedCowId);
      setPage(0);
    }
  }, [selectedCowId]);

  const fetchRawData = () => {
    setIsLoading(true);
    api.getAllRawSensorData(cowFilter === 'all' ? undefined : cowFilter, searchQuery, limit, page * limit)
      .then((res) => {
        setReadings(res.readings || []);
        setTotalCount(res.total_count || 0);
      })
      .catch((err) => console.error('Raw data error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRawData();
  }, [cowFilter, page, searchQuery]);

  const handleExportCsv = () => {
    window.location.href = api.exportCsvUrl(cowFilter === 'all' ? undefined : cowFilter);
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      const targetCow = deleteScope === 'filtered' && cowFilter !== 'all' ? cowFilter : undefined;
      const res = await api.deleteAllSensorData(targetCow);
      setNotification({
        type: 'success',
        message: targetCow
          ? `Successfully deleted all logs for ${targetCow} (${res.deleted_count} records removed).`
          : `Successfully deleted all activity logs (${res.deleted_count} records removed).`
      });
      setShowDeleteConfirmModal(false);
      setPage(0);
      fetchRawData();
      window.dispatchEvent(new Event('sensor-data-updated'));
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error('Delete all sensor data error:', err);
      setNotification({
        type: 'error',
        message: 'Failed to delete logs. Please check backend connection.'
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleDeleteSingle = async (id: number) => {
    if (!window.confirm(`Delete activity log record #${id}?`)) return;
    setDeletingId(id);
    try {
      await api.deleteSensorReading(id);
      setReadings((prev) => prev.filter((r) => r.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setNotification({
        type: 'success',
        message: `Activity log record #${id} deleted successfully.`
      });
      window.dispatchEvent(new Event('sensor-data-updated'));
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      console.error('Failed to delete single reading:', err);
      setNotification({
        type: 'error',
        message: `Failed to delete record #${id}.`
      });
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  // Build the list of cows ensuring current filter is represented
  const hasSelectedInList = cows.some((c) => c.id === cowFilter);
  const displayCows = (cowFilter && cowFilter !== 'all' && !hasSelectedInList)
    ? [{ id: cowFilter, breed: 'Cattle', age: 4, lactation_stage: 'Mid-Lactation', farm: '', location: '', monitoring_start_date: '' }, ...cows]
    : cows;

  const cowMap = new Map<string, CowProfile>(cows.map((c) => [c.id, c]));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="clean-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900">
                Recent Activity & Raw Telemetry Database
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 font-mono">
                {totalCount} Total Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete chronological log of raw physical sensor packets ingested from ESP32 into SQLite database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Dataset</span>
          </button>

          <button
            onClick={() => {
              setDeleteScope(cowFilter !== 'all' ? 'filtered' : 'all');
              setShowDeleteConfirmModal(true);
            }}
            disabled={totalCount === 0 || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            title="Delete all activity logs from database"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All Logs</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 text-sm ml-4 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Activity Logs?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  This action will permanently delete activity log records from the SQLite database. This cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cowFilter !== 'all' ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-semibold text-slate-700">Choose delete scope:</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    checked={deleteScope === 'filtered'}
                    onChange={() => setDeleteScope('filtered')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>Delete logs for currently selected cow: <strong className="text-slate-900">{cowFilter}</strong></span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    checked={deleteScope === 'all'}
                    onChange={() => setDeleteScope('all')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>Delete <strong>ALL</strong> logs across all cows ({totalCount} total)</span>
                </label>
              </div>
            ) : (
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-xs text-rose-800">
                You are about to delete all <strong className="font-bold">{totalCount}</strong> activity log records from the database.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                disabled={isDeletingAll}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={isDeletingAll}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingAll ? 'Deleting Logs...' : 'Yes, Delete Logs'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="clean-card p-4 border border-slate-200 bg-white rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Cow Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Filter Cow:</span>
            <select
              value={cowFilter}
              onChange={(e) => {
                setCowFilter(e.target.value);
                setPage(0);
              }}
              className="bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Registered Cows</option>
              {displayCows.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} ({c.breed || 'Cattle'}{c.farm ? ` • ${c.farm}` : ''})
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID or timestamp..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white w-56 font-medium"
            />
          </div>
        </div>

        {/* Refresh & Pagination info */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <button
            onClick={() => {
              fetchCows();
              fetchRawData();
            }}
            title="Refresh Table"
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <span>
            Page <strong className="text-slate-900">{page + 1}</strong> of{' '}
            <strong className="text-slate-900">{totalPages || 1}</strong>
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Raw Data Table Card */}
      <div className="clean-card rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Record ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Cow ID</th>
                <th className="p-3 text-rose-700">Udder 1 (°C)</th>
                <th className="p-3 text-rose-700">Udder 2 (°C)</th>
                <th className="p-3 text-amber-700">Ambient (°C)</th>
                <th className="p-3 text-blue-700">Humidity (%)</th>
                <th className="p-3 text-teal-700">Activity (g)</th>
                <th className="p-3 text-amber-800">TDS (ppm)</th>
                <th className="p-3">Source Type</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {readings.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500 font-sans text-xs italic">
                    No sensor readings recorded in database yet. Connect ESP32 or activate Demo Mode to generate readings.
                  </td>
                </tr>
              ) : (
                readings.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-slate-400 font-bold">#{r.id}</td>
                    <td className="p-3 text-slate-600 text-[11px] font-sans">
                      {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3 font-sans">
                      <div className="font-bold text-blue-700">{r.cow_id}</div>
                      {cowMap.has(r.cow_id) && (
                        <div className="text-[10px] text-slate-500 font-medium">
                          {cowMap.get(r.cow_id)?.breed}{cowMap.get(r.cow_id)?.farm ? ` • ${cowMap.get(r.cow_id)?.farm}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {r.udder_temp_1 !== null ? `${r.udder_temp_1.toFixed(2)}` : <span className="text-slate-400 font-normal italic">N/A</span>}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {r.udder_temp_2 !== null ? `${r.udder_temp_2.toFixed(2)}` : <span className="text-slate-400 font-normal italic">N/A</span>}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {r.ambient_temp !== null ? `${r.ambient_temp.toFixed(1)}` : <span className="text-slate-400 font-normal italic">N/A</span>}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {r.humidity !== null ? `${r.humidity.toFixed(0)}` : <span className="text-slate-400 font-normal italic">N/A</span>}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {r.activity !== null ? `${r.activity.toFixed(3)}` : <span className="text-slate-400 font-normal italic">N/A</span>}
                    </td>
                    <td className="p-3 font-extrabold text-amber-700">
                      {r.tds_ppm !== null ? `${r.tds_ppm.toFixed(0)}` : <span className="text-slate-400 font-normal italic">N/A</span>}
                    </td>
                    <td className="p-3">
                      {r.is_simulated ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-sans font-bold">
                          SIMULATED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-sans font-bold">
                          REAL HARDWARE
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteSingle(r.id)}
                        disabled={deletingId === r.id}
                        title={`Delete activity log #${r.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
