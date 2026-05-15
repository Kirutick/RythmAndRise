import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Mail, Lock, ArrowLeft, Loader2, UserPlus, KeyRound, RefreshCw } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './components/ui/input-otp';
import { AuthService } from './services/authService';

export default function LoginPage() {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  
  // State for credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // State for OTP
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Resend timer logic
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev: number) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (step === 'credentials') {
        if (isLogin) {
          const res = await AuthService.loginStep1(email, password, role);
          setVerificationId(res.verificationId);
          setStep('otp');
          setResendTimer(60); // 1 minute cooldown
        } else {
          const res = await AuthService.signupStep1({ name, email, password });
          setVerificationId(res.verificationId);
          setStep('otp');
          setResendTimer(60);
        }
      } else {
        if (isLogin) {
          await AuthService.loginStep2(email, otp, verificationId, role);
          navigate(role === 'admin' ? '/admin' : '/user-dashboard');
        } else {
          await AuthService.signupStep2({ name, email, password }, otp, verificationId);
          alert('Account created successfully! Please log in.');
          setIsLogin(true);
          setStep('credentials');
          setOtp('');
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      const res = await AuthService.resendOTP(verificationId);
      setVerificationId(res.verificationId);
      setResendTimer(60);
      alert('A new OTP has been sent to your email.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100vh] bg-brand-surface flex flex-col px-4 py-8 overflow-y-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-md w-full m-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-brand-surface-hover">
        {/* Header */}
        <div className="p-8 pb-4 text-center">
          <button 
            onClick={() => step === 'otp' ? setStep('credentials') : navigate('/')}
            className="flex items-center gap-2 text-brand-text-muted hover:text-brand-primary transition-all text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'otp' ? 'Back to details' : 'Back to website'}
          </button>
          <img src="/logo.jpeg" alt="Logo" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-brand-primary/10 shadow-sm" />
          <h2 className="text-2xl font-bold text-brand-text-main" style={{ fontFamily: 'Playfair Display, serif' }}>
            {step === 'otp' ? 'Verify OTP' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h2>
          <p className="text-brand-text-muted mt-2">
            {step === 'otp' 
              ? `Enter the 6-digit code sent to ${email}`
              : (isLogin ? 'Choose your account type to continue' : 'Join Rhythm & Rise for your transformation')}
          </p>
        </div>

        {/* Role Selector (Only show for Login and Step 1) */}
        {isLogin && step === 'credentials' && (
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
            {step === 'credentials' ? (
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
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 bg-brand-surface rounded-2xl">
                    <KeyRound className="w-8 h-8 text-brand-primary" />
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <InputOTPSlot key={i} index={i} className="w-12 h-14 text-xl font-bold bg-brand-surface border-brand-surface-hover" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  
                  <div className="text-center">
                    <p className="text-sm text-brand-text-muted mb-2">Didn't receive the code?</p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || isLoading}
                      className={`flex items-center gap-2 mx-auto font-bold text-sm transition-all ${resendTimer > 0 ? 'text-brand-text-muted' : 'text-brand-primary hover:underline'}`}
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (step === 'otp' && otp.length < 6)}
              className="w-full py-4 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : step === 'credentials' ? (
                isLogin ? `Continue to OTP` : 'Send Verification Code'
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>

          {step === 'credentials' && role !== 'admin' && (
            <div className="mt-8 text-center">
              <p className="text-sm text-brand-text-muted">
                {isLogin ? (
                  <>
                    Don't have an account?{' '}
                    <button 
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
