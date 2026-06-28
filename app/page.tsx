"use client";
import { useState } from "react";
import Link from "next/link";

export default function UnderwritingPortal() {
  const [formData, setFormData] = useState({
    name: "",
    grossSalary: 0,
    purpose: "Vehicle Financing",
    employment: "Salaried",
    // Simulation controls to demonstrate document reading text to an investor
    fakeUploadedIdName: "",
    fakeUploadedStatementName: ""
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exemptionSubmitted, setExemptionSubmitted] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    setExemptionSubmitted(false);

    const payload = {
      ...formData,
      moneyIn: formData.grossSalary * 0.95,
      moneyOut: formData.grossSalary * 0.65,
    };

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        alert(data.error || "An error occurred");
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
      const response = await fetch("/api/match", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
      });
      if (response.ok) {
        setExemptionSubmitted(true);
        alert("Routed to Private Exemption Pipeline.");
      }
    } catch (err) {
      alert("Error processing exemption.");
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
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Cross-Document Verification Engine</h1>
        <p className="text-gray-600 mb-6">Enforcing strict document matching parameters to eliminate first-party identity fraud.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Applicant Reference Name</label>
              <input type="text" required placeholder="e.g. John Kamau" className="w-full p-2.5 border rounded-lg" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Gross Basic Salary (KES)</label>
              <input type="number" required className="w-full p-2.5 border rounded-lg" onChange={(e) => setFormData({...formData, grossSalary: Number(e.target.value)})} />
            </div>
          </div>

          {/* INVESTOR INTERACTIVE SCENARIO CONTROLS */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-bold text-sm text-blue-900 mb-2">Investor Demo Control: Document OCR Reader Output</h3>
            <p className="text-xs text-blue-700 mb-4">Simulate what text our AI scanner extracts from the uploaded files to test fraud rejection:</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-slate-600">Name extracted from ID Card</label>
                <input type="text" required placeholder="e.g. John Kamau" className="w-full p-2 bg-white border rounded" onChange={(e) => setFormData({...formData, fakeUploadedIdName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-slate-600">Name found on M-Pesa Statement</label>
                <input type="text" required placeholder="e.g. John Kamau" className="w-full p-2 bg-white border rounded" onChange={(e) => setFormData({...formData, fakeUploadedStatementName: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs">
            <h4 className="font-bold mb-2 text-slate-600">Physical Attachment Dossier Required</h4>
            <div className="grid grid-cols-2 gap-4">
              <input type="file" required className="w-full bg-white p-2 border rounded" />
              <input type="file" required className="w-full bg-white p-2 border rounded" />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
            Run Document Deep Analysis
          </button>
        </form>

        {/* RESULTS FEED */}
        {results && (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Affordability Breakdown</h2>
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Stated Income</p>
                <p className="text-lg font-bold text-slate-800">KSh {results.metrics.moneyIn.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Debt Ceiling</p>
                <p className="text-lg font-bold text-blue-600">KSh {results.metrics.maxAllowedEMI.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Validation Status</p>
                <p className="text-lg font-bold text-green-600">PASSED</p>
              </div>
            </div>

            {results.matches.length > 0 ? (
              <div className="space-y-2">
                {results.matches.map((lender: any, index: number) => (
                  <div key={index} className="p-4 bg-white rounded-lg border flex justify-between items-center shadow-sm">
                    <span className="font-bold text-slate-700">{lender.name}</span>
                    <span className="text-emerald-600 font-semibold text-sm">Verified Clear</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 mb-3">Breaches standard statutory 1/3 limits.</p>
                {!exemptionSubmitted ? (
                  <button onClick={handleRequestExemption} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700">
                    Apply for Special Exemption Pool
                  </button>
                ) : (
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full">Routed to Alternative Pipelines</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}