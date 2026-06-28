'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function LenderDashboard() {
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen text-slate-800">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Asset Finance Lender Portal</h1>

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
        <span className="text-sm text-emerald-600 font-medium bg-emerald-100 px-3 py-1 rounded-full">Live Feed Active</span>
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading live marketplace feed...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Borrower</th>
                <th className="p-4 font-semibold text-slate-600">Employment</th>
                <th className="p-4 font-semibold text-slate-600">Income Stated</th>
                <th className="p-4 font-semibold text-slate-600">Calculated Debt Ceiling</th>
                <th className="p-4 font-semibold text-slate-600">Underwriting Match</th>
                <th className="p-4 font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{deal.name}</td>
                  <td className="p-4 text-slate-600">{deal.employment || "N/A"}</td>
                  <td className="p-4 text-slate-600">KSh {Number(deal.income || 0).toLocaleString()}</td>
                  <td className="p-4 font-medium text-slate-800">
                    KSh {Number(deal.calculated_max_emi || 0).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      deal.system_decision === 'Auto-Approved' ? 'bg-green-100 text-green-800' :
                      deal.system_decision === 'Fraud Flagged' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {deal.system_decision || deal.status || "Pending Review"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => setSelectedDeal(deal)}
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                      Review Asset
                    </button>
                  </td>
                </tr>
              ))}
              {deals.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">No data found in table. Fill out the application form to stream live information!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAILED DRILLDOWN MODAL */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-800">Risk Assessment: {selectedDeal.name}</h3>
              <button onClick={() => setSelectedDeal(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Statement Analysis Metrics</h4>
                  <p className="text-slate-600 text-sm">6-Month Deposits: <span className="font-bold text-slate-800">KSh {Number(selectedDeal.total_money_in || 0).toLocaleString()}</span></p>
                  <p className="text-slate-600 text-sm mt-1">6-Month Debits: <span className="font-bold text-red-600">KSh {Number(selectedDeal.total_money_out || 0).toLocaleString()}</span></p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Statutory Evaluation</h4>
                  <p className="text-slate-600 text-sm">Kenyan 1/3 Limit Ceiling: <span className="font-bold text-blue-600">KSh {Number(selectedDeal.calculated_max_emi || 0).toLocaleString()} /mo</span></p>
                  <p className="text-slate-600 text-sm mt-1">Exemption Status: <span className="font-semibold">{selectedDeal.exemption_requested ? "Yes - Alternative Pool" : "No"}</span></p>
                </div>
              </div>
              <div className="flex space-x-4 pt-4 border-t border-slate-100">
                <button onClick={() => { alert("Deal Approved"); setSelectedDeal(null); }} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700">Approve & Fund</button>
                <button onClick={() => setSelectedDeal(null)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}