import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Mail, Lock, ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { AuthService } from './services/authService';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  
  // State for credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      // Quick check: if no token exists locally, skip the network request
      const cachedUser = AuthService.getUser();
      if (!cachedUser) return; // Not logged in, stay on login page

      try {
        // Verify with server (verifyToken also short-circuits if no localStorage token)
        const data = await AuthService.verifyToken();
        if (data && data.user) {
          if (data.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/user-dashboard');
          }
        }
      } catch (err) {
        // Not authenticated, stay on login page
      }
    };
    checkAuth();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const data = await AuthService.login(email, password, role);
        if (data.user?.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      } else {
        await AuthService.signup({ name, email, password });
        navigate('/user-dashboard');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100vh] bg-brand-surface flex flex-col px-4 py-8 overflow-y-auto page-container" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-md w-full m-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-brand-surface-hover">
        {/* Header */}
        <div className="p-8 pb-4 text-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-brand-text-muted hover:text-brand-primary transition-all text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to website
          </button>
          <img src="/logo.jpeg" alt="Logo" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-brand-primary/10 shadow-sm" />
          <h2 className="text-2xl font-bold text-brand-text-main" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-brand-text-muted mt-2">
            {isLogin ? 'Choose your account type to continue' : 'Join Rhythm & Rise for your transformation'}
          </p>
        </div>

        {/* Role Selector (Only show for Login) */}
        {isLogin && (
          <div className="px-8 mb-4">
            <div className="flex p-1 bg-brand-surface rounded-2xl">
              <button
                onClick={() => setRole('user')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${role === 'user' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-text-muted hover:text-brand-text-main'}`}
              >
                <User className="w-4 h-4" />
                <span className="font-medium">User</span>
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${role === 'admin' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-text-muted hover:text-brand-text-main'}`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium">Admin</span>
              </button>
            </div>
          </div>
        )}

        <div className="px-8 pb-8 pt-4">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-brand-text-main mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-brand-surface/50 border border-brand-surface-hover rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all"
                        placeholder="Jane Doe"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-brand-text-main mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-brand-surface/50 border border-brand-surface-hover rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all"
                    placeholder={role === 'admin' ? 'admin@rhythmrise.com' : 'your@email.com'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-text-main mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-brand-surface/50 border border-brand-surface-hover rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                'Login'
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {role !== 'admin' && (
            <div className="mt-8 text-center">
              <p className="text-sm text-brand-text-muted">
                {isLogin ? (
                  <>
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-brand-primary font-semibold hover:underline flex items-center justify-center gap-1 mx-auto mt-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Create an Account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-brand-primary font-semibold hover:underline block mx-auto mt-2"
                    >
                      Back to Login
                    </button>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
