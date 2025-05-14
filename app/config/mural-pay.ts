export const MURAL_PAY_CONFIG = {
  baseUrl: process.env.MURAL_PAY_API_URL || 'https://api-staging.muralpay.com',
  headers: {
    'Authorization': `Bearer ${process.env.MURAL_PAY_API_KEY || 'e2bf21f3b437a4ff8b3d0fb4:c3d429311d28a5e4ecd60427d0be7ee1bed7caf05d3038070f989f49238d692d0dae931c:981522eb9a9102f72cb7840f438075a4.ccde481d80e2bf6006e57aafc05db26052ea77256a23d5deea7dbece70e9185a'}`,
    'on-behalf-of': process.env.MURAL_PAY_ORG_ID || '646d35c3-39fa-4192-9492-4e5f3395b57e',
    'Content-Type': 'application/json',
  },
  endpoints: {
    accounts: {
      create: '/api/accounts',
      list: '/api/accounts',
      get: (id: string) => `/api/accounts/${id}`,
    },
    payouts: {
      create: '/api/payouts/payout',
      execute: (id: string) => `/api/payouts/payout/${id}/execute`,
    },
  },
} as const;

interface Balance {
  tokenAmount: number;
  tokenSymbol: string;
}

interface WalletDetails {
  walletAddress: string;
  blockchain: string;
}

interface DepositAccount {
  id: string;
  accountId: string;
  status: string;
  currency: string;
  bankBeneficiaryName: string;
  bankBeneficiaryAddress: string;
  bankName: string;
  bankAddress: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  paymentRails: string[];
}

interface AccountDetails {
  balances: Balance[];
  walletDetails: WalletDetails;
  depositAccount: DepositAccount;
}

export interface MuralPayAccount {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  isApiEnabled: boolean;
  status: string;
  accountDetails: AccountDetails;
}

export interface CreateAccountRequest {
  name: string;
}

export interface CreateAccountResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  isApiEnabled: boolean;
  status: string;
  accountDetails?: AccountDetails;
}

export interface PayoutRecipient {
  // Add recipient fields based on API documentation
  // This is a placeholder for the actual recipient structure
  [key: string]: any;
}

interface Amount {
  value: number;
  currency: string;
}

export interface FiatAndRailDetails {
  type: 'usd';
  symbol: string;
  accountType: 'CHECKING' | 'SAVINGS';
  bankAccountNumber: string;
  bankRoutingNumber: string;
}

export interface PhysicalAddress {
  address1: string;
  address2?: string;
  country: string;
  state: string;
  city: string;
  zip: string;
}

export interface IndividualRecipientInfo {
  type: 'individual';
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  physicalAddress: PhysicalAddress;
}

export interface BusinessRecipientInfo {
  type: 'business';
  businessName: string;
  taxId: string;
  email: string;
}

export interface PayoutAmount {
  tokenAmount: number;
  tokenSymbol: string;
}

export interface FiatPayoutDetails {
  type: 'fiat';
  bankName: string;
  bankAccountOwner: string;
  fiatAndRailDetails: FiatAndRailDetails;
}

export interface SupportingDetails {
  payoutPurpose: 'VENDOR_PAYMENT' | 'PAYROLL' | 'OTHER';
}

export interface PayoutRequest {
  amount: {
    tokenAmount: number;
    tokenSymbol: string;
  };
  payoutDetails: FiatPayoutDetails;
  recipientInfo: IndividualRecipientInfo | BusinessRecipientInfo;
  supportingDetails: SupportingDetails;
}

export interface CreatePayoutRequest {
  sourceAccountId: string;
  memo?: string;
  payouts: PayoutRequest[];
}

export interface ExecutePayoutHeaders {
  'Authorization': string;
  'on-behalf-of': string;
  'x-transfer-key': string;
  'Content-Type': string;
}

export interface KnownAccount {
  name: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'CHECKING' | 'SAVINGS';
}

export const KNOWN_ACCOUNTS: KnownAccount[] = [
  {
    name: "Test Recipient",
    routingNumber: "101019644",
    accountNumber: "123456789",
    accountType: "CHECKING"
  },
  // Add more known accounts as needed
]; 