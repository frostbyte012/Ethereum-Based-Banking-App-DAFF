from web3 import Web3
import json
import random
import numpy as np
import matplotlib.pyplot as plt
from networkx import powerlaw_sequence

# Connect to local Ethereum node
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

# Load contract ABI and bytecode
with open('../build/contracts/JointAccount.json') as f:
    contract_json = json.load(f)
    contract_abi = contract_json['abi']
    contract_bytecode = contract_json['bytecode']

def deploy_contract():
    # Deploy contract
    contract = w3.eth.contract(abi=contract_abi, bytecode=contract_bytecode)
    tx_hash = contract.constructor().transact()
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return w3.eth.contract(address=tx_receipt.contractAddress, abi=contract_abi)

def create_power_law_network(contract, num_users=100, alpha=2.5):
    # Register users
    for i in range(num_users):
        contract.functions.registerUser(i, f"User{i}").transact()
    
    # Generate power-law degrees
    degrees = powerlaw_sequence(num_users, alpha)
    degrees = [max(1, int(d)) for d in degrees]
    
    # Create edges based on degrees
    edges = []
    for i in range(num_users):
        remaining_connections = degrees[i]
        while remaining_connections > 0:
            j = random.randint(0, num_users-1)
            if i != j and (i,j) not in edges and (j,i) not in edges:
                edges.append((i,j))
                remaining_connections -= 1
    
    # Create accounts with exponential balances
    for edge in edges:
        balance = np.random.exponential(10)  # mean = 10
        contract.functions.createAccount(edge[0], edge[1]).transact({'value': int(balance * 1e18)})

def test_transactions(contract, num_transactions=1000):
    success_ratios = []
    successful = 0
    
    for i in range(num_transactions):
        # Random user pair
        user1 = random.randint(0, 99)
        user2 = random.randint(0, 99)
        while user2 == user1:
            user2 = random.randint(0, 99)
            
        try:
            # Send 1 coin
            contract.functions.sendAmount(user1, user2, int(1e18)).transact()
            successful += 1
        except:
            pass
            
        if (i + 1) % 100 == 0:
            ratio = successful / (i + 1)
            success_ratios.append(ratio)
            print(f"Success ratio after {i+1} transactions: {ratio}")
    
    # Plot results
    plt.plot(range(100, 1001, 100), success_ratios)
    plt.xlabel('Number of Transactions')
    plt.ylabel('Success Ratio')
    plt.title('Transaction Success Ratio over Time')
    plt.savefig('success_ratio.png')
    plt.close()

def main():
    contract = deploy_contract()
    create_power_law_network(contract)
    test_transactions(contract)

if __name__ == "__main__":
    main()