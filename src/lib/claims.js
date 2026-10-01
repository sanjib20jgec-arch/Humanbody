// Accuracy framework (D24 + R2): every scientific fact shown in a bay is a
// claim object. A claim is publishable only if it passes validateClaim().
export const SOURCE_KINDS = ['syllabus', 'reference', 'peer-reviewed', 'database', 'official', 'textbook'];
export const CLAIM_STATUS = ['verified', 'needs-expert', 'draft'];
const LEVELS = ['class9', 'class10', 'class11-12', 'neet'];

export function validateClaim(claim) {
  const errors = [];
  const need = (cond, msg) => { if (!cond) errors.push(`${claim?.id || '?'}: ${msg}`); };
  need(typeof claim?.id === 'string' && /^[a-z0-9.-]+$/.test(claim.id), 'id must be kebab/dot case');
  need(claim?.text?.en && claim?.text?.bn, 'text needs en and bn');
  need(!/[০-৯]/.test(claim?.text?.bn || ''), 'Bengali text must use English digits (D26)');
  need(LEVELS.includes(claim?.level), 'level must be one of class9/class10/class11-12/neet');
  need(CLAIM_STATUS.includes(claim?.status), 'status invalid');
  need(/^\d{4}-\d{2}-\d{2}$/.test(claim?.reviewed || ''), 'reviewed date YYYY-MM-DD required');
  if (claim?.value !== undefined) {
    need(typeof claim.unit === 'string' && claim.unit.length > 0, 'numeric value needs a unit');
    need(Array.isArray(claim.range) && claim.range.length === 2 && claim.range[0] <= claim.range[1], 'numeric value needs a [min,max] range (scale honesty)');
  }
  const sources = claim?.sources || [];
  need(sources.length >= 2, 'needs at least 2 independent sources (R2)');
  need(sources.every((s) => SOURCE_KINDS.includes(s.kind) && s.title && (s.url || s.citation)), 'each source needs kind, title and url/citation');
  const kinds = new Set(sources.map((s) => s.kind));
  need(kinds.size >= 2 || claim?.status === 'needs-expert', 'sources must be of two different kinds (e.g. syllabus + reference), else mark needs-expert');
  return errors;
}

export function validateClaims(claims) {
  const ids = new Set();
  const errors = [];
  for (const c of claims) {
    if (ids.has(c.id)) errors.push(`${c.id}: duplicate id`);
    ids.add(c.id);
    errors.push(...validateClaim(c));
  }
  return errors;
}
