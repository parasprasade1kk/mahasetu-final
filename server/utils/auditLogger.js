const { supabase } = require('../config/supabase');

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
    delete sanitizedMetadata.password;
    delete sanitizedMetadata.passwordHash;
    delete sanitizedMetadata.otp;
    delete sanitizedMetadata.rawAadhaar;
    delete sanitizedMetadata.securityPin;

    const logId = `AUD-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    await supabase.from('audit_logs').insert({
      log_id: logId,
      actor_id: actorId || 'ANONYMOUS',
      actor_role: actorRole,
      action,
      target_resource: targetResource,
      target_id: targetId,
      metadata: sanitizedMetadata,
      ip_address: ipAddress,
      status,
    });
  } catch (err) {
    console.error('Failed to persist audit log to Supabase:', err.message);
  }
}

module.exports = { createAuditLog };
