"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function AppRouter() {
  const [currentView, setCurrentView] = useState("borrower"); // 'borrower' or 'lender'
  
  // Borrower States
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

  // Lender Dashboard States
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [lenderLoading, setLenderLoading] = useState(true);

  // Listen to live database changes for the lender view
  useEffect(() => {
    async function fetchDeals() {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setDeals(data || []);
      setLenderLoading(false);
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
  }, [currentView]);

  const handleBorrowerSubmit = async (e: any) => {
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
    
    if (employment === "Salaried" && payslipFile) formDataBody.append("verificationDoc", payslipFile);
    if (employment === "Business Owner" && registrationFile) formDataBody.append("verificationDoc", registrationFile);

    try {
      const response = await fetch("/api/match", { method: "POST", body: formDataBody });
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

  // --- RENDERING VIEWS ---
  if (currentView === "lender") {
    return (
      <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen text-slate-800">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Asset Finance Lender Portal</h1>
          <button onClick={() => setCurrentView("borrower")} className="bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-300">
            &larr; Exit to Borrower Form
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Active Deals in Pipe</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{lenderLoading ? "..." : deals.length}</p>
          </div>
          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl">
            <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wider">Platform Avg Yield</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">14.2%</p>
          </div>
          <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-xl">
            <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wider">Avg Target LTV</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">62%</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-4">Live Pre-Vetted Applications</h2>
        
        {lenderLoading ? (
          <div className="text-center py-12 text-slate-500">Loading marketplace...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-600">Borrower</th>
                  <th className="p-4 font-semibold text-slate-600">Employment</th>
                  <th className="p-4 font-semibold text-slate-600">Requested Amount</th>
                  <th className="p-4 font-semibold text-slate-600">Calculated Max Installment</th>
                  <th className="p-4 font-semibold text-slate-600">Underwriting Status</th>
                  <th className="p-4 font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{deal.name}</td>
                    <td className="p-4 text-slate-600">{deal.employment || "N/A"}</td>
                    <td className="p-4 text-slate-600">KSh {Number(deal.loan_amount || 0).toLocaleString()}</td>
                    <td className="p-4 font-medium text-slate-800">KSh {Number(deal.calculated_max_emi || 0).toLocaleString()}/mo</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        deal.system_decision === 'Auto-Approved' ? 'bg-green-100 text-green-800' :
                        deal.system_decision === 'Fraud Flagged' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {deal.system_decision || "Pending"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => setSelectedDeal(deal)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800">
                        Review Asset
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DETAILS MODAL */}
        {selectedDeal && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
              <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-800">Risk Assessment: {selectedDeal.name}</h3>
                <button onClick={() => setSelectedDeal(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Statement Analysis</h4>
                    <p className="text-slate-600 text-sm">Extracted Monthly Income: <span className="font-bold text-slate-800">KSh {Number(selectedDeal.income || 0).toLocaleString()}</span></p>
                    <p className="text-slate-600 text-sm mt-1">Stated Loan Request: <span className="font-bold text-blue-600">KSh {Number(selectedDeal.loan_amount || 0).toLocaleString()}</span></p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Statutory Parameters</h4>
                    <p className="text-slate-600 text-sm">Kenyan 1/3 Limit Ceiling: <span className="font-bold text-blue-600">KSh {Number(selectedDeal.calculated_max_emi || 0).toLocaleString()} /mo</span></p>
                    <p className="text-slate-600 text-sm mt-1">Underwriting Class: <span className="font-semibold text-amber-700">{selectedDeal.system_decision}</span></p>
                  </div>
                </div>
                <div className="flex space-x-4 pt-4 border-t">
                  <button onClick={() => { alert("Asset Funded!"); setSelectedDeal(null); }} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700">Approve & Fund Asset</button>
                  <button onClick={() => setSelectedDeal(null)} className="flex-1 bg-white border text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT VIEW: BORROWER APPLICATION FORM
  return (
    <div className="bg-slate-50 min-h-screen pb-12 text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-black text-blue-700 tracking-tight">
          CREDIT<span className="text-slate-800">MATCH</span>
        </div>
        <button onClick={() => setCurrentView("lender")} className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
          Lender Portal Login &rarr;
        </button>
      </header>

      <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Cross-Document Auditing Engine</h1>
        <p className="text-gray-600 mb-6">State your financing request. Our engine calculates your exact credit capacity securely off your uploaded statement parameters.</p>
        
        <form onSubmit={handleBorrowerSubmit} className="space-y-6">
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

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide">Required Underwriting Attachments</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <label className="block text-xs font-bold text-gray-500 mb-2">1. Upload National ID Card</label>
                <input type="file" required accept="image/*,application/pdf" className="w-full text-sm" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
              </div>
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <label className="block text-xs font-bold text-gray-500 mb-2">2. Upload 6-Month M-Pesa Statement</label>
                <input type="file" required accept="application/pdf" className="w-full text-sm" onChange={(e) => setStatementFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              {employment === "Salaried" ? (
                <div>
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">3. Required: Upload Latest Official Pay Slip</label>
                  <input type="file" required accept="application/pdf,image/*" className="w-full text-sm" onChange={(e) => setPayslipFile(e.target.files?.[0] || null)} />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">3. Required: Business Registration Certificate</label>
                  <input type="file" required accept="application/pdf,image/*" className="w-full text-sm" onChange={(e) => setRegistrationFile(e.target.files?.[0] || null)} />
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-400">
            {loading ? "Reading Statement Ledger Records..." : "Process Affordability Verification"}
          </button>
        </form>

        {/* AFFORDABILITY PANEL */}
        {results && (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Statement Underwriting Assessment</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 font-bold uppercase">Extracted Income Reality</p>
                <p className="text-2xl font-black text-slate-800 mt-1">KSh {results.extractedIncome.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 font-bold uppercase">Statutory 1/3 Monthly EMI Ceiling</p>
                <p className="text-2xl font-black text-blue-600 mt-1">KSh {results.maxAllowedEMI.toLocaleString()}</p>
              </div>
            </div>

            {results.decision === "Auto-Approved" ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <h3 className="font-bold text-lg">✓ Capital Request Approved!</h3>
                <p className="text-sm mt-1">Your extracted cash ledger satisfies the risk criteria for your full financing limit of <span className="font-bold">KSh {results.requestedAmount.toLocaleString()}</span>.</p>
              </div>
            ) : (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <h3 className="font-bold text-lg text-amber-950">⚠ System Counter-Offer Triggered</h3>
                <p className="text-sm mt-2">You requested KSh {results.requestedAmount.toLocaleString()}. To remain compliant with Kenya's 1/3 salary law, your maximum legal capital capacity is:</p>
                <div className="my-4 p-4 bg-white rounded-lg border border-amber-300 text-center">
                  <span className="text-3xl font-black text-amber-700 block">KSh {results.qualifiedAmount.toLocaleString()}</span>
                </div>
                {!exemptionSubmitted ? (
                  <button onClick={async () => { await fetch("/api/match", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }); setExemptionSubmitted(true); }} className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-700">
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