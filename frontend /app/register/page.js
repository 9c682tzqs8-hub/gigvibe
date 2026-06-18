'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'freelancer', 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
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
            Create your <span className="text-[#6366F1]">GigVibe</span> account
          </h2>
          <p className="mt-2 text-center text-sm text-[#9CA3AF]">
            Join as a developer looking for work or a client sourcing top talent.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">I want to hire or get hired</label>
            <div className="grid grid-cols-2 gap-2 bg-[#0F172A] p-1 rounded-lg border border-[#24324D]">
              <button
                type="button"
                className={`py-2 text-sm font-medium rounded-md transition-all ${formData.role === 'freelancer' ? 'bg-[#6366F1] text-white shadow' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'}`}
                onClick={() => handleRoleSelect('freelancer')}
              >
                Work as Freelancer
              </button>
              <button
                type="button"
                className={`py-2 text-sm font-medium rounded-md transition-all ${formData.role === 'client' ? 'bg-[#6366F1] text-white shadow' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'}`}
                onClick={() => handleRoleSelect('client')}
              >
                Hire Freelancers
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[#9CA3AF] mb-1">First Name</label>
              <input id="firstName" name="firstName" type="text" required className="w-full px-3 py-2 rounded-lg border" value={formData.firstName} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[#9CA3AF] mb-1">Last Name</label>
              <input id="lastName" name="lastName" type="text" required className="w-full px-3 py-2 rounded-lg border" value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#9CA3AF] mb-1">Email Address</label>
            <input id="email" name="email" type="email" required className="w-full px-3 py-2 rounded-lg border" value={formData.email} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#9CA3AF] mb-1">Password</label>
            <input id="password" name="password" type="password" required className="w-full px-3 py-2 rounded-lg border" value={formData.password} onChange={handleChange} />
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#6366F1] hover:bg-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#161F30] focus:ring-[#6366F1] transition-colors disabled:opacity-50 font-semibold">
              {loading ? 'Creating account...' : 'Get Started'}
            </button>
          </div>

          <div className="text-center mt-4">
            <span className="text-sm text-[#9CA3AF]">Already have an account? </span>
            <Link href="/login" className="text-sm font-medium text-[#A855F7] hover:text-[#9333EA] transition-colors">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}