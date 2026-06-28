"use client";
import { useState } from "react";
import Link from "next/link";

export default function SmartUnderwritingPortal() {
  const [name, setName] = useState("");
  const [loanAmount, setLoanAmount] = useState(0);
  const [employment, setEmployment] = useState("Salaried");
  const [purpose, setPurpose] = useState("Vehicle Financing");
  
  const [idFile, setIdFile] = useState<File | null>(null);
  const [statementFile, setStatementFile] = useState<File | null>(null);
  const [payslipFile, setPayslipFile] = useState<File | null>(null);
  const [registrationFile, setRegistrationFile] = useState<File | null>(null);
  
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exemptionSubmitted, setExemptionSubmitted] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!idFile || !statementFile) {
      alert("Please upload both your National ID and M-Pesa Statement.");
      return;
    }

    setLoading(true);
    setResults(null);
    setExemptionSubmitted(false);

    const formDataBody = new FormData();
    formDataBody.append("name", name);
    formDataBody.append("loanAmount", loanAmount.toString());
    formDataBody.append("employment", employment);
    formDataBody.append("purpose", purpose);
    formDataBody.append("idCard", idFile);
    formDataBody.append("mpesaStatement", statementFile);
    
    if (employment === "Salaried" && payslipFile) {
      formDataBody.append("verificationDoc", payslipFile);
    } else if (employment === "Business Owner" && registrationFile) {
      formDataBody.append("verificationDoc", registrationFile);
    }

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        body: formDataBody,
      });
      
      const data = await response.json();
      if (!response.ok || data.error) {
        alert(data.error || "Processing failed.");
        setLoading(false);
        return;
      }
      setResults(data.metrics);
    } catch (err: any) {
      alert(`Upload Error: ${err.message}`);
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
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Dynamic Multi-Asset Analysis Engine</h1>
        <p className="text-gray-600 mb-6">State your financing request. Our engine calculates your exact credit capacity securely off your uploaded statement parameters.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Applicant Legal Name</label>
              <input type="text" required placeholder="e.g. Jane Omwamba" className="w-full p-2.5 border rounded-lg" onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Target Asset Type / Purpose</label>
              <input type="text" required placeholder="e.g. Toyota Hiace Matatu" className="w-full p-2.5 border rounded-lg" onChange={(e) => setPurpose(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Employment Context</label>
              <select className="w-full p-2.5 border rounded-lg bg-white" value={employment} onChange={(e) => setEmployment(e.target.value)}>
                <option value="Salaried">Salaried Employee</option>
                <option value="Business Owner">Business Owner / MSME</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Requested Capital Financing (KES)</label>
              <input type="number" required placeholder="e.g. 2500000" className="w-full p-2.5 border rounded-lg" onChange={(e) => setLoanAmount(Number(e.target.value))} />
            </div>
          </div>

          {/* DYNAMIC DOCUMENT BOX */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide">Required Underwriting Attachments</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <label className="block text-xs font-bold text-gray-500 mb-2">1. Upload National ID Card</label>
                <input type="file" required accept="image/*,application/pdf" className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700" 
                  onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
              </div>
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <label className="block text-xs font-bold text-gray-500 mb-2">2. Upload 6-Month M-Pesa Statement</label>
                <input type="file" required accept="application/pdf" className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700" 
                  onChange={(e) => setStatementFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              {employment === "Salaried" ? (
                <div>
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">3. Required: Upload Latest Official Pay Slip</label>
                  <input type="file" required accept="application/pdf,image/*" className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-blue-600 file:text-white" 
                    onChange={(e) => setPayslipFile(e.target.files?.[0] || null)} />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">3. Required: Business Registration Certificate (BRS/CR12)</label>
                  <input type="file" required accept="application/pdf,image/*" className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white" 
                    onChange={(e) => setRegistrationFile(e.target.files?.[0] || null)} />
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-400">
            {loading ? "Reading Statement Ledger Records..." : "Process Affordability Verification"}
          </button>
        </form>

        {/* OUTPUT COUNTER-OFFER INTERFACE PANEL */}
        {results && (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Statement Underwriting Assessment</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 font-bold uppercase">Extracted Income Reality</p>
                <p className="text-2xl font-black text-slate-800 mt-1">KSh {results.extractedIncome.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Calculated programmatically off statement headers.</p>
              </div>
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 font-bold uppercase">Statutory 1/3 Monthly EMI Ceiling</p>
                <p className="text-2xl font-black text-blue-600 mt-1">KSh {results.maxAllowedEMI.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Maximum legally allowed asset installment.</p>
              </div>
            </div>

            {results.decision === "Auto-Approved" ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <h3 className="font-bold text-lg">✓ Capital Request Approved!</h3>
                <p className="text-sm mt-1">Your extracted cash ledger completely satisfies the risk criteria for your full requested financing limit of <span className="font-bold">KSh {results.requestedAmount.toLocaleString()}</span>.</p>
              </div>
            ) : (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <h3 className="font-bold text-lg text-amber-950">⚠ System Counter-Offer Triggered</h3>
                <p className="text-sm mt-2">
                  You requested <span className="line-through font-medium text-slate-500">KSh {results.requestedAmount.toLocaleString()}</span>. However, to stay fully compliant with Kenya's mandatory 1/3 salary retention law, your maximum legal capital capacity ceiling tops out at:
                </p>
                <div className="my-4 p-4 bg-white rounded-lg border border-amber-300 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Your Max Qualified Loan Value</span>
                  <span className="text-3xl font-black text-amber-700 mt-1 block">KSh {results.qualifiedAmount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-amber-800 mb-4">You can proceed with funding at this pre-approved capacity immediately, or route to manual exemption pools.</p>
                {!exemptionSubmitted ? (
                  <button onClick={async () => { await fetch("/api/match", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }); setExemptionSubmitted(true); }} className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-700 shadow-sm transition-colors">
                    Request Exemption Review for Original Amount
                  </button>
                ) : (
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-2 rounded-full">✓ Sent to Alternative Private Placement Funds</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}