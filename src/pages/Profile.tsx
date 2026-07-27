import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Phone, Heart, Mail, Save, Edit3, ArrowLeft, Users } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Set up local state for inputs (including contacts)
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    bloodGroup: currentUser?.bloodGroup || '',
    c1Name: currentUser?.contacts?.[0]?.name || '',
    c1Phone: currentUser?.contacts?.[0]?.phone || '',
    c1Relation: currentUser?.contacts?.[0]?.relation || '',
    c2Name: currentUser?.contacts?.[1]?.name || '',
    c2Phone: currentUser?.contacts?.[1]?.phone || '',
    c2Relation: currentUser?.contacts?.[1]?.relation || '',
    c3Name: currentUser?.contacts?.[2]?.name || '',
    c3Phone: currentUser?.contacts?.[2]?.phone || '',
    c3Relation: currentUser?.contacts?.[2]?.relation || '',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const contacts = [
        { name: formData.c1Name, phone: formData.c1Phone, relation: formData.c1Relation || 'Family' },
        { name: formData.c2Name, phone: formData.c2Phone, relation: formData.c2Relation || 'Friend' },
        { name: formData.c3Name, phone: formData.c3Phone, relation: formData.c3Relation || 'Other' },
      ];

      await updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        contacts: contacts,
        profilePhoto: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formData.name)}`
      });

      showToast('Profile configuration updated successfully.', 'success');
      setIsEditing(false);
    } catch (error: any) {
      showToast(error.message || 'Error updating profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 guardian-mesh-bg text-slate-800 dark:text-white transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6 animate-slide-in">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {t('profileTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('profileDesc')}
            </p>
          </div>
          
          <Button variant="glass" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? (
              <>
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                {t('cancelBtn')}
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-1.5" />
                {t('editBtn')}
              </>
            )}
          </Button>
        </div>

        {/* Profile Card & form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Box: Avatar and Quick details */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
              <img
                src={currentUser?.profilePhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formData.name)}`}
                alt={currentUser?.name}
                className="w-32 h-32 rounded-full border-2 border-sky-500/25 p-1 bg-white dark:bg-slate-900"
              />
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{currentUser?.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
              </div>
              
              <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-200/40 dark:bg-slate-900/30 rounded-2xl border border-slate-250 dark:border-slate-800/50">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{t('bloodType')}</p>
                  <p className="text-sm font-black text-red-500">{currentUser?.bloodGroup || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-200/40 dark:bg-slate-900/30 rounded-2xl border border-slate-250 dark:border-slate-800/50">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{t('networkNodes')}</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200">{currentUser?.contacts?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Right Box: Profile / Contacts inputs */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Section 1: Personal Profile */}
              <div className="glass-panel p-6 rounded-3xl space-y-4 text-left">
                <h4 className="font-bold text-xs uppercase tracking-wider text-sky-600 dark:text-sky-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                  {t('personalInfo')}
                </h4>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="name"
                      name="name"
                      label="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      icon={<User className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                      required
                    />

                    <Input
                      id="phone"
                      name="phone"
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      icon={<Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                      required
                    />

                    <div className="flex flex-col gap-1.5 w-full">
                      <label htmlFor="bloodGroup" className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Blood Group
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 text-slate-400 dark:text-slate-500">
                          <Heart className="w-4 h-4" />
                        </div>
                        <select
                          id="bloodGroup"
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className="w-full glass-input pl-10 pr-4 py-3 text-sm rounded-xl focus:ring-1 focus:ring-sky-500/50 border-slate-300 dark:border-slate-700/50 text-slate-800 dark:text-white bg-white/70 dark:bg-slate-900/90"
                          required
                        >
                          <option value="" disabled>Select Blood Group</option>
                          {bloodGroups.map(bg => (
                            <option key={bg} value={bg} className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900">{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 w-full justify-end pb-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4.5 h-4.5" />
                        <span>Email address: <strong>{currentUser?.email}</strong></span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 italic mt-0.5">(Email modifications require security validation)</span>
                    </div>

                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-550 uppercase font-bold">Node Name</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{currentUser?.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-555 uppercase font-bold">Cellular Connection</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{currentUser?.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-550 uppercase font-bold">Blood Group</p>
                      <span className="inline-flex font-bold text-red-500 mt-1">{currentUser?.bloodGroup || 'Not Configured'}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-550 uppercase font-bold">Authentication Mail</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{currentUser?.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Responder Contacts */}
              <div className="glass-panel p-6 rounded-3xl space-y-4 text-left">
                <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    {t('responderNodes')}
                  </h4>
                </div>

                <div className="space-y-4">
                  {/* Contact 1 */}
                  <div className="p-4 bg-slate-200/40 dark:bg-slate-900/30 rounded-2xl border border-slate-250 dark:border-slate-800/50 space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Responder Node 1 (Primary)</span>
                    {isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input id="c1Name" name="c1Name" placeholder="Name" value={formData.c1Name} onChange={handleChange} />
                        <Input id="c1Phone" name="c1Phone" placeholder="Phone" value={formData.c1Phone} onChange={handleChange} />
                        <Input id="c1Relation" name="c1Relation" placeholder="Relation" value={formData.c1Relation} onChange={handleChange} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Name</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">{currentUser?.contacts?.[0]?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Phone</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{currentUser?.contacts?.[0]?.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Relation</p>
                          <p className="font-semibold text-sky-600 dark:text-sky-400 truncate mt-0.5">{currentUser?.contacts?.[0]?.relation || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact 2 */}
                  <div className="p-4 bg-slate-200/40 dark:bg-slate-900/30 rounded-2xl border border-slate-250 dark:border-slate-800/50 space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Responder Node 2</span>
                    {isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input id="c2Name" name="c2Name" placeholder="Name" value={formData.c2Name} onChange={handleChange} />
                        <Input id="c2Phone" name="c2Phone" placeholder="Phone" value={formData.c2Phone} onChange={handleChange} />
                        <Input id="c2Relation" name="c2Relation" placeholder="Relation" value={formData.c2Relation} onChange={handleChange} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Name</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">{currentUser?.contacts?.[1]?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Phone</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{currentUser?.contacts?.[1]?.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Relation</p>
                          <p className="font-semibold text-sky-600 dark:text-sky-400 truncate mt-0.5">{currentUser?.contacts?.[1]?.relation || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact 3 */}
                  <div className="p-4 bg-slate-200/40 dark:bg-slate-900/30 rounded-2xl border border-slate-250 dark:border-slate-800/50 space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Responder Node 3</span>
                    {isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input id="c3Name" name="c3Name" placeholder="Name" value={formData.c3Name} onChange={handleChange} />
                        <Input id="c3Phone" name="c3Phone" placeholder="Phone" value={formData.c3Phone} onChange={handleChange} />
                        <Input id="c3Relation" name="c3Relation" placeholder="Relation" value={formData.c3Relation} onChange={handleChange} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Name</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">{currentUser?.contacts?.[2]?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Phone</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{currentUser?.contacts?.[2]?.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Relation</p>
                          <p className="font-semibold text-sky-600 dark:text-sky-400 truncate mt-0.5">{currentUser?.contacts?.[2]?.relation || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Form Actions */}
              {isEditing && (
                <div className="flex gap-4">
                  <Button type="submit" variant="primary" size="md" isLoading={loading} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {t('saveBtn')}
                  </Button>
                  <Button type="button" variant="glass" size="md" onClick={() => setIsEditing(false)} className="flex-1">
                    {t('discard')}
                  </Button>
                </div>
              )}

            </div>

          </div>
        </form>

      </div>
    </div>
  );
};
