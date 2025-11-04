---
title: API Reference
sidebar_position: 1
---

# API Overview

These APIs allow your dApp to check user existence and handle sign-in via Google
with Oko.

## Service Endpoints

The Oko system provides REST APIs for authentication, key management,
and transaction signing:

| Service          | Port | Purpose                            |
| ---------------- | ---- | ---------------------------------- |
| Main API Server  | 4200 | TSS operations and admin functions |
| Credential Vault | 4201 | Secure key share storage           |

### `POST /user/v1/signin`

Sign in a user via Google OAuth. This endpoint will return an authentication
token and related metadata on success.

#### Request

- **Method**: `POST`
- **Headers**: `Authorization: Bearer <Google ID Token>` (The token should be
  issued via Google Sign-In)

#### Response

#### 200 OK

```javascript
{
  "success": true,
  "data": {
    "wallet_address": "cosmos1...",
    "auth_token": "eyJhbGciOi...",
    ...
  }
}
```

**401 Unauthorized**

```json
{
  "success": false,
  "code": "UNAUTHORIZED",
  "msg": "Unauthorized"
}
```

**404 User or Wallet Not Found**

```json
{
  "success": false,
  "code": "USER_NOT_FOUND", // or "WALLET_NOT_FOUND"
  "msg": "User not found"
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "code": "FAILED_TO_GENERATE_TOKEN" | "UNKNOWN_ERROR",
  "msg": "Something went wrong"
}
```

### `GET /user/v1/check/:email`

Check whether a user account exists for a given gmail address.

#### Request

- **Method**: `GET`
- **Path param**: `:email` (string) - Email to check

**Example**  
GET /user/v1/check/user@example.com

**Response**  
**200 OK**

```json
{
  "success": true,
  "data": {
    "exists": true
  }
}
```

**400 Bad Request (missing email address)**

```json
{
  "success": false,
  "code": "INVALID_REQUEST",
  "msg": "email is required"
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "code": "UNKNOWN_ERROR",
  "msg": "Failed to get user"
}
```

## Examples

Examples of signing transactions:

### Signing Transactions

**Cosmos**

- cosmos_signAmino
- cosmos_signDirect
- cosmos_signArbitrary
- secp256k1_sign

**Ethereum**

- eth_sendTransaction
- personal_sign
- eth_signTransaction
- eth_signTypedData_v4
- secp256k1_sign

## Authentication

### Google OAuth Flow

From `packages/ewallet_api/tss_api/src/routes/user.ts`:

**Sign-in endpoint:**

```
POST /tss/v1/user/signin
- Initiates Google OAuth authentication
- Returns JWT token for subsequent API calls
```

**User verification:**

```
GET /tss/v1/user/check/:email
- Checks if email exists in system
- Used for user registration flow
```

### JWT Token Usage

Based on middleware implementation:

```
Authorization: Bearer <jwt_token>
```

Token configuration from `packages/ewallet_api/server/src/config/env.ts`:

- Default expiration: "1H"
- Configurable via `JWT_EXPIRES_IN` environment variable

## TSS API Endpoints

### Base Path: `/tss/v1`

From `packages/ewallet_api/tss_api/src/routes/`:

#### Key Generation

```
POST /keygen
Content-Type: application/json

Purpose: Create distributed key shares and wallet entities
Implementation: Coordinates threshold key generation protocol
Database: Creates entries in wallets table and key_shares table
```

#### Triple Generation (Preprocessing)

```
POST /triples
Content-Type: application/json

Purpose: Generate Beaver triples for efficient signature preprocessing
Implementation: Creates reusable cryptographic material
Benefits: Reduces signature latency by preprocessing before message known
```

#### Presignature Creation

```
POST /presign
Content-Type: application/json

Purpose: Create presignature components using preprocessed triples
Implementation: Combines triples with key shares for signature preparation
Database: Operations tracked in tss_sessions and tss_stages tables
```

#### Signature Completion

```
POST /sign
Content-Type: application/json

Purpose: Complete ECDSA signature using presignatures and message
Implementation: Final signature creation step
Output: Standard ECDSA signature (r, s) format
```

## Admin API Endpoints

### Base Path: `/ewallet_admin/v1`

From `packages/ewallet_api/admin_api/src/routes/`:

#### Customer Management

```
POST /create_customer
Content-Type: application/json

Purpose: Create new customer organization with dashboard user
Database: Creates entries in customers and customer_dashboard_users tables
Authentication: Admin-level access required
```

```
GET /customers
Content-Type: application/json

Purpose: Retrieve all customer organizations
Response: List of customer entities with metadata(customer information and API keys)
Authentication: Admin-level access required
```

```
GET /customers/:customer_id
Path Parameter: customer_id

Purpose: Get specific customer details
Response: Customer entity with associated user accounts
Authentication: Admin-level access required
```

```
DELETE /customers/:customer_id
Path Parameter: customer_id

Purpose: Delete speicific customer and related customer dashboard users
Response: Customer ids with associated user ids
Authentication: Admin-level access required
```

#### User Management

From admin API routes, additional endpoints for:

- User account creation and management
- Role assignment and permissions
- System administration functions

## Credential Vault API

### Base Path: `/keyshare/v1` and `/commit/v1`

From `packages/credential_vault/server/src/routes/`:

#### Key Share Operations

```
POST /keyshare/v1/register
Content-Type: application/json

Purpose: Store encrypted key shares in secure vault
Implementation: Encrypted storage with access control
Database: key_shares table in credential vault database
```

```
POST /keyshare/v1/keyshare
Content-Type: application/json

Purpose: Retrieve key shares by public key
Implementation: Secure retrieval with authentication
Access Control: Based on user session and committee membership
```

#### Commitment Operations

```
POST /commit/v1/id-token
Content-Type: application/json

Purpose: Commit ID tokens with user session keys
Implementation: Links OAuth tokens with cryptographic sessions
Database: witnessed_id_tokens table
```

## Database Integration

### Session Tracking

Based on schema in `packages/ewallet_pg_interface/migrate/migrate.sql`:

**TSS Sessions:**

- All TSS operations create entries in `tss_sessions` table
- Session state stored as JSONB for flexibility
- Individual stages tracked in `tss_stages` table

**Audit Logging:**

- All API operations logged in `audit_logs` table
- Includes actor information, action type, and IP address
- Complete audit trail for security and compliance

### Error Handling

**Standard Error Response Format:**

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

Common HTTP status codes:

- `401 Unauthorized` - Invalid or missing JWT token
- `403 Forbidden` - Insufficient permissions
- `400 Bad Request` - Invalid request parameters
- `500 Internal Server Error` - Server-side errors

## Configuration

### Required Environment Variables

From `packages/ewallet_api/server/src/config/env.ts`:

**JWT Configuration:**

```bash
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="1H"  # Default token expiration
```

**Email Configuration (SMTP_PORT must be 587):**

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="your-email@gmail.com"
```

**Email Verification:**

```bash
EMAIL_VERIFICATION_EXPIRATION_MINUTES="5"
```

### Input Validation

Based on Express.js configuration:

- Zod schema validation for request parameters
- JSON body parsing with 10MB limit
- CORS middleware for cross-origin requests
- Helmet middleware for security headers

## Development Tools

### API Documentation

Express.js services include Swagger/OpenAPI documentation:

- Main API: `http://localhost:4200/docs`
- Credential Vault: `http://localhost:4201/docs`

### Testing Endpoints

Example API testing commands:

```bash
# Test TSS authentication
curl -X POST http://localhost:4200/tss/v1/user/signin \
  -H "Content-Type: application/json" \
  -d '{"credential": "google-oauth-token"}'

# Test key generation (requires authentication)
curl -X POST http://localhost:4200/tss/v1/keygen \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"participants": 2, "threshold": 1}'
```

### Monitoring and Health Checks

API services provide standard monitoring endpoints:

- Health checks for service availability
- Metrics collection for performance monitoring
- Database connection status verification

## SDK Integration

### Core SDK Usage

From `packages/ewallet_sdk_core/src/init.ts`:

```typescript
import { KeplrEWallet } from "@oko-wallet/sdk-core";

// Initialize with API configuration
const wallet = await KeplrEWallet.init({
  api_key: "your-api-key",
  // Additional configuration options
});
```

### Blockchain-Specific SDKs

**Cosmos Integration:**

- CosmosEWallet class wraps TSS API calls
- Methods: `getAccounts()`, `signAmino()`, `signDirect()`
- Chain registry integration for multi-chain support

**Ethereum Integration:**

- EIP-1193 provider implementation
- Viem integration for transaction handling
- Standard Ethereum RPC method support

This API architecture provides a comprehensive interface for threshold ECDSA
wallet operations, with clear separation between TSS protocols, administrative
functions, and secure key storage.
