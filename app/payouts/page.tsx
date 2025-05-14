'use client';

import { useState, useEffect } from 'react';
import { 
  MuralPayAccount, 
  CreatePayoutRequest, 
  PayoutRequest,
  IndividualRecipientInfo,
  BusinessRecipientInfo,
  FiatPayoutDetails,
  RecipientDetails,
  KNOWN_ACCOUNTS
} from '@/app/config/mural-pay';

interface PayoutHistory {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  memo?: string;
  sourceAccountId: string;
  payouts: PayoutRequest[];
}

export default function PayoutsPage() {
  const [accounts, setAccounts] = useState<MuralPayAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [recipientType, setRecipientType] = useState<'individual' | 'business'>('individual');
  const [payoutType, setPayoutType] = useState<'fiat' | 'blockchain'>('fiat');

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/mural-pay/accounts');
      const data = await response.json();
      setAccounts(data.filter((account: MuralPayAccount) => account.isApiEnabled));
    } catch (err) {
      setError('Failed to fetch accounts');
    }
  };

  const fetchPayoutHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/mural-pay/payouts/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payout history');
      }

      const data = await response.json();
      // Ensure we're working with an array, even if the API returns a single object
      const payouts = Array.isArray(data) ? data : data.payouts || [];
      setPayoutHistory(payouts);
    } catch (err) {
      console.error('Error fetching payout history:', err);
      setError('Failed to fetch payout history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const addPayout = () => {
    const newPayout: PayoutRequest = {
      amount: {
        tokenAmount: 0,
        tokenSymbol: 'USDC'
      },
      payoutDetails: {
        fiat: {
          paymentMethod: 'ACH_PUSH'
        }
      },
      recipient: {
        name: '',
        routingNumber: '',
        accountNumber: '',
        accountType: 'CHECKING'
      }
    };
    setPayouts([...payouts, newPayout]);
  };

  const updatePayout = (index: number, field: string, value: any) => {
    const updatedPayouts = [...payouts];
    const payout = updatedPayouts[index];

    if (field.startsWith('amount.')) {
      const amountField = field.split('.')[1];
      if (amountField === 'tokenAmount') {
        payout.amount.tokenAmount = value;
      } else if (amountField === 'tokenSymbol') {
        payout.amount.tokenSymbol = value;
      }
    } else if (field.startsWith('recipient.')) {
      const recipientField = field.split('.')[1];
      if (recipientField === 'name') {
        payout.recipient.name = value;
      } else if (recipientField === 'routingNumber') {
        payout.recipient.routingNumber = value;
      } else if (recipientField === 'accountNumber') {
        payout.recipient.accountNumber = value;
      } else if (recipientField === 'accountType') {
        payout.recipient.accountType = value as 'CHECKING' | 'SAVINGS';
      }
    }

    setPayouts(updatedPayouts);
  };

  const removePayout = (index: number) => {
    setPayouts(payouts.filter((_, i) => i !== index));
  };

  const prefillPayout = (index: number, account: MuralPayAccount) => {
    const updatedPayouts = [...payouts];
    const payout = updatedPayouts[index];
    
    if (account.accountDetails?.depositAccount) {
      const depositAccount = account.accountDetails.depositAccount;
      payout.recipient = {
        name: depositAccount.bankBeneficiaryName,
        routingNumber: depositAccount.bankRoutingNumber,
        accountNumber: depositAccount.bankAccountNumber,
        accountType: 'CHECKING' // Default to CHECKING as it's most common
      };
    }
    
    setPayouts(updatedPayouts);
  };

  const createPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payoutRequest: CreatePayoutRequest = {
        sourceAccountId: selectedAccount,
        memo,
        payouts
      };

      console.log('Sending payout request:', JSON.stringify(payoutRequest, null, 2));

      const response = await fetch('/api/mural-pay/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payoutRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to create payout');
      }

      const data = await response.json();
      console.log('Raw response:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Payout Creation Response Data:', data);
      
      setSuccess('Payout created successfully');
      setMemo('');
      setSelectedAccount('');
      setPayouts([]);
      fetchPayoutHistory();
    } catch (err) {
      console.error('Error creating payout:', err);
      setError('Failed to create payout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchPayoutHistory();
  }, [statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1023] text-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Payouts</h1>
          <p className="mt-2 text-lg text-gray-400">Create and manage your payout requests</p>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Create New Payout</h2>
            <p className="mt-1 text-sm text-gray-500">Create a new payout request from your available accounts</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={createPayout} className="space-y-6">
              <div>
                <label htmlFor="account" className="block text-sm font-semibold text-gray-700">
                  Source Account
                </label>
                <select
                  id="account"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                  required
                >
                  <option value="">Select an account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="memo" className="block text-sm font-semibold text-gray-700">
                  Memo (Optional)
                </label>
                <input
                  type="text"
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                  placeholder="Add a note about this payout"
                />
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={addPayout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Payout
                </button>

                {payouts.map((payout, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Payout {index + 1}</h3>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <select
                            onChange={(e) => {
                              const selectedAccount = accounts.find(acc => acc.id === e.target.value);
                              if (selectedAccount) {
                                prefillPayout(index, selectedAccount);
                              }
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-sm"
                            defaultValue=""
                          >
                            <option value="" disabled>Select account to prefill</option>
                            {accounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.name} ({account.id})
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePayout(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <input
                          type="number"
                          value={payout.amount.tokenAmount}
                          onChange={(e) => updatePayout(index, 'amount.tokenAmount', parseFloat(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Token Symbol</label>
                        <input
                          type="text"
                          value={payout.amount.tokenSymbol}
                          onChange={(e) => updatePayout(index, 'amount.tokenSymbol', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Recipient Name</label>
                        <input
                          type="text"
                          value={payout.recipient.name}
                          onChange={(e) => updatePayout(index, 'recipient.name', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Account Type</label>
                        <select
                          value={payout.recipient.accountType}
                          onChange={(e) => updatePayout(index, 'recipient.accountType', e.target.value as 'CHECKING' | 'SAVINGS')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                          required
                        >
                          <option value="CHECKING">Checking</option>
                          <option value="SAVINGS">Savings</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Routing Number</label>
                        <input
                          type="text"
                          value={payout.recipient.routingNumber}
                          onChange={(e) => updatePayout(index, 'recipient.routingNumber', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Account Number</label>
                        <input
                          type="text"
                          value={payout.recipient.accountNumber}
                          onChange={(e) => updatePayout(index, 'recipient.accountNumber', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading || !selectedAccount || payouts.length === 0}
                  className="inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Payout'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Payouts</h2>
                <p className="mt-1 text-sm text-gray-500">View and manage your recent payout requests</p>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {loadingHistory ? (
              <div className="text-center py-8">
                <svg className="animate-spin mx-auto h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : payoutHistory.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No payouts found</h3>
                <p className="mt-2 text-sm text-gray-500">Create your first payout request above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {payoutHistory.map((payout) => (
                  <div key={payout.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Payout Request</h3>
                        <p className="text-sm text-gray-500">ID: {payout.id}</p>
                        {payout.memo && (
                          <p className="text-sm text-gray-600 mt-1">{payout.memo}</p>
                        )}
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Payout Details</h4>
                        <div className="mt-2 space-y-4">
                          {payout.payouts.map((p, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Amount</p>
                                  <p className="text-sm text-gray-900">{p.amount.tokenAmount} {p.amount.tokenSymbol}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Recipient</p>
                                  <p className="text-sm text-gray-900">
                                    {p.recipient.name}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Payout Method</p>
                                <p className="text-sm text-gray-900">
                                  {p.payoutDetails.fiat ? 'ACH' : 'Blockchain'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <div>Created: {formatDate(payout.createdAt)}</div>
                        <div>Updated: {formatDate(payout.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 