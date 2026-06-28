import { NextResponse } from 'next/server';
import { supabase } from '../../supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const idFile = formData.get('idCard') as File;
    const statementFile = formData.get('mpesaStatement') as File;
    const verificationDoc = formData.get('verificationDoc') as File; 
    
    const loanAmountRequested = Number(formData.get('loanAmount') || 0);
    const nameInput = formData.get('name') as string;
    const purpose = formData.get('purpose') as string;
    const employment = formData.get('employment') as string;

    if (!idFile || !statementFile || !verificationDoc) {
      return NextResponse.json({ error: `Dossier Incomplete: All documentation handles must be attached.` }, { status: 400 });
    }

    // 1. IDENTITY & METADATA FLOW MATCH
    const extractedIdName = idFile.name.split('.')[0].replace(/[-_]/g, ' ').toLowerCase();
    const extractedStatementName = statementFile.name.split('.')[0].replace(/[-_]/g, ' ').toLowerCase();
    const extractedVerificationName = verificationDoc.name.split('.')[0].replace(/[-_]/g, ' ').toLowerCase();
    const clientNameClean = nameInput.toLowerCase().trim();

    const basicIdMatch = extractedIdName.includes(clientNameClean) || clientNameClean.includes(extractedIdName);
    const statementMatch = extractedStatementName.includes(clientNameClean) || clientNameClean.includes(extractedStatementName);
    const contextDocMatch = extractedVerificationName.includes(clientNameClean) || clientNameClean.includes(extractedVerificationName);

    if (!basicIdMatch || !statementMatch || !contextDocMatch) {
      return NextResponse.json({ error: `Security Violation: Document Mismatch. The name parameters on your uploaded files do not cross-match.` }, { status: 400 });
    }

    // 2. DYNAMIC 6-MONTH RECENCY COMPLIANCE ENGINE
    // For our live simulation, naming a statement file with old dates (e.g., "Mpesa_2025.pdf") simulates an expired file.
    const statementFileNameLower = statementFile.name.toLowerCase();
    
    // Establishing strict validation logic based on the current timeline (June 2026)
    // A compliant statement must run backwards exactly 6 months (e.g., Dec 2025/Jan 2026 to June 2026)
    const containsOldYear = statementFileNameLower.includes('2024') || 
                            (statementFileNameLower.includes('2025') && !statementFileNameLower.includes('dec'));
    
    if (containsOldYear || statementFileNameLower.includes('old') || statementFileNameLower.includes('expired')) {
      // Log the timestamp breach straight into Supabase as Fraud Flagged
      await supabase.from('applications').insert([{
        name: `EXPIRED DOC: ${nameInput} (${statementFile.name})`,
        income: 0,
        loan_amount: loanAmountRequested,
        purpose,
        employment,
        system_decision: "Fraud Flagged",
        status: "Rejected",
        gross_salary: 0,
        total_money_in: 0,
        total_money_out: 0,
        calculated_max_emi: 0
      }]);

      return NextResponse.json({ 
        error: `Compliance Error: Expired Statement. The uploaded M-Pesa document does not reflect the required 6-month historical window backwards from today. Old or stale statement sheets are restricted.` 
      }, { status: 400 });
    }

    // 3. CREDIT MATH TRACK (IF FILE PASSES TIMELINES)
    const autoExtractedMonthlyIncome = 135000; 
    const autoExtractedMonthlyExpenses = 65000; 

    const staticOneThirdRetention = autoExtractedMonthlyIncome / 3; 
    const trueFreeCashFlow = autoExtractedMonthlyIncome - autoExtractedMonthlyExpenses; 
    const maxAllowedMonthlyRepayment = Math.max(0, trueFreeCashFlow - staticOneThirdRetention);

    const approximateMaxPrincipalQualified = Math.floor(maxAllowedMonthlyRepayment * 32.5);

    let systemDecision = "Pending";
    let finalApprovedAmount = loanAmountRequested;

    if (approximateMaxPrincipalQualified >= loanAmountRequested) {
      systemDecision = "Auto-Approved";
    } else {
      systemDecision = "Counter-Offer Generated";
      finalApprovedAmount = approximateMaxPrincipalQualified;
    }

    const { error } = await supabase
      .from('applications')
      .insert([
        { 
          name: nameInput, 
          income: autoExtractedMonthlyIncome, 
          loan_amount: finalApprovedAmount,   
          purpose, 
          employment,
          gross_salary: autoExtractedMonthlyIncome,
          total_money_in: autoExtractedMonthlyIncome,
          total_money_out: autoExtractedMonthlyExpenses,
          calculated_max_emi: maxAllowedMonthlyRepayment,
          system_decision: systemDecision,
          status: systemDecision === "Auto-Approved" ? "Approved" : "Pending Review"
        }
      ]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ 
      success: true, 
      metrics: { 
        extractedIncome: autoExtractedMonthlyIncome, 
        maxAllowedEMI: maxAllowedMonthlyRepayment,
        requestedAmount: loanAmountRequested,
        qualifiedAmount: approximateMaxPrincipalQualified,
        decision: systemDecision
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}