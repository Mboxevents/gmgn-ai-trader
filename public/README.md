# GMGN AI Trader Dashboard

Trading bot dashboard untuk Solana dengan integrasi GMGN API dan Phantom Wallet.

## Fitur

- 🔍 Scan trending token Solana (1000 token per siklus)
- 🛡️ Filter keamanan (rug ratio, top10 holder, honeypot, tax)
- 📈 Filter momentum (price change, volume, buy ratio, hot level)
- 📊 Dashboard real-time dengan Socket.io
- 🟢 Login Phantom Wallet (real-time balance)
- 🔄 Auto Buy/Sell otomatis (simulasi jika saldo 0)
- ⚡ One-click trade dari dashboard
- 📋 Live decision log
- 🎯 Gate funnel visual (Scan → Safety → Consensus → Pending)

## Teknologi

- Node.js + Express
- Socket.io (real-time)
- @solana/web3.js
- Phantom Wallet
- GMGN API (gmgn-cli)

## Instalasi

```bash
git clone https://github.com/[username]/gmgn-ai-trader.git
cd gmgn-ai-trader
npm install
cp .env.example .env
# Isi .env dengan API Key dan Private Key
npm start
