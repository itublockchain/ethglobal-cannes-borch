// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract GroupManager {

    struct Card {
        string cardNo;
        string cvv;
        string expireDate;
        uint256 limit;
    }

    struct UserShare {
        address user;
        uint256 amount;
    }

    struct UserDeposit {
        address user;
        uint256 amount;
        uint256 timestamp;
    }

    struct GroupTransaction {
        uint256 transactionId;
        uint256 totalAmount;
        uint256 timestamp;
        string description;
        UserShare[] shares; // Each user's share
        address paidBy; // Person who made the payment (info from bank)
    }

    struct Group {
        address creator;
        address[] members;
        string name;
        bool active;
        Card card;
        GroupTransaction[] transactions; // Group transactions
        UserDeposit[] deposits; // User deposits
        uint256 totalDeposited; // Total deposited amount
        uint256 nextTransactionId; // Next transaction ID

    }

    mapping(uint256 => Group) groups; // public removed, for privacy
    uint256 public groupCount;
    address public roflAddress = 0x5e3aCEe942a432e114F01DCcCD06c904a859eDB1; // ROFL's static address
    address public owner; // Contract owner

    event GroupCreated(uint256 groupId, address creator, address[] members);
    event TransactionCreated(uint256 groupId, uint256 transactionId, uint256 amount, string description);
    event TransactionUpdated(uint256 groupId, uint256 transactionId, address updatedBy);
    event DepositMade(uint256 groupId, address user, uint256 amount);
    event LimitUpdated(uint256 groupId, uint256 newLimit);
    event RoflAddressUpdated(address newRoflAddress);

    constructor() {
        owner = msg.sender;
    }

    // Group creation function
    function createGroup(address[] memory _members, string memory _name) public {
        groupCount++;
        groups[groupCount] = Group({
            creator: msg.sender,
            members: _members,
            name: _name,
            active: true,
            card: Card("", "", "", 0), // Default empty card
            transactions: new GroupTransaction[](0), // Empty transaction array
            nextTransactionId: 1, // First transaction ID
            deposits: new UserDeposit[](0), // Empty deposit array
            totalDeposited: 0 // Initially zero
        });
        emit GroupCreated(groupCount, msg.sender, _members);
    }

    // Update card info (only by ROFL)
    function updateCardInfo(uint256 _groupId, Card memory _card) public {
        require(groups[_groupId].active, "Group is not active");
        require(msg.sender == roflAddress, "Only ROFL can update card information");
        groups[_groupId].card = _card;
    }

    // Manual card limit update (only by ROFL)
    function updateCardLimit(uint256 _groupId, uint256 _limit) public {
        require(groups[_groupId].active, "Group is not active");
        require(msg.sender == roflAddress, "Only ROFL can update card limit");
        groups[_groupId].card.limit = _limit;
        emit LimitUpdated(_groupId, _limit);
    }

    function getMyGroups(address _caller) public view returns (Group[] memory) {
        // First, count how many groups the caller is part of to size the array
        uint256 count = 0;
        for (uint256 i = 1; i <= groupCount; i++) {
            if (groups[i].active && (groups[i].creator == _caller || isMember(i, _caller))) {
                count++;
            }
        }

        // Create an array to store the groups
        Group[] memory myGroups = new Group[](count);
        uint256 index = 0;

        // Populate the array with matching groups
        for (uint256 i = 1; i <= groupCount; i++) {
            if (groups[i].active && (groups[i].creator == _caller || isMember(i, _caller))) {
                myGroups[index] = groups[i];
                index++;
            }
        }

        return myGroups;
    }

    // Called by ROFL - when payment info comes from bank
    function createTransaction(uint256 _groupId, uint256 _amount, string memory _description, address _paidBy) public {
        require(groups[_groupId].active, "Group is not active");
        require(msg.sender == roflAddress, "Only ROFL can create transactions");
        
        uint256 transactionId = groups[_groupId].nextTransactionId;
        groups[_groupId].nextTransactionId++;
        
        GroupTransaction memory newTransaction = GroupTransaction({
            transactionId: transactionId,
            totalAmount: _amount,
            timestamp: block.timestamp,
            description: _description,
            shares: new UserShare[](0), // Initially empty shares
            paidBy: _paidBy
        });
        
        groups[_groupId].transactions.push(newTransaction);
        emit TransactionCreated(_groupId, transactionId, _amount, _description);
    }

    // Group members update shares
    function updateTransactionShares(uint256 _groupId, uint256 _transactionId, UserShare[] memory _shares) public {
        require(groups[_groupId].active, "Group is not active");
        require(groups[_groupId].creator == msg.sender || isMember(_groupId, msg.sender), "Not a group member");
        
        // Find transaction
        for (uint256 i = 0; i < groups[_groupId].transactions.length; i++) {
            if (groups[_groupId].transactions[i].transactionId == _transactionId) {
                // Update shares
                delete groups[_groupId].transactions[i].shares;
                for (uint256 j = 0; j < _shares.length; j++) {
                    groups[_groupId].transactions[i].shares.push(_shares[j]);
                }
                
                emit TransactionUpdated(_groupId, _transactionId, msg.sender);
                return;
            }
        }
        revert("Transaction not found");
    }



    // Called by Backend/ROFL - when deposit comes from other network
    function recordDeposit(uint256 _groupId, address _user, uint256 _amount) public {
        require(groups[_groupId].active, "Group is not active");
        require(msg.sender == roflAddress, "Only ROFL can record deposits");
        require(_amount > 0, "Amount must be greater than 0");
        
        // Record deposit
        UserDeposit memory newDeposit = UserDeposit({
            user: _user,
            amount: _amount,
            timestamp: block.timestamp
        });
        
        groups[_groupId].deposits.push(newDeposit);
        groups[_groupId].totalDeposited += _amount;
        
        // Update card limit
        groups[_groupId].card.limit = groups[_groupId].totalDeposited;
        
        emit DepositMade(_groupId, _user, _amount);
        emit LimitUpdated(_groupId, groups[_groupId].totalDeposited);
    }

    // Get group deposits
    function getGroupDeposits(uint256 _groupId, address _caller) public view returns (UserDeposit[] memory) {
        require(groups[_groupId].active, "Group is not active");
        require(groups[_groupId].creator == _caller || isMember(_groupId, _caller), "Not a group member");
        
        return groups[_groupId].deposits;
    }

    // Get group transactions
    function getGroupTransactions(uint256 _groupId, address _caller) public view returns (GroupTransaction[] memory) {
        require(groups[_groupId].active, "Group is not active");
        require(groups[_groupId].creator == _caller || isMember(_groupId, _caller), "Not a group member");
        
        return groups[_groupId].transactions;
    }

    // Calculate user balances (deposit - spending)
    function calculateUserBalances(uint256 _groupId, address _caller) public view returns (address[] memory users, int256[] memory balances) {
        require(groups[_groupId].active, "Group is not active");
        require(groups[_groupId].creator == _caller || isMember(_groupId, _caller), "Not a group member");
        
        // Collect all users (creator + members)
        address[] memory allUsers = new address[](groups[_groupId].members.length + 1);
        allUsers[0] = groups[_groupId].creator;
        for (uint256 i = 0; i < groups[_groupId].members.length; i++) {
            allUsers[i + 1] = groups[_groupId].members[i];
        }
        
        int256[] memory userBalances = new int256[](allUsers.length);
        
        // Calculate balance for each user
        for (uint256 i = 0; i < allUsers.length; i++) {
            address user = allUsers[i];
            uint256 totalDeposited = 0;
            uint256 totalSpent = 0;
            
            // Calculate deposits
            for (uint256 j = 0; j < groups[_groupId].deposits.length; j++) {
                if (groups[_groupId].deposits[j].user == user) {
                    totalDeposited += groups[_groupId].deposits[j].amount;
                }
            }
            
            // Calculate expenses
            for (uint256 j = 0; j < groups[_groupId].transactions.length; j++) {
                GroupTransaction memory transaction = groups[_groupId].transactions[j];
                for (uint256 k = 0; k < transaction.shares.length; k++) {
                    if (transaction.shares[k].user == user) {
                        totalSpent += transaction.shares[k].amount;
                    }
                }
            }
            
            // Net balance = deposit - spending
            userBalances[i] = int256(totalDeposited) - int256(totalSpent);
        }
        
        return (allUsers, userBalances);
    }

    // Helper function to check if an address is a member of a group
    function isMember(uint256 _groupId, address _caller) private view returns (bool) {
        for (uint256 j = 0; j < groups[_groupId].members.length; j++) {
            if (groups[_groupId].members[j] == _caller) {
                return true;
            }
        }
        return false;
    }

    // Update ROFL address (only by owner)
    function updateRoflAddress(address _newRoflAddress) public {
        require(msg.sender == owner, "Only owner can update ROFL address");
        require(_newRoflAddress != address(0), "Invalid address");
        roflAddress = _newRoflAddress;
        emit RoflAddressUpdated(_newRoflAddress);
    }

}