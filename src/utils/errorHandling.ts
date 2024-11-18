import { ethers } from 'ethers';

export function handleError(error: any): string {
  // Handle ethers-specific errors
  if (error instanceof ethers.ContractTransactionResponse) {
    return 'Transaction failed. Please check your inputs and try again.';
  }

  // Handle user rejected transaction
  if (error.code === 4001) {
    return 'Transaction rejected by user';
  }

  // Handle insufficient funds
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for transaction';
  }

  // Handle network/connection errors
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your connection';
  }

  // Handle contract-specific errors
  if (error.message.includes('user rejected transaction')) {
    return 'Transaction rejected by user';
  }

  if (error.message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }

  // Extract revert reason if available
  if (error.data) {
    try {
      const reason = error.data.message || JSON.parse(error.data).message;
      return reason || 'Transaction failed';
    } catch {
      // If parsing fails, continue to default error handling
    }
  }

  // Default error message
  return error.message || 'An unexpected error occurred';
}