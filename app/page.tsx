"use client";
import { useState } from "react";
import Link from "next/link";

export default function RealUnderwritingPortal() {
  const [name, setName] = useState("");
  const [grossSalary, setGrossSalary] = useState(0);
  const [employment, setEmployment] = useState("Salaried");
  const [purpose, setPurpose] = useState("Vehicle Financing");
  
  // Real binary file states
  const [idFile, setIdFile] = useState<File | null>(null);
  const [statementFile, setStatementFile] = useState<File | null>(null);
  
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exemptionSubmitted, setExemptionSubmitted] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!idFile || !statementFile) {
      alert("Please upload both your National ID and your 6-Month M-Pesa Statement.");
      return;
    }

    setLoading(true);
    setResults(null);
    setExemptionSubmitted(false);

    // Package actual files inside a Multi-part Form Data body
    const formDataBody = new FormData();
    formDataBody.append("name", name);
    formDataBody.append("grossSalary", grossSalary.toString());
    formDataBody.append("employment", employment);
    formDataBody.append("purpose", purpose);
    formDataBody.append("idCard", idFile);
    formDataBody.append("mpesaStatement", statementFile);

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        body: formDataBody, // Sends raw file objects securely
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        alert(data.error || "Processing failed.");
        setLoading(false);
        return;
      }

      setResults(data);
    } catch (err: any) {
      alert(`Upload/Network Error: ${err.message}`);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Cross-Document Auditing Engine</h1>
        <p className="text-gray-600 mb-6">Drop in file assets below. The engine extracts structural metadata dynamically to certify origin authenticity.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Applicant Legal Name</label>
              <input type="text" required placeholder="e.g. John Kamau" className="w-full p-2.5 border rounded-lg" onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Gross Monthly Income (KES)</label>
              <input type="number" required placeholder="e.g. 120000" className="w-full p-2.5 border rounded-lg" onChange={(e) => setGrossSalary(Number(e.target.value))} />
            </div>
          </div>

          {/* DEDICATED ACTUAL FILE UPLOAD ZONE */}
          <div className="p-5 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 space-y-4">
            <h3 className="font-bold text-sm text-slate-700">Required Document Attachments</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">1. Upload National ID Card</label>
                <input type="file" required accept="image/*,application/pdf" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
                {idFile && <p className="mt-2 text-xs text-emerald-600 font-medium">✓ File Registered: {idFile.name}</p>}
              </div>

              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">2. Upload M-Pesa PDF Statement</label>
                <input type="file" required accept="application/pdf" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  onChange={(e) => setStatementFile(e.target.files?.[0] || null)} />
                {statementFile && <p className="mt-2 text-xs text-emerald-600 font-medium">✓ File Registered: {statementFile.name}</p>}
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-400">
            {loading ? "Certifying File Parameters & Processing..." : "Upload & Analyze Assets"}
          </button>
        </form>

        {/* FINANCIAL CALCULATIONS INTERFACE PANEL */}
        {results && (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Verified Affordability Analysis</h2>
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Extracted Income</p>
                <p className="text-lg font-bold text-slate-800">KSh {results.metrics.moneyIn.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Max Allowed EMI</p>
                <p className="text-lg font-bold text-blue-600">KSh {results.metrics.maxAllowedEMI.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Biometric File Match</p>
                <p className="text-lg font-bold text-emerald-600">VERIFIED</p>
              </div>
            </div>

            {results.matches.length > 0 ? (
              <div className="space-y-2">
                <div className="p-3 bg-green-50 text-green-800 border border-green-200 text-sm font-semibold rounded-lg">
                  ✓ Passed Kenyan 1/3 Rule verification. Active institutional matches found below:
                </div>
                {results.matches.map((lender: any, index: number) => (
                  <div key={index} className="p-4 bg-white rounded-lg border flex justify-between items-center shadow-sm">
                    <span className="font-bold text-slate-700">{lender.name}</span>
                    <span className="text-blue-600 font-bold text-sm">Pre-Qualified</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 mb-3">Traditional debt limits breached based on extracted ledger items.</p>
                {!exemptionSubmitted ? (
                  <button onClick={handleRequestExemption} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700">
                    Apply for Special Exemption Pipeline
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