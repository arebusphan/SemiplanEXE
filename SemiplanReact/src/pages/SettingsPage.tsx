import { useState, useEffect } from 'react';
import { Save, User, Bell, Calendar, Shield, Plus, Trash2 } from 'lucide-react';
import { getMe, updatePreferences, getUserAvailabilities, updateUserAvailabilities } from '../api/api';

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: string;
  label?: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('scheduling');
  const [isSaving, setIsSaving] = useState(false);

  // Profile
  const [profile, setProfile] = useState<any>(null);

  // Preferences
  const [maxSessionMinutes, setMaxSessionMinutes] = useState(120);
  const [daysOff, setDaysOff] = useState<number[]>([]);
  
  // Availabilities
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const me = await getMe();
      setProfile(me);
      if (me.preferences) {
        const prefs = JSON.parse(me.preferences);
        if (prefs.maxSessionMinutes) setMaxSessionMinutes(prefs.maxSessionMinutes);
        if (prefs.daysOff) setDaysOff(prefs.daysOff);
      }

      const avails = await getUserAvailabilities();
      setAvailabilities(avails.map((a: any) => ({ ...a, id: Math.random().toString() })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const prefs = {
        maxSessionMinutes,
        daysOff
      };
      await updatePreferences(JSON.stringify(prefs));
      
      const availsToSave = availabilities.map(a => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        type: a.type,
        label: a.label || ''
      }));
      await updateUserAvailabilities(availsToSave);
      
      alert("Settings saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDayOff = (dayIdx: number) => {
    if (daysOff.includes(dayIdx)) {
      setDaysOff(daysOff.filter(d => d !== dayIdx));
    } else {
      setDaysOff([...daysOff, dayIdx]);
    }
  };

  const addAvailability = (type: string) => {
    setAvailabilities([
      ...availabilities,
      { id: Math.random().toString(), dayOfWeek: 1, startTime: '08:00', endTime: '10:00', type, label: type === 'Busy' ? 'School' : '' }
    ]);
  };

  const removeAvailability = (id: string) => {
    setAvailabilities(availabilities.filter(a => a.id !== id));
  };

  const updateAvailability = (id: string, field: string, value: any) => {
    setAvailabilities(availabilities.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const freeSlots = availabilities.filter(a => a.type === 'Free');
  const busySlots = availabilities.filter(a => a.type === 'Busy');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your preferences, study schedule rules, and account details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-5 h-5" /> Profile details
          </button>
          <button 
            onClick={() => setActiveTab('scheduling')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'scheduling' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-5 h-5" /> Smart Scheduling
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'notifications' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'security' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-5 h-5" /> Security
          </button>
        </div>

        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 lg:p-8">
            
            {activeTab === 'scheduling' && (
              <div className="space-y-8 animate-fade-in-up">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">AI Scheduling Rules</h2>
                  <p className="text-sm text-slate-500">Configure how SemiPlan's AI should generate your personalized study schedules.</p>
                </div>
                
                <div className="space-y-8">
                  
                  {/* Free Time Slots */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-700">1. Free Time Slots (Khung giờ rảnh)</label>
                      <button onClick={() => addAvailability('Free')} className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Slot
                      </button>
                    </div>
                    <div className="space-y-3">
                      {freeSlots.length === 0 && <p className="text-sm text-slate-400 italic">No free slots defined. AI will try to schedule based on basic preferences.</p>}
                      {freeSlots.map((slot) => (
                        <div key={slot.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-primary-100 bg-primary-50/30">
                          <select 
                            value={slot.dayOfWeek} 
                            onChange={(e) => updateAvailability(slot.id!, 'dayOfWeek', parseInt(e.target.value))}
                            className="border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-primary-500 bg-white"
                          >
                            {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                          </select>
                          <input type="time" value={slot.startTime} onChange={(e) => updateAvailability(slot.id!, 'startTime', e.target.value)} className="border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-primary-500 bg-white" />
                          <span className="text-slate-400">-</span>
                          <input type="time" value={slot.endTime} onChange={(e) => updateAvailability(slot.id!, 'endTime', e.target.value)} className="border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-primary-500 bg-white" />
                          <button onClick={() => removeAvailability(slot.id!)} className="ml-auto p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Busy Time Slots */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-700">2. Fixed Schedules (Lịch cố định)</label>
                      <button onClick={() => addAvailability('Busy')} className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Busy Slot
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">These periods (e.g. School, Work) will be excluded from study time.</p>
                    <div className="space-y-3">
                      {busySlots.length === 0 && <p className="text-sm text-slate-400 italic">No fixed schedules defined.</p>}
                      {busySlots.map((slot) => (
                        <div key={slot.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50/30">
                          <select 
                            value={slot.dayOfWeek} 
                            onChange={(e) => updateAvailability(slot.id!, 'dayOfWeek', parseInt(e.target.value))}
                            className="border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-500 bg-white"
                          >
                            {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                          </select>
                          <input type="time" value={slot.startTime} onChange={(e) => updateAvailability(slot.id!, 'startTime', e.target.value)} className="border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-500 bg-white" />
                          <span className="text-slate-400">-</span>
                          <input type="time" value={slot.endTime} onChange={(e) => updateAvailability(slot.id!, 'endTime', e.target.value)} className="border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-500 bg-white" />
                          <input type="text" placeholder="Label (e.g. Work)" value={slot.label} onChange={(e) => updateAvailability(slot.id!, 'label', e.target.value)} className="border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-500 bg-white min-w-[120px] flex-1" />
                          <button onClick={() => removeAvailability(slot.id!)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Max Study Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">3. Max Study Session Duration (Thời lượng tối đa)</label>
                    <div className="flex flex-wrap gap-3">
                      {[60, 120, 180].map((mins) => (
                        <label key={mins} className={`flex flex-col cursor-pointer border rounded-xl p-3 px-5 transition-colors ${maxSessionMinutes === mins ? 'bg-primary-50 border-primary-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                          <div className="flex items-center gap-2">
                            <input type="radio" name="maxSession" checked={maxSessionMinutes === mins} onChange={() => setMaxSessionMinutes(mins)} className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                            <span className="font-semibold text-slate-700">{mins / 60} {mins === 60 ? 'hour' : 'hours'}/session</span>
                          </div>
                        </label>
                      ))}
                      <label className={`flex flex-col cursor-pointer border rounded-xl p-3 px-5 transition-colors ${![60, 120, 180].includes(maxSessionMinutes) ? 'bg-primary-50 border-primary-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-2">
                          <input type="radio" name="maxSession" checked={![60, 120, 180].includes(maxSessionMinutes)} onChange={() => setMaxSessionMinutes(90)} className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                          <span className="font-semibold text-slate-700">Custom</span>
                        </div>
                        {![60, 120, 180].includes(maxSessionMinutes) && (
                          <div className="mt-2 flex items-center gap-2">
                            <input type="number" value={maxSessionMinutes} onChange={(e) => setMaxSessionMinutes(parseInt(e.target.value) || 60)} className="w-20 border border-slate-200 rounded p-1 text-sm outline-none" /> 
                            <span className="text-xs text-slate-500">mins</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Days Off */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">4. Days Off (Ngày nghỉ)</label>
                    <div className="flex flex-wrap gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                        const isOff = daysOff.includes(idx);
                        return (
                          <button
                            key={day}
                            onClick={() => toggleDayOff(idx)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                              isOff
                                ? 'bg-red-50 text-red-700 border-red-200' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {isOff ? `☑ ${day}` : `☐ ${day}`}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">AI will avoid scheduling study sessions on these days.</p>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'profile' && profile && (
              <div className="space-y-8 animate-fade-in-up">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Profile Details</h2>
                  <p className="text-sm text-slate-500">Update your personal information and academic details.</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/20 uppercase">
                    {profile.name?.substring(0, 2)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input type="text" defaultValue={profile.name} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input type="email" defaultValue={profile.email} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">University</label>
                    <input type="text" defaultValue={profile.university} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Major</label>
                    <input type="text" defaultValue={profile.major} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800" />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
