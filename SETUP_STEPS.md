# 🚀 Quick Setup Guide

You're almost ready! Follow these steps:

## ✅ What You've Done
- [x] Created Supabase project: **freelance-escrow-demo**
- [x] Got Shardeum SHM testnet tokens
- [x] Have backend code ready

## 📋 Next Steps

### 1. Get Supabase API Keys (2 minutes)

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/bwqaajsxhwiaemdikzkf
2. Click **Settings** (gear icon) in sidebar
3. Click **API**
4. Copy these 2 keys:
   - **anon/public key** (starts with `eyJhbGc...`)
   - **service_role key** (starts with `eyJhbGc...` - keep secret!)

### 2. Update .env.local

I've created `.env.local` with your Supabase URL. Now add your keys:

```bash
# Open the file and replace:
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Add your MetaMask wallet info:
DEPLOYER_PRIVATE_KEY=0x... # from MetaMask (Account Details > Export Private Key)
PLATFORM_ADMIN_ADDRESS=0x... # your wallet address (copy from MetaMask)
```

### 3. Setup Database (3 minutes)

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/bwqaajsxhwiaemdikzkf/sql
2. Click **"New query"**
3. Copy ALL content from `backend/supabase/schema.sql`
4. Paste and click **Run** (bottom right)
5. Wait for success message
6. Click **"New query"** again
7. Copy ALL content from `backend/supabase/rls_policies.sql`
8. Paste and click **Run**

### 4. Deploy Smart Contract (After backend npm install finishes)

```bash
# Deployed on Shardeum
```

**Note:** Shardeum network settings are available in the Wallet section of the app.

### 5. Add Contract Address

After deployment, the script will show:
```
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x...
```

Copy that line and add it to `.env.local`

### 6. Start Your App!

```bash
cd ..
npm run dev
```

Visit: http://localhost:3000

---

## 🆘 Troubleshooting

**"Deployer account has no MATIC"**
- Go to: https://faucet.polygon.technology
- Select "Amoy" network
- Get free tokens

**"Module not found" errors**
- Run: `npm install` in both `/backend` and root directory

**Supabase connection fails**
- Check your API keys are correct
- Make sure you copied the RIGHT keys (anon vs service_role)

---

## ✅ Checklist

- [ ] Added Supabase anon key to .env.local
- [ ] Added Supabase service_role key to .env.local
- [ ] Added MetaMask private key to .env.local
- [ ] Added admin wallet address to .env.local
- [ ] Ran schema.sql in Supabase
- [ ] Ran rls_policies.sql in Supabase
- [ ] Backend npm install completed
- [ ] Deployed contract with `npm run deploy:amoy`
- [ ] Added contract address to .env.local
- [ ] Started app with `npm run dev`

Once all done, you'll have:
- ✅ Complete database with demo data
- ✅ Smart contract deployed on Amoy testnet
- ✅ AI dispute agent ready (mock mode)
- ✅ Full backend running!
 