import crypto from 'crypto';

/**
 * Generate HMAC-SHA256 signature for webhook payload
 * This signature is used by recipients to verify the authenticity of webhook events
 * 
 * @param {string} payload - The JSON payload to sign
 * @param {string} secret - The secret key for signing
 * @returns {string} Base64 encoded signature
 */
export function generateSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
}

/**
 * Verify HMAC signature
 * Used by webhook recipients to validate incoming requests
 * 
 * @param {string} payload - The JSON payload
 * @param {string} signature - The received signature
 * @param {string} secret - The secret key for verification
 * @returns {boolean} True if signature is valid
 */
export function verifySignature(payload, signature, secret) {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

