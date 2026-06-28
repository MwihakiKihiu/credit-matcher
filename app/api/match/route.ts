import { NextResponse } from 'next/server';
import { supabase } from '../../supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, grossSalary, purpose, employment, moneyIn, moneyOut, fakeUploadedIdName, fakeUploadedStatementName } = body;

    // REAL-WORLD COUNTER-FRAUD BLOCK:
    // We compare the text extracted directly from the ID card vs the M-Pesa Statement header.
    const idCardNameClean = fakeUploadedIdName.trim().toLowerCase();
    const statementNameClean = fakeUploadedStatementName.trim().toLowerCase();

    if (idCardNameClean !== statementNameClean) {
      // Log the identity mismatch directly to the database as a Fraud Flag
      await supabase.from('applications').insert([{
        name: `MISMATCH: ID(${fakeUploadedIdName}) vs Doc(${fakeUploadedStatementName})`,
        income: grossSalary,
        loan_amount: 3500000,
        purpose,
        employment,
        system_decision: "Fraud Flagged",
        status: "Rejected",
        gross_salary: grossSalary,
        total_money_in: 0,
        total_money_out: 0,
        calculated_max_emi: 0
      }]);

      return NextResponse.json({ 
        error: `Security Violation: Document Owner Mismatch. The name on the uploaded National ID ("${fakeUploadedIdName}") does not match the account holder name found on the M-Pesa Statement ("${fakeUploadedStatementName}"). This application has been rejected.` 
      }, { status: 400 });
    }

    // If documents match perfectly, run the 1/3 statutory math rule
    const staticRetention = grossSalary / 3;
    const currentFreeCash = moneyIn - moneyOut;
    const maxAllowedEMI = Math.max(0, currentFreeCash - staticRetention);
    const systemDecision = maxAllowedEMI >= 25000 ? "Auto-Approved" : "Flagged for Review";

    const { error } = await supabase
      .from('applications')
      .insert([
        { 
          name, 
          income: grossSalary, 
          loan_amount: 3500000,
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