# Ethereum Joint Account DApp

This project implements a decentralized application (DApp) for managing joint accounts between users on the Ethereum network. Users can create joint accounts with others, transfer amounts through the network using existing paths, and close accounts when needed.

## Features

- User registration
- Joint account creation
- Amount transfer through network paths
- Account closure
- Power-law network topology
- Exponential balance distribution

## Prerequisites

- Local Ethereum node (e.g., Ganache)
- Python 3.7+
- Web3.py
- NetworkX
- Matplotlib
- Numpy
- Truffle

## Setup

1. Install dependencies:
   ```bash
   pip install web3 networkx matplotlib numpy
   npm install -g truffle
   ```

2. Start your local Ethereum node (e.g., Ganache)

3. Compile and deploy the contract:
   ```bash
   truffle compile
   truffle migrate
   ```

4. Run the test script:
   ```bash
   python src/scripts/deploy_and_test.py
   ```

## Contract Functions

### registerUser(userId, userName)
Registers a new user with the given ID and name.

### createAccount(user1, user2)
Creates a joint account between two users with initial balance distributed equally.

### sendAmount(from, to, amount)
Transfers amount from one user to another using the shortest available path.

### closeAccount(user1, user2)
Closes the joint account between two users if the balance is zero.

## Testing

The test script performs the following:
1. Deploys the contract
2. Creates a network of 100 users with power-law degree distribution
3. Sets up joint accounts with exponentially distributed balances
4. Executes 1000 random transactions
5. Plots the success ratio over time

## Results

The success ratio plot is saved as 'success_ratio.png' showing the transaction success rate over time.