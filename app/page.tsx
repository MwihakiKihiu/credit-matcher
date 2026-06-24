"use client";
import { useState } from "react";
import Link from "next/link";

export default function BorrowerForm() {
  const [formData, setFormData] = useState({
    name: "",
    income: 0, 
    loanAmount: 0, 
    purpose: "",
    employment: "Salaried",
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        alert(`Database Connection Error: ${data.error || "Unknown backend issue"}`);
        setLoading(false);
        return;
      }

      setResults(data);
    } catch (err: any) {
      alert(`Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-black text-blue-700 tracking-tight">
          CREDIT<span className="text-slate-800">MATCH</span>
        </div>
        <Link 
          href="/lender" 
          className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Lender Portal Login &rarr;
        </Link>
      </header>

      {/* BORROWER FORM */}
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Apply for Financing</h1>
        <p className="text-gray-600 mb-6">Apply once. Get matched only with lenders likely to approve you.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" required className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Income (KES)</label>
              <input type="number" required className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, income: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Desired Loan Amount (KES)</label>
              <input type="number" required className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, loanAmount: Number(e.target.value)})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Employment Status</label>
            <select className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, employment: e.target.value})}>
              <option value="Salaried">Salaried Employee</option>
              <option value="Business Owner">Business Owner / SME</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Loan Purpose</label>
            <input type="text" required className="w-full p-2 border rounded" placeholder="e.g. Business Expansion" onChange={(e) => setFormData({...formData, purpose: e.target.value})} />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? "Processing Profile..." : "Evaluate My Application"}
          </button>
        </form>

        {/* RESULTS PANEL WITH CRASH PROTECTION */}
        {results && results.matches && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-bold mb-4 text-blue-900">Your Matching Results</h2>
            <p className="mb-4 text-sm text-gray-600">Our engine filtered your profile against active lender rules.</p>
            <div className="space-y-3">
              {results.matches.map((lender: any, index: number) => (
                <div key={index} className="p-4 bg-white rounded border flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-800">{lender.name}</span>
                    <span className="ml-3 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Qualified</span>
                  </div>
                  <span className="text-blue-600 font-semibold">Probability: {lender.probability}%</span>
                </div>
              ))}
              {results.matches.length === 0 && <p className="text-red-500">No lenders match your criteria at this time.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}