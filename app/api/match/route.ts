import { NextResponse } from "next/server";

// Hardcoded memory store to hold data just for your pitch demonstration
const globalForDemo = global as unknown as { demoLeads: any[] };
globalForDemo.demoLeads = globalForDemo.demoLeads || [];

// Your Lender Rules
const LENDERS = [
  { name: "Lender A (Sacco/Bank)", minIncome: 50000, maxLoan: 1000000, preferred: "Salaried", baseProb: 92 },
  { name: "Lender B (SME Microfinance)", minIncome: 100000, maxLoan: 5000000, preferred: "Business Owner", baseProb: 85 },
  { name: "Lender C (Digital Retail)", minIncome: 20000, maxLoan: 150000, preferred: "Salaried", baseProb: 78 }
];

export async function POST(request: Request) {
  const borrower = await request.json();
  const matchedLenders = [];

  // Core qualification logic (The Engine)
  for (const lender of LENDERS) {
    if (borrower.income >= lender.minIncome && borrower.loanAmount <= lender.maxLoan) {
      let dynamicProbability = lender.baseProb;
      
      // Reduce probability if they are not the lender's ideal customer type
      if (borrower.employment !== lender.preferred) {
        dynamicProbability -= 20; 
      }
      matchedLenders.push({ name: lender.name, probability: Math.max(dynamicProbability, 10) });
    }
  }

  // Save an ANONYMOUS record to the dashboard memory store
  globalForDemo.demoLeads.push({
    id: `B-${Math.floor(1000 + Math.random() * 9000)}`,
    income: borrower.income,
    loanAmount: borrower.loanAmount,
    purpose: borrower.purpose,
    employment: borrower.employment,
    timestamp: new Date().toLocaleTimeString()
  });

  return NextResponse.json({ matches: matchedLenders });
}

export async function GET() {
  return NextResponse.json({ leads: globalForDemo.demoLeads });
}