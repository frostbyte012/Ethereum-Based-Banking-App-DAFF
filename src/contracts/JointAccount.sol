// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract JointAccount {
    struct User {
        string name;
        bool exists;
        uint256[] connections;
    }
    
    struct Account {
        uint256 user1;
        uint256 user2;
        uint256 balance1;
        uint256 balance2;
        bool exists;
    }
    
    mapping(uint256 => User) public users;
    mapping(bytes32 => Account) public accounts;
    uint256 public userCount;
    
    event UserRegistered(uint256 userId, string name);
    event AccountCreated(uint256 user1, uint256 user2, uint256 initialBalance);
    event AmountSent(uint256 from, uint256 to, uint256 amount);
    event AccountClosed(uint256 user1, uint256 user2);
    
    function registerUser(uint256 userId, string memory userName) public {
        require(!users[userId].exists, "User already exists");
        
        users[userId].name = userName;
        users[userId].exists = true;
        userCount++;
        
        emit UserRegistered(userId, userName);
    }
    
    function createAccount(uint256 user1, uint256 user2) public payable {
        require(users[user1].exists && users[user2].exists, "Users must exist");
        require(user1 != user2, "Cannot create account with self");
        
        bytes32 accountId = getAccountId(user1, user2);
        require(!accounts[accountId].exists, "Account already exists");
        
        uint256 initialBalance = msg.value;
        uint256 halfBalance = initialBalance / 2;
        
        Account memory newAccount = Account({
            user1: user1,
            user2: user2,
            balance1: halfBalance,
            balance2: halfBalance,
            exists: true
        });
        
        accounts[accountId] = newAccount;
        users[user1].connections.push(user2);
        users[user2].connections.push(user1);
        
        emit AccountCreated(user1, user2, initialBalance);
    }
    
    function findPath(uint256 from, uint256 to) internal view returns (uint256[] memory) {
        require(users[from].exists && users[to].exists, "Users must exist");
        
        mapping(uint256 => bool) storage visited;
        uint256[] memory path;
        uint256[] memory queue;
        mapping(uint256 => uint256) storage parent;
        
        queue.push(from);
        visited[from] = true;
        
        while (queue.length > 0) {
            uint256 current = queue[0];
            // Remove first element
            for (uint i = 0; i < queue.length - 1; i++) {
                queue[i] = queue[i + 1];
            }
            queue.pop();
            
            if (current == to) {
                // Reconstruct path
                uint256[] memory finalPath;
                uint256 pathLength = 0;
                uint256 temp = to;
                
                while (temp != from) {
                    pathLength++;
                    temp = parent[temp];
                }
                
                finalPath = new uint256[](pathLength + 1);
                temp = to;
                for (uint i = pathLength; i > 0; i--) {
                    finalPath[i] = temp;
                    temp = parent[temp];
                }
                finalPath[0] = from;
                
                return finalPath;
            }
            
            for (uint i = 0; i < users[current].connections.length; i++) {
                uint256 neighbor = users[current].connections[i];
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    parent[neighbor] = current;
                    queue.push(neighbor);
                }
            }
        }
        
        revert("No path found");
    }
    
    function sendAmount(uint256 from, uint256 to, uint256 amount) public {
        uint256[] memory path = findPath(from, to);
        require(path.length >= 2, "Invalid path");
        
        // Check if sufficient balance exists along the path
        for (uint i = 0; i < path.length - 1; i++) {
            bytes32 accountId = getAccountId(path[i], path[i + 1]);
            Account storage account = accounts[accountId];
            
            if (path[i] == account.user1) {
                require(account.balance1 >= amount, "Insufficient balance");
            } else {
                require(account.balance2 >= amount, "Insufficient balance");
            }
        }
        
        // Transfer amount along the path
        for (uint i = 0; i < path.length - 1; i++) {
            bytes32 accountId = getAccountId(path[i], path[i + 1]);
            Account storage account = accounts[accountId];
            
            if (path[i] == account.user1) {
                account.balance1 -= amount;
                account.balance2 += amount;
            } else {
                account.balance2 -= amount;
                account.balance1 += amount;
            }
        }
        
        emit AmountSent(from, to, amount);
    }
    
    function closeAccount(uint256 user1, uint256 user2) public {
        bytes32 accountId = getAccountId(user1, user2);
        require(accounts[accountId].exists, "Account does not exist");
        
        Account storage account = accounts[accountId];
        require(account.balance1 == 0 && account.balance2 == 0, "Account must be empty");
        
        // Remove connections
        removeConnection(user1, user2);
        removeConnection(user2, user1);
        
        delete accounts[accountId];
        
        emit AccountClosed(user1, user2);
    }
    
    function removeConnection(uint256 from, uint256 to) internal {
        uint256[] storage connections = users[from].connections;
        for (uint i = 0; i < connections.length; i++) {
            if (connections[i] == to) {
                connections[i] = connections[connections.length - 1];
                connections.pop();
                break;
            }
        }
    }
    
    function getAccountId(uint256 user1, uint256 user2) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            user1 < user2 ? user1 : user2,
            user1 < user2 ? user2 : user1
        ));
    }
    
    function getAccountBalance(uint256 user1, uint256 user2) public view returns (uint256, uint256) {
        bytes32 accountId = getAccountId(user1, user2);
        require(accounts[accountId].exists, "Account does not exist");
        
        Account storage account = accounts[accountId];
        return (account.balance1, account.balance2);
    }
}