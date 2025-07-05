# ROFL - Sapphire Test Network Event Listener

This project is an application that listens for GroupCreated events on the Sapphire Test Network and automatically updates card information.

## 📁 Project Structure

```
src/
├── config/
│   └── index.ts          # Configuration settings
├── contracts/
│   └── abi.ts            # Smart contract ABI definitions
├── services/
│   └── GroupEventListener.ts  # Main event listener service
├── types/
│   └── index.ts          # TypeScript type definitions
├── utils/
│   └── cardGenerator.ts  # Card information generation functions
├── main.ts              # Main application entry point
└── index.ts             # Module export point
```

## 🚀 Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit the .env file and add your PRIVATE_KEY
```

3. Start the application:
```bash
npm start
```

## 🔧 Configuration

### Environment Variables
- `PRIVATE_KEY`: Wallet private key to be used on Sapphire Test Network

### Application Settings
You can change the following settings from the `src/config/index.ts` file:

- `POLL_INTERVAL_MS`: Event polling interval (ms)
- `MAX_RECONNECT_ATTEMPTS`: Maximum reconnection attempts
- `RECONNECT_DELAY`: Reconnection delay time (ms)
- `MAX_BLOCK_RANGE`: Maximum number of blocks to query at once
- `MAX_PROCESSED_TX_HASHES`: Maximum number of transaction hashes to keep in memory

## 📋 Features

- ✅ Sapphire Test Network GroupCreated event listening
- ✅ Automatic random card information generation
- ✅ Card information updates to smart contract
- ✅ Automatic reconnection mechanism
- ✅ Graceful shutdown support
- ✅ TypeScript support
- ✅ Modular architecture

## 🏗️ Architecture

### Modules

1. **Config**: All configuration variables
2. **Contracts**: Smart contract ABI definitions
3. **Services**: Main business logic (GroupEventListener)
4. **Types**: TypeScript interface definitions
5. **Utils**: Helper functions (card generation)
6. **Main**: Application startup and signal handling

### Event Listener Flow

1. Events are pulled from the blockchain using polling
2. New GroupCreated events are detected
3. Random card information is generated
4. Card information is sent to the smart contract
5. Transaction results are logged

## 🛠️ Development

### Adding New Modules

1. Create a new folder under `src/`
2. Add export to `src/index.ts` file
3. Add necessary imports to other modules

### Testing

```bash
npm run test
```

### Build

```bash
npm run build
```

## 📊 Logs

While the application is running, you can see the following logs:

- 🚀 Application startup
- 🔗 Network connection status
- 💰 Wallet balance
- 🎉 New group creation event
- 💳 Card information update
- ⛽ Gas usage
- ✅ Successful operations
- ❌ Error conditions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

## 📄 License

This project is licensed under the [MIT License](LICENSE). 