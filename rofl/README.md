# Borch ROFL Multi-Network Event Listener

Multi-network parallel event listener system. Simultaneously monitors GroupManager contract events on Sapphire Test Network and DepositContract events on other networks.

## 📁 Project Structure

```
src/
├── config/
│   └── index.ts                    # Multi-network configuration
├── contracts/
│   └── abi.ts                      # Contract ABI definitions
├── services/
│   ├── GroupEventListener.ts       # Sapphire event listener
│   ├── DepositEventListener.ts     # Deposit event listener
│   ├── MultiNetworkEventListener.ts # Main multi-network service
│   └── RainAPIService.ts           # Rain.xyz API integration
├── types/
│   └── index.ts                    # TypeScript type definitions
├── utils/
│   └── cardGenerator.ts            # Card information generation
├── main.ts                         # Main application entry point
└── index.ts                        # Module export point
```

## 🌐 Supported Networks

| Network | Contract Type | Contract Address | Event |
|---|---|---|---|
| Sapphire Testnet | GroupManager | 0xf4066Cf51f13d4F0B9FF8009F61D21BbB31d19a6 | GroupCreated |
| Sepolia | DepositContract | 0x8d5168e57ebf3fcde059889f438823c6436a367b | Deposited |
| Base Sepolia | DepositContract | 0x25421ab357d9a52e7fd2108fc130e686cf3fec32 | Deposited |
| Arbitrum Sepolia | DepositContract | 0x6bb29e8191a08a9f25e62d6d6d6d6d6423302ca17324 | Deposited |

## 🚀 Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env file and add your PRIVATE_KEY
```

3. Start the application:
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

```env
PRIVATE_KEY=your_private_key_here
RAIN_AUTH_TOKEN=your_rain_auth_token
RAIN_SESSION_COOKIE=your_rain_session_cookie
RAIN_CSRF_TOKEN=your_rain_csrf_token
RAIN_CARDHOLDER_ID=your_cardholder_id
RAIN_CARDHOLDER_USER_ID=your_cardholder_user_id
RAIN_FIRST_NAME=your_first_name
RAIN_LAST_NAME=your_last_name
```

### Network Configuration

In `src/config/index.ts`:

```typescript
export const NETWORK_CONFIGS = {
  sapphire: {
    name: 'Sapphire Testnet',
    rpc: 'https://testnet.sapphire.oasis.dev',
    chainId: 23295,
    contracts: {
      groupManager: '0xf4066Cf51f13d4F0B9FF8009F61D21BbB31d19a6'
    }
  },
  sepolia: {
    name: 'Sepolia',
    rpc: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
    chainId: 11155111,
    contracts: {
      deposit: '0x8d5168e57ebf3fcde059889f438823c6436a367b'
    }
  },
  // ... other networks
};
```

## 📋 Features

- ✅ **Multi-network support**: Parallel event listening on 4 networks
- ✅ **Sapphire Events**: GroupCreated events and automatic card information
- ✅ **Deposit Events**: USDC deposit events (Sepolia, Base, ARB)
- ✅ **Rain.xyz API Integration**: Automatic card limit updates
- ✅ **Parallel execution**: Separate polling threads for each network
- ✅ **Auto-reconnection**: Automatic recovery from network interruptions
- ✅ **Graceful shutdown**: Safe shutdown process
- ✅ **Detailed logging**: Separate log system for each network
- ✅ **TypeScript**: Full type safety

## 🛠️ Usage

### Development Mode

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Testing

```bash
# All tests
npm run test

# Multi-network test (30 seconds)
npm run test-multi

# Deposit test (test deposits on 3 networks)
npm run test-deposit

# Rain.xyz API integration test
npm run test-rain-api
```

## 🏗️ Architecture

### Services

1. **MultiNetworkEventListener**: Main coordinator service
2. **GroupEventListener**: Sapphire GroupCreated events
3. **DepositEventListener**: Deposit events (all networks)
4. **RainAPIService**: Rain.xyz API integration

### Event Flow

#### Sapphire (GroupCreated)
1. Event is detected
2. Random card information is generated
3. Real card information is fetched from Rain.xyz API
4. Contract is updated
5. Result is logged

#### Deposit Networks (Deposited)
1. USDC deposit event is detected
2. Sender address and amount information is retrieved
3. Group ID is identified
4. Card with nickname equal to group ID is found from Rain.xyz API
5. Deposit amount is added to existing card limit
6. Card limit is updated in Rain.xyz API
7. Detailed log is printed to console
8. Transaction hash is recorded

## 📊 Sample Outputs

### Sapphire GroupCreated Event:
```
🎉 Sapphire Testnet - New Group Created!
==========================================
👥 Group ID: 123
👤 Creator: 0x1234...
📋 Members: 5
📦 Block: 12345
🔗 Transaction: 0xabc...
💳 Updating card information...
✅ Card information updated successfully!
```

### Deposit Event:
```
💰 Sepolia - USDC Deposit Detected!
==============================================
👤 Sender: 0x1234...
💵 Amount: 100.000000 USDC
🏷️ Group ID: 1
📦 Block: 12345
🔗 Transaction: 0xdef...
⏰ Block Time: 2024-01-01 12:00:00
🌐 Network: Sepolia
📍 Contract: 0x8d5168e57ebf3fcde059889f438823c6436a367b
==============================================

🏦 Updating Rain.xyz card limit for deposit...
🔍 Searching for card with nickname: 1...
✅ Found card: 2925064d-fa76-4ed4-b19c-30831c99e3ce with nickname: 1
📊 Current limit: $100 | Deposit: $100 | New limit: $200
💳 Updating card 2925064d-fa76-4ed4-b19c-30831c99e3ce limit to $200...
✅ Card limit updated successfully! New limit: $200 (20000 cents)
✅ Rain.xyz card limit updated successfully for group 1!
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
# Test multi-network event listening
npm run test-multi

# Test deposit event handling
npm run test-deposit

# Test Rain.xyz API integration
npm run test-rain-api
```

## 📝 API Documentation

### GroupEventListener

Monitors GroupCreated events on Sapphire Testnet:

```typescript
class GroupEventListener {
  async start(): Promise<void>
  async stop(): Promise<void>
  private async handleGroupCreated(event: GroupCreatedEvent): Promise<void>
}
```

### DepositEventListener

Monitors Deposited events on multiple networks:

```typescript
class DepositEventListener {
  constructor(networkName: string, config: NetworkConfig)
  async start(): Promise<void>
  async stop(): Promise<void>
  private async handleDeposit(event: DepositEvent): Promise<void>
}
```

### RainAPIService

Integrates with Rain.xyz API for card management:

```typescript
class RainAPIService {
  async updateCardLimit(groupId: string, additionalAmount: number): Promise<boolean>
  async findCardByNickname(nickname: string): Promise<RainCard | null>
  private async updateCardLimitById(cardId: string, newLimitCents: number): Promise<boolean>
}
```

## 🔒 Security

- Private keys are managed through environment variables
- API tokens are securely stored and never logged
- All network communications use HTTPS/WSS
- Sensitive data is not persisted to disk

## 🚨 Error Handling

- Network connection failures are automatically retried
- Invalid events are logged and skipped
- API failures are gracefully handled with detailed error messages
- All errors are logged with full context

## 📚 Dependencies

- `ethers`: Ethereum library for blockchain interactions
- `axios`: HTTP client for API calls
- `dotenv`: Environment variable management
- `typescript`: Type-safe JavaScript
- `@types/node`: Node.js type definitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions and support:
- Create an issue in the repository
- Check the documentation
- Review the logs for detailed error information

## 🙏 Acknowledgments

- Built for Oasis Sapphire confidential smart contracts
- Integrates with Rain.xyz card management platform
- Uses ethers.js for blockchain interactions
- Implements multi-network event monitoring 