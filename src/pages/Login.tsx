import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Mail, Lock, ArrowRight, Loader2, Eye, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Login() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'citizen' | 'municipal' | 'department'>('citizen');
  const [selectedDept, setSelectedDept] = useState('');
  const [view, setView] = useState<'login' | 'forgot' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Fetch profile immediately for faster redirect
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data();
        if (profile.role === 'citizen') {
          navigate('/citizen-dashboard');
        } else if (profile.role === 'department') {
          navigate('/dept-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Fallback if profile not found immediately
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please check your credentials.");
      } else if (code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        // Strip "Firebase: Error (auth/...)." prefix if present
        const cleanMsg = err.message?.replace(/Firebase: Error \(auth\/.*\)\.?/, '').trim();
        setError(cleanMsg || "Failed to login. Please try again.");
      }
      setIsLoading(false);
    }
  };

  // Redirect after successful login when user profile is loaded
  React.useEffect(() => {
    if (user) {
      if (user.role === 'citizen') {
        navigate('/citizen-dashboard');
      } else if (user.role === 'department') {
        navigate('/dept-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setView('login');
      }, 1500);
    } catch (err: any) {
      console.error("Reset error:", err);
      setError(err.message || "Failed to send reset email");
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user profile in Firestore
      const profileData: any = {
        name: `${firstName} ${lastName}`,
        email: email,
        role: activeTab,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=random`,
        createdAt: new Date().toISOString()
      };

      if (activeTab === 'department') {
        profileData.department = selectedDept || 'General';
      } else if (activeTab === 'municipal') {
        profileData.department = 'Public Works Department';
      }

      if (activeTab === 'citizen') {
        profileData.points = 0;
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), profileData);

      setIsLoading(false);
      setIsSuccess(true);
      
      // Redirect immediately after signup to the appropriate dashboard
      if (activeTab === 'citizen') {
        navigate('/citizen-dashboard');
      } else if (activeTab === 'department') {
        navigate('/dept-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      const code = err.code || '';
      if (code === 'auth/operation-not-allowed') {
        setError("Email/Password signup is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.");
      } else if (code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please login instead.");
      } else if (code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        // Strip "Firebase: Error (auth/...)." prefix if present
        const cleanMsg = err.message?.replace(/Firebase: Error \(auth\/.*\)\.?/, '').trim();
        setError(cleanMsg || "Failed to create account. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        
        {/* Left Side: Visual/Info */}
        <div className={`hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden transition-colors duration-500 ${
          activeTab === 'citizen' ? 'bg-blue-600 dark:bg-blue-700' : 
          activeTab === 'municipal' ? 'bg-rose-600 dark:bg-rose-700' :
          'bg-emerald-600 dark:bg-emerald-700'
        }`}>
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 mb-12">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Eye size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight">{t('app_name')}</span>
            </Link>
            
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-black leading-tight mb-6">
                {activeTab === 'citizen' 
                  ? t('citizen_empower')
                  : activeTab === 'municipal'
                  ? t('municipal_manage')
                  : t('department_manage')}
              </h1>
              <p className="text-lg text-white/80 leading-relaxed max-w-md">
                {activeTab === 'citizen'
                  ? t('citizen_desc')
                  : activeTab === 'municipal'
                  ? t('municipal_desc')
                  : t('municipal_desc')}
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <img 
                  key={i}
                  src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                  className="h-10 w-10 rounded-full border-2 border-white/20" 
                  alt="User"
                />
              ))}
            </div>
            <p className="text-sm font-medium text-white/60">
              Joined by <span className="text-white font-bold">12,000+</span> active users
            </p>
          </div>

          {/* Abstract background shapes */}
          <div className="absolute -bottom-24 -right-24 h-96 w-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-24 -left-24 h-64 w-64 bg-black/10 rounded-full blur-3xl"></div>
        </div>

        {/* Right Side: Form Area */}
        <div className="p-8 md:p-16 flex flex-col justify-center dark:bg-slate-900">
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('login')}</h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">{t('welcome_back')}</p>
                </div>

                {/* Role Selector */}
                <div className="mb-8 flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">
                  <button
                    onClick={() => setActiveTab('citizen')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all ${
                      activeTab === 'citizen'
                        ? 'bg-white text-blue-600 shadow-lg shadow-blue-100 dark:bg-slate-700 dark:text-blue-400 dark:shadow-none'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                  >
                    <User size={18} />
                    {t('citizen_portal')}
                  </button>
                  <button
                    onClick={() => setActiveTab('municipal')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all ${
                      activeTab === 'municipal'
                        ? 'bg-white text-rose-600 shadow-lg shadow-rose-100 dark:bg-slate-700 dark:text-rose-400 dark:shadow-none'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                  >
                    <Shield size={18} />
                    {t('municipal_dashboard')}
                  </button>
                  <button
                    onClick={() => setActiveTab('department')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all ${
                      activeTab === 'department'
                        ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-100 dark:bg-slate-700 dark:text-emerald-400 dark:shadow-none'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                  >
                    <Shield size={18} />
                    {t('departments_login')}
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  {activeTab === 'department' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 dark:text-slate-500">{t('select_department')}</label>
                      <select
                        required
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full rounded-2xl border-none bg-slate-50 py-4.5 px-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-emerald-400"
                      >
                        <option value="" disabled>{t('select_department')}</option>
                        <option value="water">{t('water_dept')}</option>
                        <option value="road">{t('road_dept')}</option>
                        <option value="electrical">{t('electrical_dept')}</option>
                        <option value="sanitation">{t('sanitation_dept')}</option>
                      </select>
                    </motion.div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 dark:text-slate-500">{t('email')}</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors dark:text-slate-500 dark:group-focus-within:text-blue-400" size={20} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={activeTab === 'citizen' ? "citizen@delhi.gov.in" : "admin@mcd.gov.in"}
                        className="w-full rounded-2xl border-none bg-slate-50 py-4.5 pl-12 pr-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 dark:text-slate-500">{t('password')}</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors dark:text-slate-500 dark:group-focus-within:text-blue-400" size={20} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border-none bg-slate-50 py-4.5 pl-12 pr-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800" />
                      <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors dark:text-slate-400 dark:group-hover:text-slate-300">{t('keep_signed_in')}</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setView('forgot')}
                      className="text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {t('forgot_password')}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`mt-4 flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg font-bold text-white shadow-xl transition-all active:scale-95 ${
                      activeTab === 'citizen'
                        ? 'bg-blue-600 shadow-blue-200 hover:bg-blue-700 dark:shadow-none'
                        : activeTab === 'municipal'
                        ? 'bg-rose-600 shadow-rose-200 hover:bg-rose-700 dark:shadow-none'
                        : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700 dark:shadow-none'
                    } disabled:opacity-70`}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        {t('login')}
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-10 text-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    {t('dont_have_account')}{' '}
                    <button 
                      onClick={() => setView('signup')}
                      className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {t('create_account')}
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {view === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <button 
                  onClick={() => setView('login')}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold transition-colors dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft size={20} />
                  {t('back_to_login')}
                </button>
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('reset_password_title')}</h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">{t('reset_password_subtitle')}</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                {isSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] text-center dark:bg-emerald-900/20 dark:border-emerald-800">
                    <CheckCircle className="mx-auto text-emerald-500 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400">{t('email_sent_title')}</h3>
                    <p className="text-emerald-700 dark:text-emerald-500 mt-2">{t('email_sent_desc')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 dark:text-slate-500">{t('email')}</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full rounded-2xl border-none bg-slate-50 py-4.5 pl-12 pr-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-blue-400"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg font-bold text-white bg-blue-600 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all dark:shadow-none"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={24} /> : t('send_reset_link')}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {view === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <button 
                  onClick={() => setView('login')}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold transition-colors dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft size={20} />
                  {t('back_to_login')}
                </button>
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('create_account_title')}</h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">{t('create_account_subtitle')}</p>
                </div>

                {/* Role Selector in Signup */}
                <div className="mb-8 flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">
                  <button
                    onClick={() => setActiveTab('citizen')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                      activeTab === 'citizen'
                        ? 'bg-white text-blue-600 shadow-lg dark:bg-slate-700 dark:text-blue-400'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <User size={16} />
                    {t('citizen')}
                  </button>
                  <button
                    onClick={() => setActiveTab('municipal')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                      activeTab === 'municipal'
                        ? 'bg-white text-rose-600 shadow-lg dark:bg-slate-700 dark:text-rose-400'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <Shield size={16} />
                    {t('municipal')}
                  </button>
                  <button
                    onClick={() => setActiveTab('department')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                      activeTab === 'department'
                        ? 'bg-white text-emerald-600 shadow-lg dark:bg-slate-700 dark:text-emerald-400'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <Shield size={16} />
                    {t('department')}
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                {isSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] text-center dark:bg-emerald-900/20 dark:border-emerald-800">
                    <CheckCircle className="mx-auto text-emerald-500 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400">{t('success_title')}</h3>
                    <p className="text-emerald-700 dark:text-emerald-500 mt-2">{t('account_created_desc')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 dark:text-slate-500">{t('first_name')}</label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full rounded-2xl border-none bg-slate-50 py-4 px-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-blue-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 dark:text-slate-500">{t('last_name')}</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full rounded-2xl border-none bg-slate-50 py-4 px-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-blue-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 dark:text-slate-500">{t('email')}</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border-none bg-slate-50 py-4 px-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 dark:text-slate-500">{t('password')}</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border-none bg-slate-50 py-4 px-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-blue-400"
                      />
                    </div>

                    {activeTab === 'department' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 dark:text-slate-500">{t('select_department')}</label>
                        <select
                          required
                          value={selectedDept}
                          onChange={(e) => setSelectedDept(e.target.value)}
                          className="w-full rounded-2xl border-none bg-slate-50 py-4 px-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-emerald-400"
                        >
                          <option value="" disabled>{t('select_department')}</option>
                          <option value="water">{t('water_dept')}</option>
                          <option value="road">{t('road_dept')}</option>
                          <option value="electrical">{t('electrical_dept')}</option>
                          <option value="sanitation">{t('sanitation_dept')}</option>
                        </select>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg font-bold text-white bg-blue-600 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all dark:shadow-none"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={24} /> : t('create_account_button')}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

