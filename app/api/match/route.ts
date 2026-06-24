import { NextResponse } from 'next/server';
import { supabase } from '../../supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, income, loanAmount, purpose, employment } = body;

    // Save directly to Supabase
    const { error } = await supabase
      .from('applications')
      .insert([
        { 
          name, 
          income, 
          loan_amount: loanAmount, 
          purpose, 
          employment,
          vehicle: '2020 Mazda CX-5'
        }
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Matching Algorithm
    const lenders = [
      { name: "Equity Bank Auto", minIncome: 50000, maxLoan: 5000000, baseProb: 85 },
      { name: "NCBA Asset Finance", minIncome: 100000, maxLoan: 10000000, baseProb: 90 },
      { name: "I&M Car Loans", minIncome: 70000, maxLoan: 4000000, baseProb: 75 }
    ];

    const matches = lenders
      .filter(l => income >= l.minIncome && loanAmount <= l.maxLoan)
      .map(l => ({
        name: l.name,
        probability: Math.min(l.baseProb + Math.floor(Math.random() * 10), 99)
      }));

    return NextResponse.json({ success: true, matches });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}