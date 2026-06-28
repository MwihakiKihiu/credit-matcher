"use client";
import { useState } from "react";
import Link from "next/link";

export default function AdvancedBorrowerForm() {
  const [formData, setFormData] = useState({
    name: "",
    grossSalary: 0,
    purpose: "",
    employment: "Salaried",
  });
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exemptionSubmitted, setExemptionSubmitted] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    setExemptionSubmitted(false);

    // Form data packaging (Simulating statement analysis engine)
    const payload = {
      ...formData,
      // Automated Engine Math Simulation (Simulates the API extraction of 6-month statements)
      moneyIn: formData.grossSalary * 0.95, // Estimated regular deposits
      moneyOut: formData.grossSalary * 0.70, // Estimated regular living expenses
    };

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        alert(`Error processing profile: ${data.error}`);
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

  const handleRequestExemption = async () => {
    try {
      // Direct updates to Supabase via API route or client updating the state
      const response = await fetch("/api/match", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, exemption: true }),
      });
      if (response.ok) {
        setExemptionSubmitted(true);
        alert("Your application has been flagged for Special Exemption and routed to private alternative lenders.");
      }
    } catch (err) {
      alert("Error requesting exemption.");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12 text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-black text-blue-700 tracking-tight">
          CREDIT<span className="text-slate-800">MATCH</span>
        </div>
        <Link href="/lender" className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
          Lender Portal Login &rarr;
        </Link>
      </header>

      <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Automated Credit Underwriting Portal</h1>
        <p className="text-gray-600 mb-6">Upload documents to verify your financial health against the Kenyan 1/3 Salary Rule rule instantly.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Full Name (As shown on ID)</label>
              <input type="text" required className="w-full p-2.5 border rounded-lg" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Gross Basic Salary (KES)</label>
              <input type="number" required className="w-full p-2.5 border rounded-lg" onChange={(e) => setFormData({...formData, grossSalary: Number(e.target.value)})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Employment Context</label>
              <select className="w-full p-2.5 border rounded-lg" onChange={(e) => setFormData({...formData, employment: e.target.value})}>
                <option value="Salaried">Salaried Employee</option>
                <option value="Business Owner">Business Owner / MSME</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Target Asset/Purpose</label>
              <input type="text" required className="w-full p-2.5 border rounded-lg" placeholder="e.g. Mazda CX-5 Financing" onChange={(e) => setFormData({...formData, purpose: e.target.value})} />
            </div>
          </div>

          <div className="p-4 bg-slate-100 rounded-xl border border-dashed border-slate-300">
            <h3 className="font-bold text-sm mb-2 text-slate-700">Required Verification Dossier</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium mb-1 text-slate-600">National ID Card / Passport (PDF/Image)</label>
                <input type="file" required className="w-full bg-white p-1.5 border rounded" />
              </div>
              <div>
                <label className="block font-medium mb-1 text-slate-600">6-Month M-Pesa / Bank Statement (PDF)</label>
                <input type="file" required className="w-full bg-white p-1.5 border rounded" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-400">
            {loading ? "Analyzing Statements & Enforcing Credit Rules..." : "Analyze Affordability & Verify Application"}
          </button>
        </form>

        {/* RESULTS PANEL */}
        {results && (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Engine Analysis Results</h2>
            
            {/* Financial Metrics Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Avg Income (Money In)</p>
                <p className="text-lg font-bold text-slate-800">KSh {results.metrics.moneyIn.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Avg Expenses (Money Out)</p>
                <p className="text-lg font-bold text-red-600">KSh {results.metrics.moneyOut.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 font-medium">1/3 Debt Ceiling Limit</p>
                <p className="text-lg font-bold text-blue-600">KSh {results.metrics.maxAllowedEMI.toLocaleString()}</p>
              </div>
            </div>

            {/* Decision Logic Status */}
            {results.matches.length > 0 ? (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-semibold">
                  ✓ Passed Kenyan 1/3 Rule verification. Matches found below.
                </div>
                {results.matches.map((lender: any, index: number) => (
                  <div key={index} className="p-4 bg-white rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
                    <span className="font-bold text-slate-700">{lender.name}</span>
                    <span className="text-blue-600 font-semibold">Max Qualified LTV: 80%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <h3 className="font-bold text-amber-900 mb-1">Automatic Underwriting Flagged</h3>
                <p className="text-sm text-amber-800 mb-4">
                  Based on your 6-month statement debt obligations, your remaining balance breaches the traditional statutory 1/3 take-home requirement. Tier-1 banks cannot auto-approve this transaction.
                </p>
                {!exemptionSubmitted ? (
                  <button onClick={handleRequestExemption} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors shadow-sm">
                    Apply for Special Exemption (Route to Alternative FinTech Funds)
                  </button>
                ) : (
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full">
                    ✓ Routed to Private Exemption Pipeline
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}