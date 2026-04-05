# Cannes26 - Ethereum Wallet

A secure desktop Ethereum wallet application built with Tauri and Next.js.

## Description

Cannes26 is a secure Ethereum wallet application that allows you to manage your crypto assets. It provides comprehensive features for creating, importing, and managing wallets, checking balances, transferring tokens, and performing swaps via Uniswap.

## Features

- **Wallet Creation and Import** : Create new wallets or import existing ones
- **Token Management** : Add and track your ERC20 tokens
- **Transfers** : Send ETH and ERC20 tokens
- **Balance Checking** : Real-time balance updates via RPC
- **Swaps** : Exchange tokens via Uniswap API
- **QR Code** : Generate QR codes for receiving payments
- **Modern Interface** : Intuitive UI with Next.js and Tailwind CSS

## Prerequisites

- Node.js (version 18 or higher)
- Rust (for Tauri)
- Uniswap API Key (free)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cannes26
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root:
   ```
   NEXT_PUBLIC_UNISWAP_API_KEY=your-uniswap-api-key
   ```

4. Run the application in development mode:
   ```bash
   npx tauri dev
   ```

## Usage

### Creating a Wallet
1. Go to the "Login" section
2. Click "Select your wallet" to choose an existing `.plr` file or create a new one
3. Enter your password to decrypt the wallet

### Checking Balances
- In the dashboard, click "Update balances" to refresh balances
- ETH and ERC20 balances are displayed

### Transfers
- Use the Transfer component to send ETH or tokens
- Select the token, enter the recipient and amount

### Swaps
- In the FullSwap section, select input/output tokens
- Get a quote then perform the swap

### Receiving
- Use the Receive component to generate a QR code of your address

## Production Build

```bash
npx tauri build
```

This generates binaries for your platform (Windows, macOS, Linux).

## Project Structure

```
cannes26/
├── app/                    # Next.js Pages (App Router)
│   ├── api/               # API Routes (dev only)
│   ├── components/        # React Components
│   ├── dashboard/         # Main wallet page
│   ├── fullSwap/          # Swap page
│   └── types/             # TypeScript Types
├── src-tauri/             # Tauri Rust Code
│   ├── src/
│   │   ├── commands.rs    # Tauri Commands
│   │   ├── lib.rs
│   │   └── main.rs
│   └── tauri.conf.json    # Tauri Configuration
├── public/                # Static Assets
└── package.json
```

## Technologies Used

- **Frontend** : Next.js 16, React, TypeScript, Tailwind CSS
- **Backend** : Tauri (Rust), Node.js
- **Blockchain** : Viem, Ethers.js
- **APIs** : Uniswap Universal Router API
- **QR Codes** : qrcode.react

## Security

- Wallets are encrypted with a password
- Private keys never leave the application
- Secure RPC usage for blockchain interactions

## Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For any questions or issues, open an issue on GitHub.
