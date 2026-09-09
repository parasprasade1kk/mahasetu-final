const AuditLog = require('../models/AuditLog');

async function createAuditLog({
  actorId,
  actorRole = 'citizen',
  action,
  targetResource = '',
  targetId = '',
  metadata = {},
  ipAddress = '127.0.0.1',
  status = 'SUCCESS',
}) {
  try {
    const sanitizedMetadata = { ...metadata };
    // Strictly strip any sensitive credentials if passed
    delete sanitizedMetadata.password;
    delete sanitizedMetadata.passwordHash;
    delete sanitizedMetadata.otp;
    delete sanitizedMetadata.rawAadhaar;
    delete sanitizedMetadata.securityPin;

    const logId = `AUD-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    await AuditLog.create({
      logId,
      actorId: actorId || 'ANONYMOUS',
      actorRole,
      action,
      targetResource,
      targetId,
      metadata: sanitizedMetadata,
      ipAddress,
      status,
      timestamp: new Date(),
    });
  } catch (err) {
    // Non-blocking error logging
    console.error('Failed to persist audit log:', err.message);
  }
}

module.exports = { createAuditLog };
