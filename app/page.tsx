"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function UnifiedMarketplaceRouter() {
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
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Lender Dashboard States
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [lenderLoading, setLenderLoading] = useState(true);

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
  }, [currentView]);

  const handleBorrowerSubmit = async (e: any) => {
    e.preventDefault();
    if (!idFile || !statementFile) {
      alert("Please upload both your National ID and M-Pesa Statement.");
      return;
    }
    setLoading(true);
    setResults(null);
    setSelectedOfferIndex(null);

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
      
      // Dynamic Generation of competing blind lender offers based on qualification ceiling
      const ceiling = data.metrics.qualifiedAmount;
      const offers = [
        { id: "L_A", blindName: "Tier-1 Bank Funder (Option A)", rate: 1.1, duration: 48, totalRepay: ceiling * 1.35 },
        { id: "L_B", blindName: "Fintech Credit Fund (Option B)", rate: 1.4, duration: 36, totalRepay: ceiling * 1.42 },
        { id: "L_C", blindName: "Micro-Asset Lender (Option C)", rate: 1.6, duration: 24, totalRepay: ceiling * 1.28 },
      ];

      setResults({ ...data.metrics, offers });
    } catch (err: any) {
      alert(`Upload Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptLenderOffer = async (index: number, offer: any) => {
    setProcessingPayment(true);
    
    // Simulate real-time merchant credit card acquisition charge to the lender
    setTimeout(async () => {
      try {
        await supabase
          .from('applications')
          .update({ 
            system_decision: `Accepted: ${offer.blindName}`,
            status: 'Lead Unlocked' 
          })
          .eq('name', name);

        setSelectedOfferIndex(index);
        alert(`🎉 Match Confirmed! The platform has processed the lead acquisition card billing for ${offer.blindName}. Your dedicated booking voucher has been generated. Please proceed to book your offline office evaluation visit.`);
      } catch (err) {
        console.error(err);
      } finally {
        setProcessingPayment(false);
      }
    }, 2000);
  };

  // --- RENDERING VIEW: LENDER VIEW ---
  if (currentView === "lender") {
    return (
      <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen text-slate-800">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Institutional Lender Marketplace</h1>
            <p className="text-sm text-slate-500 mt-1">Browse pre-vetted transaction feeds. Contact authority unlocks automatically when chosen by borrower.</p>
          </div>
          <button onClick={() => setCurrentView("borrower")} className="bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-300">
            &larr; Exit to Borrower Form
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase">Total Pre-Vetted Leads Available</p>
            <p className="text-4xl font-black text-blue-600 mt-1">{deals.length}</p>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase">Platform Lead Generation Value</p>
            <p className="text-4xl font-black text-emerald-600 mt-1">KES {(deals.length * 4500).toLocaleString()}</p>
          </div>
        </div>

        {lenderLoading ? (
          <div className="text-center py-12 text-slate-400">Loading live marketplace feed...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-600">Lead Status ID</th>
                  <th className="p-4 font-semibold text-slate-600">Asset Context</th>
                  <th className="p-4 font-semibold text-slate-600">Qualified Valuation</th>
                  <th className="p-4 font-semibold text-slate-600">Calculated Cash Ceiling</th>
                  <th className="p-4 font-semibold text-slate-600">Marketplace Authority Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deals.map((deal) => {
                  const isUnlocked = deal.status === 'Lead Unlocked' || deal.system_decision?.includes('Accepted');
                  return (
                    <tr key={deal.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">
                        {isUnlocked ? deal.name : `🔒 Pre-Vetted Lead #${deal.id.toString().slice(0, 4)}`}
                      </td>
                      <td className="p-4 text-slate-600">{deal.purpose || "Vehicle Loan"}</td>
                      <td className="p-4 text-slate-600 font-semibold">KSh {Number(deal.loan_amount || 0).toLocaleString()}</td>
                      <td className="p-4 text-slate-600">KSh {Number(deal.calculated_max_emi || 0).toLocaleString()}/mo</td>
                      <td className="p-4">
                        {isUnlocked ? (
                          <button onClick={() => setSelectedDeal(deal)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700">
                            ✓ Unlocked - View Phone & Book Visit
                          </button>
                        ) : (
                          <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full border">
                            Waiting for Borrower Acceptance Selection
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL VIEW */}
        {selectedDeal && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden">
              <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Contact Details Unlocked</h3>
                <button onClick={() => setSelectedDeal(null)} className="text-slate-400 text-2xl font-bold">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Borrower Selection</p>
                  <p className="text-sm text-emerald-900 mt-1">This user successfully reviewed your terms and chose your package pipeline. Your billing card has been debited for the generation fee.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Borrower Name:</strong> {selectedDeal.name}</p>
                  <p className="text-sm"><strong>Target Vehicle:</strong> {selectedDeal.purpose}</p>
                  <p className="text-sm"><strong>Stated Phone Contact:</strong> +254 712 345678</p>
                  <p className="text-sm"><strong>Assigned Verification Route:</strong> {selectedDeal.employment}</p>
                </div>
                <button onClick={() => { alert("SMS Notification sent to client confirming office appointment."); setSelectedDeal(null); }} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm">
                  Confirm In-Office Booking Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT VIEW: BORROWER WORKFLOW
  return (
    <div className="bg-slate-50 min-h-screen pb-12 text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-black text-blue-700 tracking-tight">
          CREDIT<span className="text-slate-800">MATCH</span>
        </div>
        <button onClick={() => setCurrentView("lender")} className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
          Lender Portal &rarr;
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

        {/* OFFERS MARKETPLACE PANEL */}
        {results && (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="border-b pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">Statement Underwriting Assessment Complete</h2>
              <p className="text-xs text-slate-500 mt-1">Maximum statutory monthly EMI ceiling calculated: <span className="font-bold text-blue-600">KSh {results.maxAllowedEMI.toLocaleString()}/mo</span></p>
            </div>

            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide mb-4">Institutional Offers Generated Below</h3>
            
            <div className="space-y-4">
              {results.offers.map((offer: any, idx: number) => {
                const isChosen = selectedOfferIndex === idx;
                const anyChosen = selectedOfferIndex !== null;
                
                return (
                  <div key={idx} className={`p-5 rounded-xl border bg-white shadow-sm transition-all ${isChosen ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">Option #{idx + 1}</span>
                        <div className="grid grid-cols-3 gap-6 mt-3 text-sm">
                          <div>
                            <span className="text-xs text-slate-400 block font-medium">Monthly Cost Rate</span>
                            <span className="text-base font-bold text-slate-800 mt-0.5 block">{offer.rate}% per month</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block font-medium">Amortization Term</span>
                            <span className="text-base font-bold text-slate-800 mt-0.5 block">{offer.duration} Months</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block font-medium">Total Lifetime Repayable</span>
                            <span className="text-base font-bold text-slate-800 mt-0.5 block">KSh {Math.floor(offer.totalRepay).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {isChosen ? (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-lg block text-center">
                            ✓ Selection Confirmed
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleAcceptLenderOffer(idx, offer)}
                            disabled={anyChosen || processingPayment}
                            className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors">
                            {processingPayment ? "Charging Card..." : "Accept & Proceed"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}