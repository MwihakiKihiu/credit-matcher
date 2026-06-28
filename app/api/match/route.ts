import { NextResponse } from 'next/server';
import { supabase } from '../../supabase';

// Helper function to check if names look similar (Fuzzy matching simulation)
function namesMatch(inputName: string, documentName: string): boolean {
  const cleanInput = inputName.toLowerCase().replace(/[^a-z]/g, "");
  const cleanDoc = documentName.toLowerCase().replace(/[^a-z]/g, "");
  
  // Checks if the main names are present in both inputs
  const inputWords = inputName.toLowerCase().split(/\s+/);
  return inputWords.every(word => cleanDoc.includes(word)) || cleanDoc.includes(cleanInput);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, grossSalary, purpose, employment, moneyIn, moneyOut } = body;

    // FRAUD CONTROL: We simulate reading the uploaded document name.
    // In this test environment, if you type "FRAUD" in the name, it simulates a mismatched statement name.
    const extractedStatementName = name.toUpperCase().includes("FRAUD") 
      ? "John Kamau Omwamba" // Mismatched name found on PDF header
      : name;               // Perfect clean match

    if (!namesMatch(name, extractedStatementName)) {
      // 1. Log the identity theft attempt to the database as Fraud Flagged
      await supabase.from('applications').insert([{
        name,
        income: grossSalary,
        loan_amount: 3500000,
        purpose,
        employment,
        system_decision: "Fraud Flagged",
        status: "Rejected"
      }]);

      return NextResponse.json({ 
        error: `Identity Validation Failed: The name on the uploaded statement ("${extractedStatementName}") does not match the provided ID registration name ("${name}"). This profile has been restricted.` 
      }, { status: 400 });
    }

    // The One-Third Statutory Calculation Rule
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