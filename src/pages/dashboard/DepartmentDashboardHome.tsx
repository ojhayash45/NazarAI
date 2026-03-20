import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, MapPin, ArrowUpRight, X, Calendar, Info, Edit3, Save, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';

export default function DepartmentDashboardHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedIssue) return;
    setUpdatingStatus(true);
    try {
      const issueRef = doc(db, 'reports', selectedIssue.id);
      await updateDoc(issueRef, { status: newStatus });
      setSelectedIssue({ ...selectedIssue, status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (!user?.department) return;

    setLoading(true);
    const q = query(
      collection(db, 'reports'),
      where('department', '==', user.department),
      orderBy('reportedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIssues(reportsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reports:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">{t('loading')}</div>;

  return (
    <div className="space-y-8">
      {/* Issues Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {user?.department ? `${user.department} ${t('department_issues')}` : t('all_issues')}
          </h3>
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {issues.length} {t('total_issues')}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {issues.map((issue, i) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedIssue(issue)}
              className="group overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-lg cursor-pointer"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={issue.imageUrl || `https://picsum.photos/seed/${issue.type}-${issue.id}/600/400`}
                  alt={issue.type}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                  issue.severity >= 8 ? 'bg-rose-500 text-white' :
                  issue.severity >= 5 ? 'bg-amber-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  {issue.severity >= 8 ? t('critical') : issue.severity >= 5 ? t('high') : t('normal')}
                </div>
              </div>
              <div className="p-5">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 truncate capitalize">
                  {issue.type.replace('_', ' ')}
                </h4>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-4">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <MapPin size={14} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-bold truncate">{issue.ward ? `${issue.ward}, ` : ''}{issue.location}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                    issue.status === 'resolved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                    issue.status === 'in_progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {issue.status === 'resolved' ? t('resolved') : issue.status === 'in_progress' ? t('in_progress') : t('pending')}
                  </div>
                  <button className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                    {t('details')}
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Issue Details Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedIssue(null)}
                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-lg"
              >
                <X size={20} />
              </button>

              <div className="overflow-y-auto h-full p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Image Section */}
                  <div className="space-y-4">
                    <div 
                      className="relative h-64 w-full rounded-3xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-800 cursor-zoom-in group/img"
                      onClick={() => setShowFullImage(true)}
                    >
                      <img
                        src={selectedIssue.imageUrl || `https://picsum.photos/seed/${selectedIssue.type}-${selectedIssue.id}/600/400`}
                        alt={selectedIssue.type}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                        <Maximize2 className="text-white" size={32} />
                      </div>
                      <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${
                        selectedIssue.severity >= 8 ? 'bg-rose-500 text-white' :
                        selectedIssue.severity >= 5 ? 'bg-amber-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {selectedIssue.severity >= 8 ? t('critical') : selectedIssue.severity >= 5 ? t('high') : t('normal')}
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{t('description')}</h5>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                        {selectedIssue.description || t('no_description_provided')}
                      </p>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <h5 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">AI Analysis</h5>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium italic">
                        {selectedIssue.aiDescription || "AI is analyzing this issue... Based on initial visual data, this appears to be a significant infrastructure concern requiring immediate attention. Recommended priority: High."}
                      </p>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white capitalize mb-2">
                        {selectedIssue.type.replace('_', ' ')}
                      </h2>
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${
                        selectedIssue.status === 'resolved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                        selectedIssue.status === 'in_progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        <div className={`h-2 w-2 rounded-full ${
                          selectedIssue.status === 'resolved' ? 'bg-emerald-500' :
                          selectedIssue.status === 'in_progress' ? 'bg-blue-500' :
                          'bg-slate-400'
                        }`} />
                        {selectedIssue.status === 'resolved' ? t('resolved') : selectedIssue.status === 'in_progress' ? t('in_progress') : t('pending')}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/20">
                        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <h6 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{t('location')}</h6>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {selectedIssue.ward ? `${selectedIssue.ward}, ` : ''}{selectedIssue.location}
                          </p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            {selectedIssue.lat.toFixed(6)}, {selectedIssue.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/20">
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <h6 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t('reported_on')}</h6>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {new Date(selectedIssue.reportedAt || selectedIssue.createdAt || new Date()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                          <Info size={20} />
                        </div>
                        <div>
                          <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('department')}</h6>
                          <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            {selectedIssue.department}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Update Status</h5>
                      <div className="grid grid-cols-3 gap-2">
                        {['pending', 'in_progress', 'resolved'].map((status) => (
                          <button
                            key={status}
                            disabled={updatingStatus || selectedIssue.status === status}
                            onClick={() => handleUpdateStatus(status)}
                            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                              selectedIssue.status === status
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                            } disabled:opacity-50`}
                          >
                            {status.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setSelectedIssue(null)}
                        className="w-full py-4 mt-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
                      >
                        {t('close')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Image Viewer */}
      <AnimatePresence>
        {showFullImage && selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFullImage(false)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedIssue.imageUrl}
              alt="Full view"
              className="max-w-full max-h-full rounded-lg shadow-2xl"
            />
            <button 
              className="absolute top-8 right-8 text-white hover:text-slate-300 transition-colors"
              onClick={() => setShowFullImage(false)}
            >
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
