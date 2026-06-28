import { NextResponse } from 'next/server';
import { supabase } from '../../supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, grossSalary, purpose, employment, moneyIn, moneyOut } = body;

    // The One-Third Statutory Calculation Rule
    // Formula: Allowable repayment ceiling = Total Money In - (Gross Salary * 1/3)
    const staticRetention = grossSalary / 3;
    const currentFreeCash = moneyIn - moneyOut;
    const maxAllowedEMI = Math.max(0, currentFreeCash - staticRetention);

    // Matching condition: Only approve if they can support an asset payment > 25,000 KES monthly
    const systemDecision = maxAllowedEMI >= 25000 ? "Auto-Approved" : "Flagged for Review";

    // Write to Supabase with the advanced calculated schema
    const { error } = await supabase
      .from('applications')
      .insert([
        { 
          name, 
          income: grossSalary, 
          loan_amount: 3500000, // Normalized test value for car loan
          purpose, 
          employment,
          gross_salary: grossSalary,
          total_money_in: moneyIn,
          total_money_out: moneyOut,
          calculated_max_emi: maxAllowedEMI,
          system_decision: systemDecision,
          status: systemDecision === "Auto-Approved" ? "Approved" : "Pending"
        }
      ]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Determine matching banks based on automated calculation threshold
    let matches: any[] = [];
    if (systemDecision === "Auto-Approved") {
      matches = [
        { name: "Equity Bank Asset Finance" },
        { name: "NCBA Bank Pre-Approved Auto" }
      ];
    }

    return NextResponse.json({ 
      success: true, 
      metrics: { moneyIn, moneyOut, maxAllowedEMI },
      matches 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Handler for when a user requests manual exemption matching
export async function PUT(request: Request) {
  try {
    const { name } = await request.json();

    const { error } = await supabase
      .from('applications')
      .update({ exemption_requested: true, status: 'Exemption Review' })
      .eq('name', name);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}