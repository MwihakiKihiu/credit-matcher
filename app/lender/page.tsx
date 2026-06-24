'use client';
import { useState } from 'react';

export default function LenderDashboard() {
  const [selectedDeal, setSelectedDeal] = useState<any>(null);

  const matchedBorrowers = [
    { 
      id: 1, 
      borrower: "David M.", 
      vehicle: "2018 Toyota Land Cruiser Prado", 
      assetValue: 5500000, 
      loanAmount: 3000000, 
      ltv: "54%", 
      matchScore: "98% (A+)",
      kraStatus: "Verified - Clean",
      engineNo: "1GD-1234567",
      mileage: "65,000 km"
    },
    { 
      id: 2, 
      borrower: "Sarah K.", 
      vehicle: "2020 Mazda CX-5", 
      assetValue: 2800000, 
      loanAmount: 1900000, 
      ltv: "67%", 
      matchScore: "92% (A)",
      kraStatus: "Verified - Clean",
      engineNo: "SH-9876543",
      mileage: "42,000 km"
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Asset Finance Lender Portal</h1>

      {/* Metrics Section */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
          <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Active Auto Loans</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">KSh 142,500,000</p>
        </div>
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm">
          <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wider">Platform Avg Yield</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">14.2%</p>
        </div>
        <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm">
          <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wider">Avg Loan-to-Value (LTV)</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">62%</p>
        </div>
      </div>

      {/* Pipeline Section */}
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-slate-800">Pre-Vetted Vehicle Matches</h2>
        <span className="text-sm text-emerald-600 font-medium bg-emerald-100 px-3 py-1 rounded-full animate-pulse">Live Feed Active</span>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Borrower</th>
              <th className="p-4 font-semibold text-slate-600">Collateral (Vehicle)</th>
              <th className="p-4 font-semibold text-slate-600">Asset Value</th>
              <th className="p-4 font-semibold text-slate-600">Requested Loan</th>
              <th className="p-4 font-semibold text-slate-600">LTV</th>
              <th className="p-4 font-semibold text-slate-600">Match Grade</th>
              <th className="p-4 font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matchedBorrowers.map((deal) => (
              <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-800">{deal.borrower}</td>
                <td className="p-4 text-slate-600">{deal.vehicle}</td>
                <td className="p-4 text-slate-600">KSh {deal.assetValue.toLocaleString()}</td>
                <td className="p-4 font-medium text-slate-800">KSh {deal.loanAmount.toLocaleString()}</td>
                <td className="p-4"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm font-medium">{deal.ltv}</span></td>
                <td className="p-4 text-emerald-600 font-bold">{deal.matchScore}</td>
                <td className="p-4">
                  <button 
                    onClick={() => setSelectedDeal(deal)}
                    className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
                    Review Asset
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- THE POPUP MODAL --- */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-800">Deal Room: {selectedDeal.borrower}</h3>
              <button onClick={() => setSelectedDeal(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Asset Details</h4>
                  <p className="font-medium text-slate-800">{selectedDeal.vehicle}</p>
                  <p className="text-slate-600 text-sm mt-1">Mileage: {selectedDeal.mileage}</p>
                  <p className="text-slate-600 text-sm">Engine: {selectedDeal.engineNo}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Financials</h4>
                  <p className="text-slate-600 text-sm">Asset Value: <span className="font-medium text-slate-800">KSh {selectedDeal.assetValue.toLocaleString()}</span></p>
                  <p className="text-slate-600 text-sm mt-1">Requested: <span className="font-medium text-slate-800">KSh {selectedDeal.loanAmount.toLocaleString()}</span></p>
                  <p className="text-slate-600 text-sm mt-1">LTV: <span className="font-medium text-slate-800">{selectedDeal.ltv}</span></p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900">KRA Logbook Verification</h4>
                  <p className="text-sm text-blue-700 mt-1">Status: {selectedDeal.kraStatus}</p>
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