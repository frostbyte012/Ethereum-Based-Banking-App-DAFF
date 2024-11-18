import React from 'react';
import { Wallet, AlertCircle } from 'lucide-react';

interface Props {
  onConnect: () => Promise<void>;
  isLoading: boolean;
}

export function WalletConnection({ onConnect, isLoading }: Props) {
  const isMetaMaskInstalled = typeof window !== 'undefined' && Boolean(window.ethereum);

  const handleConnect = () => {
    if (!isMetaMaskInstalled) {
      window.open('https://metamask.io/download/', '_blank');
    } else {
      onConnect();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {!isMetaMaskInstalled ? (
          <>
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-2xl font-bold mb-4">MetaMask Required</h1>
            <p className="text-gray-600 mb-6">
              To use the Joint Account DApp, you need to install MetaMask, a crypto wallet & gateway to blockchain apps.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleConnect}
                className="w-full bg-yellow-500 text-white py-3 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Install MetaMask
              </button>
              <div className="text-sm text-gray-500">
                <p className="mb-2">What is MetaMask?</p>
                <ul className="text-left space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    A secure wallet for Web3
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    Required to interact with Ethereum
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    Used by over 30 million users
                  </li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <Wallet className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-6">
              Please connect your MetaMask wallet to use the Joint Account DApp
            </p>
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                'Connect MetaMask'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}