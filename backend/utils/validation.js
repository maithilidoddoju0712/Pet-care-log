function text(value, field, max = 1000, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new Error(`${field} is required.`);
    return null;
  }
  if (typeof value !== 'string') throw new Error(`${field} must be text.`);
  const cleaned = value.trim();
  if (required && !cleaned) throw new Error(`${field} is required.`);
  if (cleaned.length > max) throw new Error(`${field} must be ${max} characters or fewer.`);
  return cleaned || null;
}
function date(value, field, required = false) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new Error(`${field} is required.`);
    return null;
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${field} must use YYYY-MM-DD format.`);
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0,10) !== value) throw new Error(`${field} is not a valid date.`);
  return value;
}
function positiveId(value, field='id') {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) throw new Error(`${field} must be a positive integer.`);
  return n;
}
function enumValue(value, field, allowed) {
  if (typeof value !== 'string' || !allowed.includes(value)) throw new Error(`${field} must be one of: ${allowed.join(', ')}.`);
  return value;
}
function weight(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 1000) throw new Error('Weight must be between 0 and 1000 kg.');
  return n;
}
function handleValidation(fn) {
  return (req,res,next) => {
    try { req.validated = fn(req); next(); }
    catch (e) { res.status(400).json({error:e.message || 'Invalid input.'}); }
  };
}
module.exports = { text, date, positiveId, enumValue, weight, handleValidation };
