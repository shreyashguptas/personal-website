/**
 * Security utilities for monitoring and logging security events
 */

export interface SecurityEvent {
  type: 'rate_limit' | 'cross_origin' | 'validation_failed' | 'request_too_large' | 'invalid_content_type';
  clientKey: string;
  details: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };
  
  // Log to console with structured format
  console.warn('[SECURITY_EVENT]', JSON.stringify(securityEvent));
  
  // In production, you might want to send this to a security monitoring service
  // or log aggregation service like DataDog, LogRocket, etc.
}

export function sanitizeClientKey(key: string): string {
  // Remove potentially sensitive information from client keys for logging
  return key.replace(/:\s*[^:]*$/, ':***');
}

export function isSuspiciousRequest(req: Request): boolean {
  const userAgent = req.headers.get('user-agent') || '';

  // Check for common bot/attack patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /scraper/i,
    /spider/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /go-http-client/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}
