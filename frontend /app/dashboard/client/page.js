// app/dashboard/client/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Briefcase, Clock, DollarSign, LogOut } from 'lucide-react';

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', budget: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'client') {
      router.push('/dashboard/freelancer');
      return;
    }

    setUser(parsedUser);
    fetchClientJobs(token, parsedUser.id);
  }, [router]);

  const fetchClientJobs = async (token, clientId) => {
    try {
      const res = await fetch('http://localhost:5000/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        // Filter jobs on the frontend to show only those owned by the logged-in client
        const myJobs = data.jobs.filter(job => job.client_id === clientId);
        setJobs(myJobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          budget: parseFloat(formData.budget)
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to create job.');

      // Add new job to the top of the list and reset modal
      setJobs([data.job, ...jobs]);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', budget: '' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-[#6366F1]">Loading workspace...</div>;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F9FAFB] p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-[#24324D] pb-6">
        <div>
          <h1 className="text-3xl font-bold">Client Workspace</h1>
          <p className="text-[#9CA3AF] mt-1">Welcome back, {user?.firstName}. Manage your active listings.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <PlusCircle size={20} /> Post New Gig
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#161F30] hover:bg-[#24324D] border border-[#24324D] px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length === 0 ? (
          <div className="col-span-full text-center py-12 border border-dashed border-[#24324D] rounded-xl bg-[#161F30]/50">
            <Briefcase className="mx-auto h-12 w-12 text-[#4B5563] mb-4" />
            <h3 className="text-lg font-medium text-[#F9FAFB]">No active jobs</h3>
            <p className="text-[#9CA3AF] mt-1">Get started by creating a new job posting.</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="bg-[#161F30] border border-[#24324D] rounded-xl p-6 hover:border-[#6366F1] transition-colors flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold truncate pr-4">{job.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${job.status === 'open' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[#9CA3AF] text-sm line-clamp-3 mb-6">{job.description}</p>
              </div>
              <div className="flex justify-between items-center text-sm font-medium pt-4 border-t border-[#24324D]">
                <div className="flex items-center gap-1 text-[#F9FAFB]"><DollarSign size={16} className="text-[#6366F1]"/> {job.budget}</div>
                <div className="flex items-center gap-1 text-[#9CA3AF]"><Clock size={16}/> {new Date(job.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Create Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161F30] border border-[#24324D] rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Post a New Gig</h2>
            {formError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">{formError}</div>}
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Project Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 rounded-lg border bg-[#0F172A] border-[#24324D] text-[#F9FAFB] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none" placeholder="e.g. Build a React Native App" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Description</label>
                <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 rounded-lg border bg-[#0F172A] border-[#24324D] text-[#F9FAFB] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none" placeholder="Describe the requirements..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Budget ($)</label>
                <input required type="number" min="1" step="0.01" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-3 py-2 rounded-lg border bg-[#0F172A] border-[#24324D] text-[#F9FAFB] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none" placeholder="1000.00" />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-medium hover:bg-[#24324D] transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Posting...' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}