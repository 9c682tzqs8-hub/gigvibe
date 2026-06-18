'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid login coordinates.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'client') {
        router.push('/dashboard/client');
      } else {
        router.push('/dashboard/freelancer');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#0B0F19]">
      <div className="max-w-md w-full space-y-8 bg-[#161F30] p-8 rounded-xl border border-[#24324D] shadow-2xl">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
            Welcome back to <span className="text-[#6366F1]">GigVibe</span>
          </h2>
          <p className="mt-2 text-center text-sm text-[#9CA3AF]">
            Sign in to manage active workspaces and ongoing contracts.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#9CA3AF] mb-1">Email Address</label>
              <input id="email" name="email" type="email" required className="w-full px-3 py-2 rounded-lg border" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#9CA3AF] mb-1">Password</label>
              <input id="password" name="password" type="password" required className="w-full px-3 py-2 rounded-lg border" value={formData.password} onChange={handleChange} />
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#6366F1] hover:bg-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#161F30] focus:ring-[#6366F1] transition-colors disabled:opacity-50 font-semibold">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center mt-4">
            <span className="text-sm text-[#9CA3AF]">New to the workspace? </span>
            <Link href="/register" className="text-sm font-medium text-[#A855F7] hover:text-[#9333EA] transition-colors">
              Create an Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}