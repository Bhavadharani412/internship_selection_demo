# Security Review & Recommendations

## Current State

### ✅ What's Good

1. **Input Validation**: Zod validation on all API endpoints.
2. **CORS**: Enabled with helmet middleware for security headers.
3. **Helmet**: Security headers (CSP, X-Frame-Options, etc.) configured.
4. **TypeScript**: Full type safety prevents many common errors.
5. **Error Handling**: Safe error messages without exposing internals.
6. **JSON Size Limits**: 200KB request limit prevents DoS.

### ⚠️ Current Limitations (Portfolio App)

This is a **portfolio demonstration**, not a production app. The following are intentional tradeoffs:

#### 1. **Anonymous Authentication**
- Uses `x-client-id` header stored in localStorage
- **Current**: Sufficient for anonymous shopping (wishlist, cart, profile)
- **Issue**: Not suitable for real user accounts
- **For Production**: Implement OAuth2/JWT with secure token storage (httpOnly cookies)

#### 2. **In-Memory Data Storage**
- Data stored in JavaScript `Map` objects, lost on server restart
- **Current**: Acceptable for demo with optional MongoDB fallback
- **For Production**: Always use persistent database (MongoDB, PostgreSQL)
- **Risk**: No data persistence, no audit logs

#### 3. **Missing Authentication Layers**
- No login/signup endpoints
- No session management
- No password hashing (not needed for anonymous profile)
- **For Production**: 
  - Implement `/auth/signup`, `/auth/login`, `/auth/refresh`
  - Use bcrypt for password hashing
  - Implement refresh token rotation

#### 4. **No Authorization**
- Profile endpoints return data for any `x-client-id`
- No role-based access control (RBAC)
- **For Production**: 
  - Verify user owns resource before returning
  - Implement permission checks on mutations
  - Add admin endpoints with role verification

#### 5. **Missing Rate Limiting**
- No DDoS protection on expensive operations
- **For Production**: Implement rate limiting on:
  - `/api/v1/profile` (PATCH) - 10 req/min per client
  - `/api/v1/appointments` (POST) - 5 req/min per client
  - `/api/v1/search/suggestions` - 30 req/min per client

#### 6. **No CSRF Protection**
- Only CORS; missing CSRF tokens
- **Current**: Acceptable (no session cookies)
- **For Production**: Add CSRF token validation on state-changing operations

#### 7. **Vulnerable Appointment Booking**
- No idempotency keys
- Race condition: Multiple simultaneous books can succeed for same slot
- **For Production**: 
  - Require `Idempotency-Key` header on POST
  - Use database transaction to atomically reserve slot

#### 8. **Missing Audit Logging**
- No event tracking for compliance/fraud detection
- **For Production**: Log:
  - User profile changes
  - High-value cart events
  - Appointment creation/cancellation
  - Admin actions

#### 9. **No Input Sanitization**
- User inputs not sanitized for XSS in stored data
- **Current**: Safe with TypeScript + Tailwind
- **For Production**: Use DOMPurify for user-generated content

#### 10. **Exposed API Internals**
- Error messages reveal structure
- **For Production**: Return generic errors to clients, log details server-side

---

## Specific Recommendations by Feature

### User Profile
```typescript
// ✅ Good: Zod validation
const profileSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  // ...
});

// ⚠️ For Production:
// 1. Verify user ownership
if (ownerFromToken !== ownerFromRequest) {
  return res.status(403).json({ error: "Unauthorized" });
}

// 2. Implement email verification
// 3. Add phone number verification for sensitive changes
// 4. Implement change verification (send confirmation link)
```

### Wishlist & Cart
```typescript
// ✅ Current: Anonymous safe

// ⚠️ For Production:
// 1. After login, migrate anonymous cart to user account
// 2. Validate product IDs exist and are in stock
// 3. Revalidate prices on every cart read
// 4. Implement cart encryption at rest
```

### Appointments
```typescript
// ⚠️ Critical Issue: Race Condition
app.post("/appointments", (req, res) => {
  // PROBLEM: Two requests can race here
  if (appointments.some(a => a.date === date && a.time === time)) {
    // Both threads see slot available
  }
  appointments.push(new_appointment); // Both succeed!
});

// ✅ For Production: Use DB transaction
const reserved = await db.transaction(async (tx) => {
  const existing = await tx.appointments.findOne({ date, time });
  if (existing) throw new SlotUnavailableError();
  return await tx.appointments.create({ ...payload });
});
```

---

## Security Checklist for Production

- [ ] Implement JWT authentication with refresh tokens
- [ ] Use httpOnly, secure cookies for tokens
- [ ] Add login/logout endpoints with session management
- [ ] Implement email verification for profile creation
- [ ] Add rate limiting (redis-based)
- [ ] Add request signing/verification for sensitive operations
- [ ] Implement CSRF token validation
- [ ] Use database transactions for critical operations
- [ ] Add audit logging for all mutations
- [ ] Implement content security policy (CSP)
- [ ] Add password reset flow with secure tokens
- [ ] Implement two-factor authentication (optional)
- [ ] Regular security audits & penetration testing
- [ ] HTTPS everywhere (TLS 1.3+)
- [ ] Implement API versioning for breaking changes
- [ ] Add monitoring & alerting for suspicious activity
- [ ] Document security practices in runbook
- [ ] Regular dependency updates & vulnerability scanning

---

## Environment Security

### ✅ Currently Safe
- No hardcoded secrets in code
- `.env.example` provided
- MongoDB URI optional

### ⚠️ For Production
```bash
# Use secrets management:
# - AWS Secrets Manager
# - Hashicorp Vault
# - 1Password Business
# - Vercel Environment Variables (for deployment)

# Never commit .env files
# Rotate secrets quarterly
# Use different secrets per environment (dev/staging/prod)
```

---

## Data Privacy Compliance

### GDPR
- [ ] Privacy policy published
- [ ] Consent for data collection
- [ ] Right to data export
- [ ] Right to deletion (GDPR forget-me)
- [ ] Data retention policy (30 days default for anonymous)

### PCI-DSS (if accepting payments)
- [ ] Use Stripe/Razorpay (never handle raw card data)
- [ ] No sensitive auth data in logs
- [ ] Encrypt data in transit (TLS) and at rest

---

## Testing Security

```typescript
// Example: Test unauthorized access
describe("Profile Security", () => {
  it("should reject profile access from different client", async () => {
    const res = await api("/profile")
      .set("x-client-id", "different-client");
    expect(res.status).toBe(403);
  });

  it("should not allow other users' data modification", async () => {
    const res = await api("/profile")
      .patch({ name: "Hacker" })
      .set("x-client-id", "other-client");
    expect(res.status).toBe(403);
  });
});
```

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/nodejs-security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
