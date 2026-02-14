const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../deploy_log.txt');

function log(msg) {
    fs.appendFileSync(LOG_FILE, msg + "\n");
}

async function main() {
    if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
    log("🚀 Starting Silent Native SHM Deployment to " + hre.network.name);

    const [deployer] = await hre.ethers.getSigners();
    log("📝 Account: " + deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    log("💰 Balance: " + hre.ethers.formatEther(balance) + " SHM");

    const feeData = await hre.ethers.provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    log("⛽ Gas Price: " + gasPrice.toString());

    log("⏳ Deploying Native Escrow...");
    const Escrow = await hre.ethers.getContractFactory("Escrow");

    // Deploying with a buffer gas price and limit
    const escrow = await Escrow.deploy({
        gasPrice: gasPrice,
        gasLimit: 300000
    });

    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();
    log("✅ Native Escrow: " + escrowAddress);

    const deploymentInfo = {
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        escrowContractAddress: escrowAddress,
        deployerAddress: deployer.address,
        deployedAt: new Date().toISOString()
    };

    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(deploymentsDir, 'native_shm_escrow.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );

    log("🎉 Native Deployment Successful!");
}

main().catch((error) => {
    log("❌ FAILED: " + (error.stack || error.message));
    process.exit(1);
});
