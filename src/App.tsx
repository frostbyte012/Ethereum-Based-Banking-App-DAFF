import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { UserRegistration } from './components/UserRegistration';
import { AccountCreation } from './components/AccountCreation';
import { TransferAmount } from './components/TransferAmount';
import { AccountClosure } from './components/AccountClosure';
import { WalletConnection } from './components/WalletConnection';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { handleError } from './utils/errorHandling';

const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"user1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"user2","type":"uint256"}],"name":"AccountClosed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"user1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"user2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"initialBalance","type":"uint256"}],"name":"AccountCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"from","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"to","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"AmountSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"userId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"}],"name":"UserRegistered","type":"event"}];

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAccount(account);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      if (!ethers.isAddress(contractAddress)) {
        throw new Error('Invalid contract address configuration');
      }

      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);
      
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount('');
          setContract(null);
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      toast.success('Wallet connected successfully!');
    } catch (err: any) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      setContract(null);
      setAccount('');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (err) {
          console.error('Failed to initialize wallet connection:', err);
        }
      }
      setLoading(false);
    };

    init();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const handleTransaction = async (
    operation: () => Promise<ethers.ContractTransactionResponse>,
    successMessage: string,
    errorPrefix: string
  ) => {
    if (!contract) {
      toast.error('Wallet not connected');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Processing transaction...');

    try {
      const tx = await operation();
      await tx.wait();
      toast.success(successMessage, { id: toastId });
      return true;
    } catch (err: any) {
      const errorMessage = handleError(err);
      toast.error(`${errorPrefix}: ${errorMessage}`, { id: toastId });
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!account) {
    return (
      <>
        <Toaster position="top-right" />
        <WalletConnection onConnect={connectWallet} isLoading={loading} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Joint Account DApp</h1>
          <p className="text-gray-600">Connected: {account}</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserRegistration 
            onRegister={async (userId, userName) => {
              await handleTransaction(
                () => contract!.registerUser(userId, userName),
                'User registered successfully!',
                'Registration failed'
              );
            }}
            isProcessing={isProcessing}
          />
          
          <AccountCreation 
            onCreate={async (user1, user2, balance) => {
              await handleTransaction(
                () => contract!.createAccount(user1, user2, {
                  value: ethers.parseEther(balance)
                }),
                'Account created successfully!',
                'Account creation failed'
              );
            }}
            isProcessing={isProcessing}
          />
          
          <TransferAmount 
            onTransfer={async (from, to, amount) => {
              await handleTransaction(
                () => contract!.sendAmount(from, to, ethers.parseEther(amount)),
                'Transfer completed successfully!',
                'Transfer failed'
              );
            }}
            isProcessing={isProcessing}
          />
          
          <AccountClosure 
            onClose={async (user1, user2) => {
              await handleTransaction(
                () => contract!.closeAccount(user1, user2),
                'Account closed successfully!',
                'Account closure failed'
              );
            }}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}

export default App;