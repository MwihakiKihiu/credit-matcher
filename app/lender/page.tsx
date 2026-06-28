"use client";
import { useState } from "react";
import Link from "next/link";

export default function UnderwritingPortal() {
  const [name, setName] = useState("");
  const [grossSalary, setGrossSalary] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);
  const [employment, setEmployment] = useState("Salaried");
  const [purpose, setPurpose] = useState("Vehicle Financing");
  
  // File attachments states
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
      alert("Missing base dossier: Please upload both your National ID and M-Pesa Statement.");
      return;
    }
    if (employment === "Salaried" && !payslipFile) {
      alert("Employment Verification Missing: Salaried applicants must attach their latest Pay Slip.");
      return;
    }
    if (employment === "Business Owner" && !registrationFile) {
      alert("Business Verification Missing: MSME applicants must attach their Business Registration Certificate.");
      return;
    }

    setLoading(true);
    setResults(null);
    setExemptionSubmitted(false);

    const formDataBody = new FormData();
    formDataBody.append("name", name);
    formDataBody.append("grossSalary", grossSalary.toString());
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
        alert(data.error || "Verification pipeline failed.");
        setLoading(false);
        return;
      }

      setResults(data);
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
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Cross-Document Auditing Engine</h1>
        <p className="text-gray-600 mb-6">Complete your profile details. The upload requirements will change dynamically below based on your employment selection.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main profile section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Applicant Legal Name</label>
              <input type="text" required placeholder="e.g. Jane Omwamba" className="w-full p-2.5 border rounded-lg" onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Gross Monthly Income (KES)</label>
              <input type="number" required placeholder="e.g. 150000" className="w-full p-2.5 border rounded-lg" onChange={(e) => setGrossSalary(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Target Asset/Purpose</label>
              <input type="text" required placeholder="e.g. Isuzu NQR 33-Seater" className="w-full p-2.5 border rounded-lg" onChange={(e) => setPurpose(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Requested Loan Amount (KES)</label>
              <input type="number" required placeholder="e.g. 3500000" className="w-full p-2.5 border rounded-lg" onChange={(e) => setLoanAmount(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Employment Context / Source of Income</label>
            <select className="w-full p-2.5 border rounded-lg bg-white" value={employment} onChange={(e) => {
              setEmployment(e.target.value);
              setPayslipFile(null);
              setRegistrationFile(null);
            }}>
              <option value="Salaried">Salaried Employee</option>
              <option value="Business Owner">Business Owner / MSME</option>
            </select>
          </div>

          {/* DYNAMIC ATTACMENT SECTION */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide">Required Document Attachments</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <label className="block text-xs font-bold text-gray-500 mb-2">1. Upload National ID Card</label>
                <input type="file" required accept="image/*,application/pdf" className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
                {idFile && <p className="mt-1.5 text-xs text-emerald-600 font-medium">✓ ID Loaded</p>}
              </div>

              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <label className="block text-xs font-bold text-gray-500 mb-2">2. Upload M-Pesa PDF Statement</label>
                <input type="file" required accept="application/pdf" className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  onChange={(e) => setStatementFile(e.target.files?.[0] || null)} />
                {statementFile && <p className="mt-1.5 text-xs text-emerald-600 font-medium">✓ Statement Loaded</p>}
              </div>
            </div>

            {/* CONDITIONAL CONDITIONAL FIELD BASED ON EMPLOYMENT DROPDOWN */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
              {employment === "Salaried" ? (
                <div>
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">3. Required: Upload Latest Official Pay Slip</label>
                  <input type="file" required accept="application/pdf,image/*" className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" 
                    onChange={(e) => setPayslipFile(e.target.files?.[0] || null)} />
                  {payslipFile && <p className="mt-1.5 text-xs text-blue-700 font-semibold">✓ Pay Slip Registered: {payslipFile.name}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">3. Required: Business Registration Certificate (BRS/CR12)</label>
                  <input type="file" required accept="application/pdf,image/*" className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" 
                    onChange={(e) => setRegistrationFile(e.target.files?.[0] || null)} />
                  {registrationFile && <p className="mt-1.5 text-xs text-indigo-700 font-semibold">✓ BRS Document Registered: {registrationFile.name}</p>}
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-400">
            {loading ? "Analyzing Dynamic Asset Dossier..." : "Upload & Analyze Assets"}
          </button>
        </form>

        {/* RESULTS INTERFACE PANEL */}
        {results && (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Dynamic Risk Audit Complete</h2>
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Verified Base Revenue</p>
                <p className="text-lg font-bold text-slate-800">KSh {results.metrics.moneyIn.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Max Debt Ceiling</p>
                <p className="text-lg font-bold text-blue-600">KSh {results.metrics.maxAllowedEMI.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Dossier Integrity</p>
                <p className="text-lg font-bold text-emerald-600">CERTIFIED</p>
              </div>
            </div>

            {results.matches.length > 0 ? (
              <div className="space-y-2">
                <div className="p-3 bg-green-50 text-green-800 text-sm font-semibold rounded-lg border border-green-200">
                  ✓ Passed Kenyan Financial Parameters. Active Matches Live:
                </div>
                {results.matches.map((lender: any, index: number) => (
                  <div key={index} className="p-4 bg-white rounded-lg border flex justify-between items-center shadow-sm">
                    <span className="font-bold text-slate-700">{lender.name}</span>
                    <span className="text-blue-600 font-bold text-sm">Verified Asset Funding Option</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 mb-3">Traditional banking lines restricted based on structural calculations.</p>
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