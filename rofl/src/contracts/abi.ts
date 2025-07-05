// GroupManager contract ABI
export const GROUP_MANAGER_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "members",
        "type": "address[]"
      }
    ],
    "name": "GroupCreated",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "address[]", "name": "_members", "type": "address[]"},
      {"internalType": "string", "name": "_name", "type": "string"}
    ],
    "name": "createGroup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "groupCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_groupId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "cardNo",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "cvv",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "expireDate",
            "type": "string"
          }
        ],
        "internalType": "struct GroupManager.Card",
        "name": "_card",
        "type": "tuple"
      }
    ],
    "name": "updateCardInfo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]; 