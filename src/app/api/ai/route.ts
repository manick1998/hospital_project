import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, symptoms, vitals, history, medications, allergies } = body;

    if (action === 'symptom-checker') {
      const symptomList = symptoms || 'Unspecified chest tightness and fatigue';

      let urgency = 'MODERATE';
      const lower = symptomList.toLowerCase();
      if (lower.includes('chest pain') || lower.includes('shortness of breath') || lower.includes('stroke') || lower.includes('numbness')) {
        urgency = 'HIGH_PRIORITY_EMERGENCY';
      }

      return NextResponse.json({
        urgency,
        differentialDiagnoses: [
          { condition: 'Atypical Angina Pectoris / Ischemic Heart Disease', probability: '68%', rationale: 'Exertional symptoms combined with mild hypertensive vitals.' },
          { condition: 'Gastroesophageal Reflux Disease (GERD) with Esophageal Spasm', probability: '22%', rationale: 'Retrosternal discomfort aggravated postprandially.' },
          { condition: 'Musculoskeletal Chest Wall Strain', probability: '10%', rationale: 'Local tenderness upon palpation.' },
        ],
        recommendedTests: [
          '12-Lead Electrocardiogram (ECG)',
          'High-Sensitivity Troponin-I & CK-MB',
          'Echocardiogram (TTE)',
          'Complete Lipid Profile & Serum Electrolytes',
        ],
        clinicalSummary: `Patient presents with ${symptomList}. Immediate ECG and cardiac enzyme evaluation advised prior to discharge or medication escalation.`,
      });
    }

    if (action === 'drug-interaction') {
      const rxList: string[] = medications || [];
      const allergyList: string[] = allergies || [];
      const warnings: string[] = [];
      let flagged = false;

      // Allergy cross checks
      allergyList.forEach((allergy) => {
        const alg = allergy.toLowerCase();
        rxList.forEach((med) => {
          const m = med.toLowerCase();
          if (alg.includes('penicillin') && (m.includes('amoxicillin') || m.includes('ampicillin') || m.includes('augmentin'))) {
            warnings.push(`CRITICAL ALLERGY ALERT: ${med} is a penicillin derivative. Patient has documented Penicillin allergy!`);
            flagged = true;
          }
          if (alg.includes('sulfa') && (m.includes('bactrim') || m.includes('sulfamethoxazole'))) {
            warnings.push(`CRITICAL ALLERGY ALERT: ${med} contains sulfonamides.`);
            flagged = true;
          }
          if (alg.includes('aspirin') && (m.includes('ibuprofen') || m.includes('naproxen') || m.includes('aspirin'))) {
            warnings.push(`ALLERGY WARNING: Cross-sensitivity risk between Aspirin and ${med}.`);
            flagged = true;
          }
        });
      });

      // Drug-Drug interaction checks
      const hasACE = rxList.some((m) => /enalapril|lisinopril|ramipril/i.test(m));
      const hasARB = rxList.some((m) => /telmisartan|losartan|valsartan/i.test(m));
      const hasKSparing = rxList.some((m) => /spironolactone|eplerenone/i.test(m));

      if (hasACE && hasARB) {
        warnings.push('DRUG INTERACTION ALERT: Dual blockade of RAAS (ACE-i + ARB) increases acute kidney injury and hyperkalemia risk.');
        flagged = true;
      }
      if ((hasACE || hasARB) && hasKSparing) {
        warnings.push('MONITORING REQUIRED: Co-administration of RAAS blocker and Potassium-sparing diuretic requires regular K+ lab checks.');
      }

      if (warnings.length === 0) {
        warnings.push('No severe drug-drug interactions or allergy contraindications flagged for current prescription.');
      }

      return NextResponse.json({
        flagged,
        warnings,
        summary: flagged
          ? 'Alerts detected! Please review medication selection before signing prescription.'
          : 'Prescription safety check passed successfully.',
      });
    }

    if (action === 'clinical-summary') {
      return NextResponse.json({
        soapNote: {
          subjective: `Patient reports: ${symptoms || 'General malaise and fatigue'}. History noted: ${(history || []).join(', ') || 'None'}.`,
          objective: `Vitals: ${JSON.stringify(vitals || 'Vitals stable')}. Physical examination normal.`,
          assessment: `Primary clinical working diagnosis under evaluation.`,
          plan: `Order baseline diagnostics, continue symptom management, follow-up in 14 days.`,
        },
      });
    }

    if (action === 'discharge-summary') {
      return NextResponse.json({
        summaryText: `AEGISCARE MEDICAL CENTER - PATIENT DISCHARGE SUMMARY\n\nPatient Name: ${body.patientName || 'Patient'}\nAdmission Date: ${body.admittedAt || 'Recent'}\nDischarge Date: ${new Date().toLocaleDateString()}\nDiagnosis: ${body.diagnosis || 'Cardiovascular Observation'}\n\nSummary of Hospital Course:\nPatient was admitted for clinical evaluation. Responded well to medical management. Baseline vitals stabilized prior to discharge.\n\nDischarge Advice:\n- Continue prescribed medications as instructed.\n- Maintain low-sodium diet and hydrate well.\n- Follow up with primary physician in 2 weeks.`,
      });
    }

    return NextResponse.json({ message: 'AI Clinical Copilot active.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
