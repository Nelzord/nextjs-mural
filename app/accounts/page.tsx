'use client';

import { useState, useEffect } from 'react';
import { MuralPayAccount } from '@/app/config/mural-pay';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<MuralPayAccount[]>([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/mural-pay/accounts');
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch accounts');
      setAccounts([]);
    }
  };

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mural-pay/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAccountName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      setNewAccountName('');
      fetchAccounts();
    } catch (err) {
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const renderAccountDetails = (account: MuralPayAccount) => {
    if (!account.accountDetails) {
      return (
        <div className="mt-4">
          <p className="text-sm text-gray-500">Account details are being processed...</p>
        </div>
      );
    }

    return (
      <div className="mt-6 space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Wallet Details</h4>
          <p className="text-sm text-gray-600">
            Address: {account.accountDetails.walletDetails.walletAddress}
          </p>
          <p className="text-sm text-gray-600">
            Blockchain: {account.accountDetails.walletDetails.blockchain}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Balances</h4>
          {account.accountDetails.balances.map((balance, index) => (
            <p key={index} className="text-sm text-gray-600">
              {balance.tokenAmount} {balance.tokenSymbol}
            </p>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Bank Details</h4>
          <p className="text-sm text-gray-600">
            Bank: {account.accountDetails.depositAccount.bankName}
          </p>
          <p className="text-sm text-gray-600">
            Account: {account.accountDetails.depositAccount.bankAccountNumber}
          </p>
          <p className="text-sm text-gray-600">
            Payment Rails: {account.accountDetails.depositAccount.paymentRails.join(', ')}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0c1023] text-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Accounts</h1>
          <p className="mt-2 text-lg text-gray-400">Manage your Mural Pay accounts</p>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Create New Account</h2>
            <p className="mt-1 text-sm text-gray-500">Create a new account to start managing your payouts</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={createAccount} className="space-y-6">
              <div>
                <label htmlFor="accountName" className="block text-sm font-semibold text-gray-700">
                  Account Name
                </label>
                <input
                  type="text"
                  id="accountName"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                  required
                />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
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
                    'Create Account'
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

        <div className="bg-white rounded-xl shadow-md">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Your Accounts</h2>
            <p className="mt-1 text-sm text-gray-500">View and manage your Mural Pay accounts</p>
          </div>
          
          <div className="p-8">
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No accounts yet</h3>
                <p className="mt-2 text-sm text-gray-500">Create your first account above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {accounts.map((account) => (
                  <div key={account.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                        <p className="text-sm text-gray-500">ID: {account.id}</p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          account.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {account.status}
                        </span>
                      </div>
                    </div>
                    
                    {renderAccountDetails(account)}
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