# BaseIndexer – ERC-20 Token Transfer Indexer

**BaseIndexer** BaseIndexer is an advanced backend service that listens to the Ethereum blockchain and indexes ERC-20 token transfer events into a PostgreSQL database. What sets BaseIndexer apart is its built-in **AI capability** that allows users to control indexing behavior using simple natural language commands—no technical knowledge or query writing required.


## 🚀 Features

- Indexes real-time ERC-20 Transfer events from the Ethereum blockchain

- Stores from, to, and value fields into a PostgreSQL database

- Supports natural language queries via AI for flexible indexing

- Users can issue commands like:

    - Index transfers for this address

    - Only index the from and value fields
    - Index this particular address from block 2000000

No need to write raw queries or modify code to change indexing target

## 📁 Folder Structure
```
backend/
├── env.sample               # Sample environment variables
├── node_modules/            # Installed dependencies
├── package.json             # Project metadata and scripts
├── package-lock.json        # Locked dependency versions
├── tsconfig.json            # TypeScript configuration
├── src/                     # Source code
│   ├── config/              # DB and blockchain config (e.g., Sequelize, provider)
│   ├── models/              # Sequelize models (e.g., Transfer.ts)
│   ├── migrations/          # Sequelize migration files
│   ├── services/            # Logic for indexing, saving to DB
│   ├── utils/               # Helper functions
│   └── index.ts             # App entry point

```


---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/dimka90/indexer.git
cd backend
```

2. Configure Environment Variables
Copy the sample .env and configure it:
```
cp env.sample .env
```

Update .env with your credentials:
```
BASE_URL= # e.g. http://localhost:3000
INFURA_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=BaseIndexer_db
DB_PORT=5432
OPEN_AI_KEY=
```

3. Install Dependencies
```
npm install
```

4. Create the Database
Make sure PostgreSQL is running, then 
```
create your database:
```

5. Run Migrations
Apply your database schema:
```
npx sequelize-cli db:migrate
```
6. Start the Indexer
```
npm run start
```

🔧 Technologies Used

1. Node.js
2. TypeScript
3. PostgreSQL
4. Sequelize ORM
5. Web3.js
6. dotenv

## 🌐 Live Demo

- **Production API:** [https://baseindexer-production.up.railway.app](https://baseindexer-production.up.railway.app)
- **Frontend Explorer:** [https://base-indexer.vercel.app/](https://base-indexer.vercel.app/)

## PROMPT EXAMPLE
```Index this: 0xdac17f958d2ee523a2206206994597c13d831ec7```