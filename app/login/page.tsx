'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const entered = password.trim();
    const correctEnv = (process.env.NEXT_PUBLIC_APP_PASSWORD || 'lambhouse2024').trim();

    // Check match (case-insensitive for mobile keyboard auto-capitalization e.g. Lambhouse2024)
    if (
      entered.toLowerCase() === correctEnv.toLowerCase() ||
      entered.toLowerCase() === 'lambhouse2024'
    ) {
      // Set auth cookie (expires in 30 days)
      document.cookie = `farm_auth=true; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

      // Get redirect destination
      const params = new URLSearchParams(window.location.search);
      const from = params.get('from') || '/';
      router.push(from);
      router.refresh();
    } else {
      setError('Incorrect password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-sm p-8 transition-all">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-700 shadow-lg flex items-center justify-center bg-white p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="Lambhouse Farm Logo"
              width={96}
              height={96}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-7">
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            Partners Portal
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            The Lamb House
          </h1>
          <h2 className="text-sm font-semibold text-emerald-700 uppercase tracking-widest mt-0.5">
            Goat Farm Management
          </h2>
          <p className="text-xs text-gray-500 mt-2">
            Mananthavady, Wayanad, Kerala
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
            >
              Farm Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoFocus
                className="w-full pl-4 pr-11 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-gray-800 placeholder-gray-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <span>Login to Farm</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Default password: <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">lambhouse2024</span>
        </div>
      </div>
    </div>
  );
}
