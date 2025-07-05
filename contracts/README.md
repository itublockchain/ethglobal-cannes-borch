# GroupManager Smart Contract

A decentralized group management system built on Oasis Sapphire, enabling secure group creation and management with privacy-preserving card information handling.

## Overview

The GroupManager contract allows users to:
- Create groups with multiple members
- Manage group memberships securely
- Store encrypted card information (managed by ROFL)
- Query user's groups with privacy protection

## Features

- **Privacy-First**: Built on Oasis Sapphire for confidential smart contracts
- **Group Management**: Create and manage groups with multiple members
- **Secure Card Storage**: Card information is encrypted and only accessible through authorized ROFL
- **Member Access Control**: Only group members can access their group information
- **Event Logging**: Group creation events for transparency

## Smart Contract Details

### Main Functions

- `createGroup(address[] _members, string _name)`: Create a new group with specified members
- `updateCardInfo(uint256 _groupId, Card _card)`: Update card information (ROFL only)
- `getMyGroups(address _caller)`: Get all groups where the caller is a member or creator

### Data Structures

```solidity
struct Card {
    string cardNo;
    string cvv;
    string expireDate;
}

struct Group {
    address creator;
    address[] members;
    string name;
    bool active;
    Card card;
}
```

## Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- A wallet with Sapphire testnet tokens

## Installation

1. Clone the repository and navigate to the contracts directory:
```bash
cd contracts
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your private key:
```bash
# Create .env file
touch .env
```

4. Add your private key to the `.env` file:
```
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

⚠️ **Never commit your private key to version control**

## Network Configuration

The project is configured for Oasis Sapphire networks:

- **Sapphire Mainnet**: `https://sapphire.oasis.io`
- **Sapphire Testnet**: `https://testnet.sapphire.oasis.io`
- **Sapphire Localnet**: `http://localhost:8545`

## Getting Testnet Tokens

1. Visit the [Sapphire Testnet Faucet](https://faucet.testnet.oasis.io/)
2. Connect your wallet
3. Request testnet tokens
4. Wait for the transaction to complete

## Deployment

### Compile the Contract

```bash
npm run compile
```

### Deploy to Sapphire Testnet

```bash
npm run deploy:testnet
```

Or use Hardhat directly:

```bash
npx hardhat run scripts/deploy.js --network sapphire-testnet
```

### Deploy to Sapphire Mainnet

```bash
npm run deploy:mainnet
```

### Deploy to Local Network

```bash
npm run deploy:local
```

## Usage

After deployment, you can interact with the contract using:

1. **Hardhat Console**:
```bash
npx hardhat console --network sapphire-testnet
```

2. **Frontend Integration**:
```javascript
import { ethers } from 'ethers';

// Connect to Sapphire testnet
const provider = new ethers.JsonRpcProvider('https://testnet.sapphire.oasis.io');
const contract = new ethers.Contract(contractAddress, abi, provider);

// Create a group
const members = ['0x...', '0x...'];
const groupName = 'My Group';
await contract.createGroup(members, groupName);
```

## Available Scripts

- `npm run compile`: Compile smart contracts
- `npm run deploy:testnet`: Deploy to Sapphire testnet
- `npm run deploy:mainnet`: Deploy to Sapphire mainnet
- `npm run deploy:local`: Deploy to local network
- `npm run test`: Run tests

## Security Considerations

1. **Private Key Management**: Never expose your private keys
2. **ROFL Authorization**: Only the authorized ROFL address can update card information
3. **Privacy**: All sensitive data is encrypted on Sapphire
4. **Access Control**: Group information is only accessible to members

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  GroupManager   │    │      ROFL       │
│   Application   │◄───┤  Smart Contract │◄───┤   (Card Data)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │ Oasis Sapphire  │
                       │   (Privacy)     │
                       └─────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions and support:
- Open an issue in the repository
- Check the [Oasis Documentation](https://docs.oasis.io/sapphire/)
- Join the [Oasis Community](https://oasisprotocol.org/community)

## Acknowledgments

- Built on [Oasis Sapphire](https://sapphire.oasis.io/) for privacy-preserving smart contracts
- Uses [Hardhat](https://hardhat.org/) for development and deployment
- Integrates with [ROFL](https://docs.oasis.io/rofl/) for off-chain computation
