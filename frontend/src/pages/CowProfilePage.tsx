import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Plus,
  RefreshCw,
  Calendar,
  MapPin,
  Building2,
  Tag,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import type { CowProfile } from '../services/api';

interface CowProfilePageProps {
  selectedCowId: string;
}

export const CowProfilePage: React.FC<CowProfilePageProps> = ({ selectedCowId }) => {
  const [profile, setProfile] = useState<CowProfile>({
    id: selectedCowId,
    breed: 'Sahiwal',
    age: 4,
    lactation_stage: 'Mid-lactation (100-200 days)',
    farm: 'Farm A',
    location: 'Karnal, Haryana, India',
    monitoring_start_date: new Date().toISOString().split('T')[0],
    notes: 'Healthy dairy cow monitored for early sub-clinical mastitis.'
  });

  const [cowList, setCowList] = useState<CowProfile[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCowList = async () => {
    setIsLoadingList(true);
    try {
      const cows = await api.getCows();
      setCowList(cows);
    } catch (err: any) {
      console.error('Failed to load cow list:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchCowList();
  }, []);

  useEffect(() => {
    if (selectedCowId) {
      api.getCowProfile(selectedCowId)
        .then((data) => setProfile(data))
        .catch(() => {
          setProfile({
            id: selectedCowId,
            breed: 'Sahiwal',
            age: 4,
            lactation_stage: 'Mid-lactation (100-200 days)',
            farm: 'Farm A',
            location: 'Karnal, Haryana, India',
            monitoring_start_date: new Date().toISOString().split('T')[0],
            notes: ''
          });
        });
    }
  }, [selectedCowId]);

  const handleResetForm = () => {
    const nextNum = cowList.length + 1;
    const newId = `COW_${String(nextNum).padStart(3, '0')}`;
    setProfile({
      id: newId,
      breed: 'Sahiwal',
      age: 3,
      lactation_stage: 'Early-lactation (1-100 days)',
      farm: 'Farm A',
      location: 'Karnal, Haryana, India',
      monitoring_start_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setNotification(null);
  };

  const handleEditCow = (cow: CowProfile) => {
    setProfile(cow);
    setNotification(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCow = async (cowId: string) => {
    if (!window.confirm(`Are you sure you want to delete profile for ${cowId}?`)) return;
    setDeletingId(cowId);
    try {
      await api.deleteCowProfile(cowId);
      setNotification({ type: 'success', message: `Cow profile '${cowId}' successfully deleted.` });
      fetchCowList();
      window.dispatchEvent(new Event('cows-updated'));
      if (profile.id === cowId) {
        handleResetForm();
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: `Failed to delete cow: ${err.message || err}` });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.id.trim()) {
      setNotification({ type: 'error', message: 'Cow Identification Code (ID) is required.' });
      return;
    }
    setIsSaving(true);
    setNotification(null);

    try {
      const saved = await api.saveCowProfile(profile);
      setNotification({
        type: 'success',
        message: `Profile for ${saved.id} (${saved.breed}) saved successfully!`
      });
      fetchCowList();
      window.dispatchEvent(new Event('cows-updated'));
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Failed to save profile: ${err.message || err}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="clean-card p-6 border border-slate-200 bg-white rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900">
                Cow Health & Cattle Profiles
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 font-mono">
                {profile.id || 'New Profile'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage cattle identity, breed, lactation cycle, and dairy farm monitoring records.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetForm}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Cow Profile</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-xs ${
            notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-500 hover:text-slate-800 text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Editor Form Card */}
      <form onSubmit={handleSubmit} className="clean-card p-6 md:p-8 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span>Cattle Profile Details</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {profile.id && cowList.some((c) => c.id === profile.id)
              ? 'Updating existing profile'
              : 'Creating new cattle record'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Cow ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Cow Name / Tag Identification Code (ID)</span>
            </label>
            <input
              type="text"
              value={profile.id}
              onChange={(e) => setProfile({ ...profile, id: e.target.value.toUpperCase() })}
              placeholder="e.g. COW_001, COW_051, COW_0W4, GAURI"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold font-mono focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Breed */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Cattle Breed / Strain
            </label>
            <input
              type="text"
              value={profile.breed}
              onChange={(e) => setProfile({ ...profile, breed: e.target.value })}
              placeholder="e.g. Sahiwal, Gir, Tharparkar, Crossbreed"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Age (Years)
            </label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
              min={1}
              max={25}
            />
          </div>

          {/* Lactation Stage */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Lactation Stage
            </label>
            <select
              value={profile.lactation_stage}
              onChange={(e) => setProfile({ ...profile, lactation_stage: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="Early-lactation (1-100 days)">Early-lactation (1-100 days)</option>
              <option value="Mid-lactation (100-200 days)">Mid-lactation (100-200 days)</option>
              <option value="Late-lactation (200+ days)">Late-lactation (200+ days)</option>
              <option value="Dry Period">Dry Period</option>
            </select>
          </div>

          {/* Farm Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Dairy Farm / Research Facility</span>
            </label>
            <input
              type="text"
              value={profile.farm}
              onChange={(e) => setProfile({ ...profile, farm: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Geographic Location</span>
            </label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Monitoring Start Date */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Monitoring Start Date</span>
            </label>
            <input
              type="date"
              value={profile.monitoring_start_date}
              onChange={(e) => setProfile({ ...profile, monitoring_start_date: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium font-mono focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Cattle Health Observations & Notes</span>
            </label>
            <textarea
              value={profile.notes || ''}
              onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
              rows={3}
              placeholder="Add physical observations, veterinary checks, vaccination status, or milk quality notes..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Profile...' : 'Save Cow Profile'}</span>
          </button>
        </div>
      </form>

      {/* Saved Cattle Profiles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>Registered Cattle in Herd</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
              {cowList.length} Cows
            </span>
          </div>

          <button
            type="button"
            onClick={fetchCowList}
            disabled={isLoadingList}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoadingList ? 'animate-spin' : ''}`} />
            <span>Refresh List</span>
          </button>
        </div>

        {cowList.length === 0 ? (
          <div className="clean-card p-8 text-center border border-slate-200 bg-white rounded-2xl text-slate-500 text-xs space-y-1.5">
            <p className="font-bold text-slate-800 text-sm">No cattle profiles registered yet.</p>
            <p className="text-slate-500">Fill out the form above to add a cow to the monitoring database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cowList.map((cow) => {
              const isSelected = profile.id === cow.id;
              const isDeleting = deletingId === cow.id;

              return (
                <div
                  key={cow.id}
                  className={`clean-card p-5 rounded-2xl border transition-all space-y-3.5 bg-white shadow-xs ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-blue-700 font-mono tracking-tight">
                          {cow.id}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                            Active in Form
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {cow.breed} • {cow.age} years old
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditCow(cow)}
                        title="Edit Cow Profile"
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCow(cow.id)}
                        disabled={isDeleting}
                        title="Delete Cow Profile"
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Lactation Stage</span>
                      <span className="font-semibold text-slate-800 truncate block">{cow.lactation_stage}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Dairy Farm</span>
                      <span className="font-semibold text-slate-800 truncate block">{cow.farm}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
                      <span className="font-semibold text-slate-800 truncate block">{cow.location}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Monitoring Date</span>
                      <span className="font-semibold text-slate-800 font-mono block">{cow.monitoring_start_date}</span>
                    </div>
                  </div>

                  {cow.notes && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      "{cow.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
