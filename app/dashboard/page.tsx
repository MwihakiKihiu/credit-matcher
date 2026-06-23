"use client";
import { useState, useEffect } from "react";

export default function LenderDashboard() {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/match")
      .then(res => res.json())
      .then(data => setLeads(data.leads || []));
  }, []);

  return (
    <div className="max-w-5xl mx-auto my-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Lender Portal</h1>
          <p className="text-sm text-gray-500">Pre-qualified, anonymized incoming credit leads.</p>
        </div>
        <button onClick={() => window.location.reload()} className="bg-gray-200 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300">Refresh Feed</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-gray-600 text-sm font-semibold">
              <th className="p-4">Lead ID (Anonymous)</th>
              <th className="p-4">Employment</th>
              <th className="p-4">Monthly Income</th>
              <th className="p-4">Loan Requested</th>
              <th className="p-4">Purpose</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-700">
            {leads.map((lead, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-blue-600 font-bold">{lead.id}</td>
                <td className="p-4">{lead.employment}</td>
                <td className="p-4">KES {lead.income?.toLocaleString()}</td>
                <td className="p-4">KES {lead.loanAmount?.toLocaleString()}</td>
                <td className="p-4 text-sm max-w-xs truncate">{lead.purpose}</td>
                <td className="p-4">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-700">Unlock Contact</button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">No applications received yet. Submit an application from the home page first.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}