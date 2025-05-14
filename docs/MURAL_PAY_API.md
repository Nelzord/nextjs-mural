# Mural Pay API Integration Guide

## Environment Configuration

The following environment variables should be set in `.env.local`:

```env
MURAL_PAY_API_URL=https://api-staging.muralpay.com
MURAL_PAY_API_KEY=<api-key>
MURAL_PAY_TRANSFER_KEY=<transfer-key>
MURAL_PAY_ORG_ID=<org-id>
```

## API Endpoints

### Account Management

1. **Create Account** (`POST /api/accounts`)
   - Creates an API-enabled account
   - Required: `name`
   - Auth: Bearer token, org ID
   - Response includes: `id`, `status`, `isApiEnabled`

2. **List Accounts** (`GET /api/accounts`)
   - Lists all organization accounts
   - Use to confirm `isApiEnabled` and get account IDs
   - Auth: Bearer token, org ID

3. **Get Account Details** (`GET /api/accounts/:id`)
   - Gets wallet/balance/deposit details for one account
   - Auth: Bearer token, org ID

### Payout Management

1. **Create Payout Request** (`POST /api/payouts/payout`)
   - Required Headers:
     - `authorization: Bearer <api-key>`
     - `on-behalf-of: <org-id>`
   - Request Body:
     - `sourceAccountId` (UUID, required)
     - `memo` (optional string)
     - `payouts`: array of recipient objects
   - Maximum 350 payouts per request
   - Response: 201 Created

2. **Execute Payout** (`POST /api/payouts/payout/:id/execute`)
   - Required Headers:
     - `authorization: Bearer <api-key>`
     - `on-behalf-of: <org-id>`
     - `x-transfer-key: <transfer-key>` (required to move funds)
   - Response: 200 OK

## Implementation Notes

- All API calls should include the base URL: `https://api-staging.muralpay.com`
- The Transfer Key is only required for executing payouts
- Account creation and listing use the standard API Key
- Maximum of 350 payouts can be included in a single payout request
- Always verify `isApiEnabled` status before attempting payouts

## Type Definitions

Type definitions for API requests and responses are available in `app/config/mural-pay.ts`. 