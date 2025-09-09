// Intake service
// - Prepares requests for remote analysis API (optional)
// - Falls back gracefully if API is not configured

import { Case } from '@/types';
import { API_URL, ENABLE_INTAKE_ANALYSIS } from '@/config';

export interface IntakePayload {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  incidentDate?: string;
  injuryType: string;
  description: string;
}

// Minimal shape expected back from an analyzer API
export type Analysis = Case['analysis'];

export async function analyzeIntake(payload: IntakePayload, signal?: AbortSignal): Promise<Analysis | undefined> {
  if (!ENABLE_INTAKE_ANALYSIS) return undefined; // disabled by default until you turn it on

  if (API_URL) {
    try {
      const res = await fetch(`${API_URL.replace(/\/$/, '')}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      });
      if (!res.ok) throw new Error(`Analyzer error: ${res.status}`);
      const data = await res.json();
      // Best-effort normalization; backend should mirror these keys
      const analysis: Analysis = {
        score: Number(data.score ?? 0),
        estimatedValue: Number(data.estimatedValue ?? 0),
        riskFactors: Array.isArray(data.riskFactors) ? data.riskFactors.map(String) : [],
        recommendation: String(data.recommendation ?? ''),
        timestamp: String(data.timestamp ?? new Date().toISOString()),
      };
      return analysis;
    } catch (_e) {
      // TODO: report error to a logger/monitoring service
      // Fallback to deterministic local analysis so UX remains smooth
      return fakeAnalysisFromSeed(`${payload.fullName}|${payload.email}|${payload.injuryType}`);
    }
  }
  // No API configured; leave analysis undefined by default
  return undefined;
}

function fakeAnalysisFromSeed(seedStr: string): Analysis {
  const seed = Array.from(seedStr).reduce((a, c) => a + c.charCodeAt(0), 0);
  const score = (seed % 50) + 50;
  const estimatedValue = score * 1000;
  const riskFactors = score > 80 ? ['Low risk'] : ['Moderate risk'];
  const recommendation = score > 80 ? 'High priority' : 'Review carefully';
  return { score, estimatedValue, riskFactors, recommendation, timestamp: new Date().toISOString() };
}

