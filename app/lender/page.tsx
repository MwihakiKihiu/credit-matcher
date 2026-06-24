'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function LenderDashboard() {
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch live submissions from Supabase table
  useEffect(() => {
    async function fetchDeals() {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error pulling deals:", error.message);
      } else {
        setDeals(data || []);
      }
      setLoading(false);
    }

    fetchDeals();
    
    // Set up a real-time subscription to auto-refresh the dashboard when a borrower applies!
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'applications' }, (payload) => {
        setDeals((currentDeals) => [payload.new, ...currentDeals]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto relative bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Asset Finance Lender Portal</h1>

      {/* Metrics Header */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
          <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Active Deals in Pipe</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{loading ? "..." : deals.length}</p>
        </div>
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm">
          <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wider">Platform Avg Yield</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">14.2%</p>
        </div>
        <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm">
          <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wider">Avg Target LTV</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">62%</p>
        </div>
      </div>

      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-slate-800">Live Pre-Vetted Applications</h2>
        <span className="text-sm text-emerald-600 font-medium bg-emerald-100 px-3 py-1 rounded-full animate-pulse">Live Feed Active</span>
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading live marketplace feed...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Borrower</th>
                <th className="p-4 font-semibold text-slate-600">Collateral (Vehicle)</th>
                <th className="p-4 font-semibold text-slate-600">Monthly Income</th>
                <th className="p-4 font-semibold text-slate-600">Requested Loan</th>
                <th className="p-4 font-semibold text-slate-600">Employment</th>
                <th className="p-4 font-semibold text-slate-600">Status</th>
                <th className="p-4 font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{deal.name}</td>
                  <td className="p-4 text-slate-600">{deal.vehicle}</td>
                  <td className="p-4 text-slate-600">KSh {Number(deal.income).toLocaleString()}</td>
                  <td className="p-4 font-medium text-slate-800">KSh {Number(deal.loan_amount).toLocaleString()}</td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm font-medium">{deal.employment}</span></td>
                  <td className="p-4"><span className="text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-xs font-semibold">{deal.status}</span></td>
                  <td className="p-4">
                    <button 
                      onClick={() => setSelectedDeal(deal)}
                      className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
                      Review Asset
                    </button>
                  </td>
                </tr>
              ))}
              {deals.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-400">No applications in database yet. Fill out the borrower form to see them here!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DEAL DETAILS POPUP */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-800">Deal Room: {selectedDeal.name}</h3>
              <button onClick={() => setSelectedDeal(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Asset Details</h4>
                  <p className="font-medium text-slate-800">{selectedDeal.vehicle}</p>
                  <p className="text-slate-600 text-sm mt-1">Purpose: {selectedDeal.purpose}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Financials</h4>
                  <p className="text-slate-600 text-sm">Monthly Income: <span className="font-medium text-slate-800">KSh {Number(selectedDeal.income).toLocaleString()}</span></p>
                  <p className="text-slate-600 text-sm mt-1">Requested Loan: <span className="font-medium text-slate-800">KSh {Number(selectedDeal.loan_amount).toLocaleString()}</span></p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900">KRA Logbook Verification</h4>
                  <p className="text-sm text-blue-700 mt-1">Status: Automated Check Pending Deal Verification</p>
                </div>
                <div className="h-10 w-10 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold">✓</div>
              </div>

              <div className="flex space-x-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => { alert("Deal Approved! Funds will be placed in escrow."); setSelectedDeal(null); }}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                  Approve & Fund
                </button>
                <button 
                  onClick={() => setSelectedDeal(null)}
                  className="flex-1 bg-white border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}