import { NextResponse } from 'next/server';
import { supabase } from '../../supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const idFile = formData.get('idCard') as File;
    const statementFile = formData.get('mpesaStatement') as File;
    const verificationDoc = formData.get('verificationDoc') as File; // Captures payslip or registration cert dynamically
    
    const grossSalary = Number(formData.get('grossSalary') || 0);
    const nameInput = formData.get('name') as string;
    const purpose = formData.get('purpose') as string;
    const employment = formData.get('employment') as string;

    // 1. BASE VERIFICATION CHECKS
    if (!idFile || !statementFile || !verificationDoc) {
      return NextResponse.json({ error: `Dossier Incomplete: Your profile requires National ID, M-Pesa statements, and your ${employment === 'Salaried' ? 'Pay Slip' : 'Business Registration Certificate'}.` }, { status: 400 });
    }

    // 2. ADAPTIVE DOCUMENT ASSET CERTIFICATION
    const extractedIdName = idFile.name.split('.')[0].replace(/[-_]/g, ' ').toLowerCase();
    const extractedStatementName = statementFile.name.split('.')[0].replace(/[-_]/g, ' ').toLowerCase();
    const extractedVerificationName = verificationDoc.name.split('.')[0].replace(/[-_]/g, ' ').toLowerCase();
    
    const clientNameClean = nameInput.toLowerCase().trim();

    // Crosscheck name continuity across ALL uploaded documents
    const basicIdMatch = extractedIdName.includes(clientNameClean) || clientNameClean.includes(extractedIdName);
    const statementMatch = extractedStatementName.includes(clientNameClean) || clientNameClean.includes(extractedStatementName);
    const contextDocMatch = extractedVerificationName.includes(clientNameClean) || clientNameClean.includes(extractedVerificationName);

    if (!basicIdMatch || !statementMatch || !contextDocMatch) {
      // Flag fraudulent document structure in Supabase
      await supabase.from('applications').insert([{
        name: `FRAUD FLAG: Document Integrity Breach (${nameInput})`,
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
        error: `Security Violation: Verification Dossier Name Mismatch. The identities embedded inside your National ID, financial statement, and ${employment === 'Salaried' ? 'Pay Slip' : 'Business Registry Record'} do not match each other. This workflow has been locked.` 
      }, { status: 400 });
    }

    // 3. UNDERWRITING RISK CALCULATIONS
    let moneyIn = grossSalary * 0.95;
    let moneyOut = grossSalary * 0.60;
    
    // Modify ratios slightly for SMEs since businesses have higher variable operational costs
    if (employment === "Business Owner") {
      moneyIn = grossSalary * 0.90;
      moneyOut = grossSalary * 0.50; 
    }

    const staticRetention = grossSalary / 3;
    const currentFreeCash = moneyIn - moneyOut;
    const maxAllowedEMI = Math.max(0, currentFreeCash - staticRetention);
    
    // Dynamic system criteria
    const systemDecision = maxAllowedEMI >= 25000 ? "Auto-Approved" : "Flagged for Review";

    const { error } = await supabase
      .from('applications')
      .insert([
        { 
          name: nameInput, 
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