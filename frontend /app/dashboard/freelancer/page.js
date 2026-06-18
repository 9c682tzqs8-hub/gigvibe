// app/dashboard/freelancer/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Send, Clock, DollarSign, LogOut, UserCircle } from 'lucide-react';

export default function FreelancerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bidding Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [bidData, setBidData] = useState({ bidAmount: '', coverLetter: '' });
  const [bidStatus, setBidStatus] = useState({ loading: false, error: '', success: false });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'freelancer') {
      router.push('/dashboard/client');
      return;
    }

    setUser(parsedUser);
    fetchOpenJobs(token);
  }, [router]);

  const fetchOpenJobs = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/jobs?status=open', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setJobs(data.jobs);
    } catch (error) {
      console.error('Failed to fetch market jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setBidStatus({ loading: true, error: '', success: false });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: selectedJob.id,
          bidAmount: parseFloat(bidData.bidAmount),
          coverLetter: bidData.coverLetter
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit bid.');

      setBidStatus({ loading: false, error: '', success: true });
      setTimeout(() => {
        setSelectedJob(null);
        setBidData({ bidAmount: '', coverLetter: '' });
        setBidStatus({ loading: false, error: '', success: false });
      }, 2000);
    } catch (err) {
      setBidStatus({ loading: false, error: err.message, success: false });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-[#A855F7]">Loading market feed...</div>;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F9FAFB] p-8">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8 border-b border-[#24324D] pb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Market</h1>
          <p className="text-[#9CA3AF] mt-1">Find your next project, {user?.firstName}.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-[#161F30] hover:bg-[#24324D] border border-[#24324D] px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <LogOut size={20} /> Logout
        </button>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        {jobs.length === 0 ? (
          <div className="text-center py-16 border border-[#24324D] rounded-xl bg-[#161F30]/50">
            <Search className="mx-auto h-12 w-12 text-[#4B5563] mb-4" />
            <h3 className="text-lg font-medium">No open jobs right now</h3>
            <p className="text-[#9CA3AF]">Check back later as clients post new opportunities.</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="bg-[#161F30] border border-[#24324D] rounded-xl p-6 hover:border-[#A855F7] transition-all flex flex-col md:flex-row gap-6 justify-between items-start md:items-center group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{job.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#9CA3AF] mb-4">
                  <span className="flex items-center gap-1"><UserCircle size={16}/> {job.first_name} {job.last_name}</span>
                  <span className="flex items-center gap-1"><Clock size={16}/> Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-[#D1D5DB] line-clamp-2">{job.description}</p>
              </div>
              
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-2 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-[#24324D] pt-4 md:pt-0">
                <div className="text-2xl font-bold text-[#F9FAFB] flex items-center">
                  <DollarSign size={24} className="text-[#A855F7]"/>{job.budget}
                </div>
                <button 
                  onClick={() => setSelectedJob(job)}
                  className="bg-[#A855F7] hover:bg-[#9333EA] text-white px-6 py-2 rounded-lg font-medium transition-colors w-full md:w-auto"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Bidding Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161F30] border border-[#24324D] rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <div className="mb-6 pb-4 border-b border-[#24324D]">
              <h2 className="text-xl font-bold mb-1">Submit Proposal</h2>
              <p className="text-[#9CA3AF] text-sm">Bidding on: <span className="text-white font-medium">{selectedJob.title}</span></p>
            </div>

            {bidStatus.success ? (
              <div className="py-8 text-center text-green-400">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
                  <Send size={24} />
                </div>
                <h3 className="text-lg font-bold">Proposal Sent!</h3>
                <p className="text-sm mt-1">The client will review your bid shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleBidSubmit} className="space-y-4">
                {bidStatus.error && <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">{bidStatus.error}</div>}
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Your Bid Amount ($)</label>
                  <input required type="number" min="1" step="0.01" value={bidData.bidAmount} onChange={e => setBidData({...bidData, bidAmount: e.target.value})} className="w-full px-3 py-2 rounded-lg border bg-[#0F172A] border-[#24324D] text-[#F9FAFB] focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] outline-none" placeholder={`Client budget: $${selectedJob.budget}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-1">Cover Letter</label>
                  <textarea required rows={5} value={bidData.coverLetter} onChange={e => setBidData({...bidData, coverLetter: e.target.value})} className="w-full px-3 py-2 rounded-lg border bg-[#0F172A] border-[#24324D] text-[#F9FAFB] focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] outline-none" placeholder="Why are you the best fit for this gig? Highlight relevant experience..." />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => { setSelectedJob(null); setBidStatus({error:'', success:false, loading:false}); }} className="px-4 py-2 rounded-lg font-medium hover:bg-[#24324D] transition-colors">Cancel</button>
                  <button type="submit" disabled={bidStatus.loading} className="px-4 py-2 bg-[#A855F7] hover:bg-[#9333EA] text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                    {bidStatus.loading ? 'Submitting...' : 'Submit Bid'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}