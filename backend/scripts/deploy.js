const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Deploying ProjectEscrow contract to", hre.network.name);

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC");

    if (balance === 0n) {
        console.error("❌ ERROR: Deployer account has no MATIC!");
        console.log("Get free testnet MATIC from: https://faucet.polygon.technology");
        process.exit(1);
    }

    // Platform admin address (from .env or use deployer)
    const platformAdmin = process.env.PLATFORM_ADMIN_ADDRESS || deployer.address;
    console.log("👤 Platform Admin:", platformAdmin);

    // Deploy contract
    console.log("\n⏳ Deploying contract...");
    const ProjectEscrow = await hre.ethers.getContractFactory("ProjectEscrow");
    const escrow = await ProjectEscrow.deploy(platformAdmin);

    await escrow.waitForDeployment();

    const contractAddress = await escrow.getAddress();
    console.log("✅ ProjectEscrow deployed to:", contractAddress);
    console.log("🔗 View on explorer:", `https://${hre.network.name === 'amoy' ? 'amoy.' : ''}polygonscan.com/address/${contractAddress}`);

    // Save deployment info
    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentInfo = {
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        contractAddress: contractAddress,
        platformAdmin: platformAdmin,
        deployerAddress: deployer.address,
        deployedAt: new Date().toISOString(),
        blockNumber: await hre.ethers.provider.getBlockNumber(),
        transactionHash: escrow.deploymentTransaction()?.hash
    };

    const filename = `${hre.network.name}.json`;
    fs.writeFileSync(
        path.join(deploymentsDir, filename),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 Deployment info saved to:", `deployments/${filename}`);

    // Save ABI
    const artifact = await hre.artifacts.readArtifact("ProjectEscrow");
    const abiPath = path.join(__dirname, '../deployments/ProjectEscrow.json');
    fs.writeFileSync(
        abiPath,
        JSON.stringify({ abi: artifact.abi }, null, 2)
    );
    console.log("📄 Contract ABI saved to:", 'deployments/ProjectEscrow.json');

    // Instructions
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Add to your .env.local:");
    console.log(`   NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`   NEXT_PUBLIC_CHAIN_ID=${hre.network.config.chainId}`);
    console.log("\n2. Verify contract (optional):");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress} "${platformAdmin}"`);
    console.log("\n3. Test the contract:");
    console.log("   - Create a project in your app");
    console.log("   - Lock funds in escrow");
    console.log("   - Approve milestones");
    console.log("\n" + "=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed!");
        console.error(error);
        process.exit(1);
    });
 