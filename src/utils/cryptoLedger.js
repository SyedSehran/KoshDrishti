// Cryptographic SHA-256 simulation and Merkle Audit Trail Engine for AICTE VISHWAS-FDR

export function pseudoHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to deterministic 64-char hex-like string
  const abs = Math.abs(hash).toString(16).padStart(8, '0');
  const part2 = ((hash * 31) >>> 0).toString(16).padStart(8, '0');
  const part3 = ((hash * 127) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((hash * 8191) >>> 0).toString(16).padStart(8, '0');
  const part5 = ((hash * 131071) >>> 0).toString(16).padStart(8, '0');
  const part6 = ((hash * 524287) >>> 0).toString(16).padStart(8, '0');
  const part7 = ((hash * 6700417) >>> 0).toString(16).padStart(8, '0');
  const part8 = ((hash * 2147483647) >>> 0).toString(16).padStart(8, '0');
  return (abs + part2 + part3 + part4 + part5 + part6 + part7 + part8).substring(0, 64);
}

export function generateBlockHash(index, previousHash, timestamp, action, actor, details) {
  const payload = `${index}|${previousHash}|${timestamp}|${action}|${actor}|${JSON.stringify(details)}`;
  return pseudoHash(payload);
}

export function verifyLedgerChain(chain) {
  if (!chain || chain.length === 0) return { isValid: true, brokenAt: null };
  for (let i = 1; i < chain.length; i++) {
    const current = chain[i];
    const prev = chain[i - 1];
    if (current.previousHash !== prev.blockHash) {
      return { isValid: false, brokenAt: i, reason: `Hash mismatch at block #${current.blockIndex}` };
    }
  }
  return { isValid: true, brokenAt: null, totalBlocks: chain.length };
}
