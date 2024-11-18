import React, { useState } from 'react';
import { UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  onClose: (user1: number, user2: number) => Promise<void>;
  isProcessing: boolean;
}

export function AccountClosure({ onClose, isProcessing }: Props) {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.loading('Closing account...', { id: 'close' });
      await onClose(Number(user1), Number(user2));
      toast.success('Account closed successfully!', { id: 'close' });
      setUser1('');
      setUser2('');
    } catch (error: any) {
      console.error('Account closure failed:', error);
      toast.error(error.message || 'Account closure failed', { id: 'close' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <UserMinus className="w-5 h-5" />
        Close Account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">User 1 ID</label>
          <input
            type="number"
            value={user1}
            onChange={(e) => setUser1(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
            disabled={isProcessing}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">User 2 ID</label>
          <input
            type="number"
            value={user2}
            onChange={(e) => setUser2(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
            disabled={isProcessing}
          />
        </div>
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Close Account'
          )}
        </button>
      </form>
    </div>
  );
}