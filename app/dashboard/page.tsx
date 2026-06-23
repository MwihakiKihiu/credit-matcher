"use client";
import { useState } from "react";

export default function BorrowerForm() {
  // We added <any> right here to tell TypeScript to relax the rules
  const [formData, setFormData] = useState<any>({
    name: "",
    income: "",
    loanAmount: "",
    purpose: "",
    employment: "Salaried",
  });
  const [results, setResults] = useState(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const response = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    setResults(data);
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-8 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold mb-2 text-blue-600">CreditMatch Platform</h1>
      <p className="text-gray-600 mb-6">Apply once. Get matched only with lenders likely to approve you.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input type="text" required className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Monthly Income (KES)</label>
            <input type="number" required className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, income: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-medium">Desired Loan Amount (KES)</label>
            <input type="number" required className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, loanAmount: Number(e.target.value)})} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Employment Status</label>
          <select className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, employment: e.target.value})}>
            <option value="Salaried">Salaried Employee</option>
            <option value="Business Owner">Business Owner / SME</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Loan Purpose</label>
          <input type="text" required className="w-full p-2 border rounded" placeholder="e.g. Business Expansion" onChange={(e) => setFormData({...formData, purpose: e.target.value})} />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700">Evaluate My Application</button>
      </form>

      {results && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold mb-4 text-blue-900">Your Matching Results</h2>
          <p className="mb-4 text-sm text-gray-600">Our engine filtered your profile against active lender rules.</p>
          <div className="space-y-3">
            {(results as any).matches.map((lender: any, index: number) => (
              <div key={index} className="p-4 bg-white rounded border flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-800">{lender.name}</span>
                  <span className="ml-3 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Qualified</span>
                </div>
                <span className="text-blue-600 font-semibold">Probability: {lender.probability}%</span>
              </div>
            ))}
            {(results as any).matches.length === 0 && <p className="text-red-500">No lenders match your criteria at this time.</p>}
          </div>
        </div>
      )}
    </div>
  );
}