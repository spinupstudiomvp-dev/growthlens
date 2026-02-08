const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://patient-toucan-352.eu-west-1.convex.site";

export async function storeAudit(data: {
  profileUrl: string;
  profileName: string;
  auditData: string;
  source: string;
  overallScore: number;
  overallGrade: string;
  email?: string;
}): Promise<string> {
  const res = await fetch(`${CONVEX_URL}/api/store-audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const { id } = await res.json();
  return id;
}

export async function getAudit(id: string) {
  const res = await fetch(`${CONVEX_URL}/api/get-audit?id=${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function listAudits(limit = 50) {
  const res = await fetch(`${CONVEX_URL}/api/list-audits?limit=${limit}`);
  return res.json();
}

export async function storeComparison(data: {
  profileUrlA: string;
  profileUrlB: string;
  profileNameA: string;
  profileNameB: string;
  auditDataA: string;
  auditDataB: string;
  gapAnalysis: string;
  email?: string;
}): Promise<string> {
  const res = await fetch(`${CONVEX_URL}/api/store-comparison`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const { id } = await res.json();
  return id;
}

export async function getComparison(id: string) {
  const res = await fetch(`${CONVEX_URL}/api/get-comparison?id=${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateAuditEmail(id: string, email: string): Promise<void> {
  await fetch(`${CONVEX_URL}/api/update-audit-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, email }),
  });
}

export async function updateComparisonEmail(id: string, email: string): Promise<void> {
  await fetch(`${CONVEX_URL}/api/update-comparison-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, email }),
  });
}

export async function listComparisons(limit = 50) {
  const res = await fetch(`${CONVEX_URL}/api/list-comparisons?limit=${limit}`);
  return res.json();
}
