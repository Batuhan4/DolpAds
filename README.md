# DolpAds: The Web3 AdSense on Sui

> **On-chain transparency. Off-chain speed.**

DolpAds is a decentralized, privacy-focused ad network built on the **Sui Network**. We solve the fundamental trade-off in Web3 advertising by utilizing a **Hybrid Architecture**: strictly on-chain for payments and escrow (trust), but off-chain for ad serving (speed).

## 📖 Project Overview

Current Web3 advertising faces a dilemma: Fully on-chain solutions are too slow (<200ms is required for ads) and expensive due to gas fees, while off-chain solutions lack transparency.

**DolpAds** bridges this gap. It serves as a "Set-it-and-Forget-it" protocol where publishers can monetize their dApps with a single line of code, and advertisers get verifiable, trustless proof of performance.

### Core Value Proposition
* **For Publishers:** Monetize in minutes. Paste one line of code and claim SUI earnings directly to your wallet.
* **For Advertisers:** Transparent campaigns. Funds are locked in a smart contract escrow, ensuring you only pay for verified impressions/clicks.
* **Performance:** Ad serving matches Web2 speeds (<200ms) with 99.0% uptime.

---

## 🏗 Architecture

We utilize a **Hybrid Architecture** to ensure high performance without sacrificing decentralization:

1.  **Smart Contracts (Sui Move):** Acts as the "Source of Truth" for money. It handles the Escrow Module and processes cryptographically signed payout transactions.
2.  **Backend (Node.js/Next.js API):** The "Engine for Speed." Includes an Ad Server that selects ads in under 200ms and an Indexer that listens to the Sui blockchain for deposits.
3.  **Storage (Walrus/IPFS):** Content-addressed storage for ad creatives to ensure decentralization.
4.  **Oracle:** Securely signs payout authorizations, allowing the smart contract to verify off-chain ad views.

---

## 🚀 Features

### Phase 1: The "Web3 AdSense" MVP (Current)
* **Universal Script:** A Google Ads-style integration.
    ```html
    <script src="[https://cdn.dolpads.com/loader.js](https://cdn.dolpads.com/loader.js)" data-publisher-id="0x123..."></script>
    ```
    *Logic:* The script hits our high-speed backend to fetch the ad, keeping the site fast, while the impression is recorded for on-chain settlement.

* **On-Chain Escrow:** Advertisers trigger a wallet transaction to deposit SUI/USDC into the `DolpAds_Escrow` contract. Funds are verifiably locked.

* **Verifiable Payouts:** Publishers check their dashboard and claim earnings. The backend generates a signature, and the Smart Contract releases the funds.

### Phase 2: On-Chain Referral System (Roadmap)
* **Attribution:** Tracking off-platform actions. Influencers generate unique links (`dolp.ads/ref/xyz`), and the Indexer watches the chain for conversion events (like a Swap) to credit the influencer automatically.

### Phase 3: Actionable Ads (Roadmap)
* **Embedded Functionality:** Turning ads into functional dApp widgets (e.g., swapping tokens or minting NFTs directly inside the banner).

---

## 🛠 Tech Stack

* **Network:** Sui Blockchain (Mainnet/Testnet)
* **Smart Contracts:** Sui Move
* **Frontend:** React / Next.js
* **Backend:** Node.js / Next.js API
* **Storage:** Walrus / IPFS
* **Indexing:** Custom Sui Indexer

---

## 📦 Installation & Setup

### Prerequisites
* Node.js >= 18
* Sui CLI installed
* Suiet or Martian Wallet extension

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/dolpads.git](https://github.com/your-username/dolpads.git)
cd dolpads
````

### 2. Smart Contract Deployment

Navigate to the `move` directory and publish the package.

```bash
cd contracts
sui client publish --gas-budget 100000000
```

*Note: Update the `Move.toml` with your package ID.*

### 3. Backend Setup

```bash
cd backend
npm install
# Set up .env with SUI_RPC_URL and CONTRACT_ADDRESS
npm run dev
```

### 4. Frontend Client

```bash
cd frontend
npm install
npm run dev
```

-----

## 🧪 How It Works (User Flow)

1.  **Advertiser** connects wallet and sets a budget (e.g., 500 SUI).
2.  **Advertiser** signs a transaction to lock funds in the `Escrow` smart contract.
3.  **Indexer** detects the event and activates the campaign in the Ad Server.
4.  **Publisher** registers and adds the `<script>` tag to their site.
5.  **User** visits the site; Ad loads in <200ms via the Backend.
6.  **Publisher** clicks "Claim" on the dashboard. The Smart Contract verifies the backend signature and sends SUI instantly.

-----

## 📄 License

This project is licensed under the MIT License.

```