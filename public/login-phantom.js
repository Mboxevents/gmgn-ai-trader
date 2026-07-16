document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const statusText = document.getElementById('status-text');
    const statusIndicator = document.getElementById('status-indicator');
    const walletInfo = document.getElementById('wallet-info');
    const walletAddress = document.getElementById('wallet-address');
    const walletBalance = document.getElementById('wallet-balance');
    const walletUsdc = document.getElementById('wallet-usdc');
    const walletNetwork = document.getElementById('wallet-network');
    const errorDiv = document.getElementById('login-error');

    let wallet = null;
    let connection = null;
    let balanceInterval = null;
    const SOL_MINT = 'So11111111111111111111111111111111111111112';
    const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    const RPC_URL = 'https://api.mainnet-beta.solana.com';

    function setStatus(text, state = 'disconnected') {
        statusText.textContent = text;
        statusIndicator.className = 'status-indicator';
        if (state === 'connected') statusIndicator.classList.add('connected');
        else if (state === 'connecting') statusIndicator.classList.add('connecting');
        else statusIndicator.classList.add('disconnected');
    }

    function showError(msg) {
        errorDiv.textContent = msg;
        setTimeout(() => errorDiv.textContent = '', 5000);
    }

    async function updateBalance() {
        if (!connection || !wallet) return;

        try {
            const balance = await connection.getBalance(wallet.publicKey);
            const solBalance = balance / 1e9;
            walletBalance.textContent = solBalance.toFixed(4);

            // Update ke server
            fetch('/update-balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ balance: solBalance, usdc: 0 })
            }).catch(() => {});

            // USDC - skip for simplicity
            walletUsdc.textContent = '0.00';
        } catch (e) {
            // silent
        }
    }

    async function connectPhantom() {
        if (!window.solana || !window.solana.isPhantom) {
            setStatus('❌ Phantom Wallet tidak terinstall', 'disconnected');
            showError('Install Phantom Wallet di phantom.app');
            window.open('https://phantom.app/', '_blank');
            return;
        }

        try {
            setStatus('⏳ Menghubungkan ke Phantom...', 'connecting');
            connectBtn.disabled = true;

            const response = await window.solana.connect();
            wallet = response;
            connection = new Connection(RPC_URL);

            walletAddress.textContent = wallet.publicKey.toString();
            setStatus('✅ Terhubung', 'connected');
            walletInfo.classList.remove('hidden');
            connectBtn.textContent = '✅ Connected';
            connectBtn.disabled = true;
            disconnectBtn.classList.remove('hidden');

            await updateBalance();

            if (balanceInterval) clearInterval(balanceInterval);
            balanceInterval = setInterval(updateBalance, 10000);

            await fetch('/login-phantom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: wallet.publicKey.toString(),
                    connected: true
                })
            });

            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);

        } catch (err) {
            setStatus('❌ Gagal koneksi: ' + err.message, 'disconnected');
            showError(err.message);
            connectBtn.disabled = false;
            connectBtn.innerHTML = '🔗 Connect Phantom Wallet';
        }
    }

    function disconnectPhantom() {
        if (balanceInterval) {
            clearInterval(balanceInterval);
            balanceInterval = null;
        }

        if (window.solana) {
            window.solana.disconnect().catch(() => {});
        }

        wallet = null;
        connection = null;
        setStatus('🔌 Terputus', 'disconnected');
        walletInfo.classList.add('hidden');
        connectBtn.disabled = false;
        connectBtn.innerHTML = '🔗 Connect Phantom Wallet';
        disconnectBtn.classList.add('hidden');
        walletAddress.textContent = '-';
        walletBalance.textContent = '0.0000';
        walletUsdc.textContent = '0.00';

        fetch('/logout-phantom', { method: 'POST' }).catch(() => {});
    }

    async function autoConnect() {
        try {
            const res = await fetch('/check-phantom-session');
            const data = await res.json();
            if (data.loggedIn && data.address) {
                window.location.href = '/dashboard';
                return;
            }
        } catch (e) {}

        if (window.solana && window.solana.isConnected) {
            try {
                await connectPhantom();
            } catch (e) {}
        }
    }

    connectBtn.addEventListener('click', connectPhantom);
    disconnectBtn.addEventListener('click', disconnectPhantom);

    if (window.solana) {
        window.solana.on('connect', () => {});
        window.solana.on('disconnect', () => {
            disconnectPhantom();
        });
        window.solana.on('accountChanged', async (publicKey) => {
            if (publicKey) {
                await connectPhantom();
            } else {
                disconnectPhantom();
            }
        });
    }

    function loadLibraries() {
        const script1 = document.createElement('script');
        script1.src = 'https://unpkg.com/@solana/web3.js@1.87.0/lib/index.iife.js';
        script1.onload = () => {
            window.solanaWeb3 = window.solanaWeb3 || window.SolanaWeb3;
        };
        document.head.appendChild(script1);
    }
    loadLibraries();

    setTimeout(autoConnect, 500);
});
