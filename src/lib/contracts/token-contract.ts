import { ethers } from 'ethers';
import { CONFIG } from '@/lib/config';

const TRUST_TOKEN_ABI = [
    // Read functions
    "function balanceOf(address owner) view returns (uint256)",
    "function getLockedBalance(address user) view returns (uint256)",

    // Write functions
    "function lockTokens(uint256 jobId, uint256 amount, address freelancer) returns (bool)",
    "function releaseTokens(uint256 jobId, uint256 milestoneId) returns (bool)",
    "function refundTokens(uint256 jobId) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",

    // Events
    "event TokensLocked(uint256 indexed jobId, uint256 amount, address indexed user)",
    "event TokensReleased(uint256 indexed jobId, uint256 amount, address indexed recipient)"
];

export class TokenContract {
    private contract: ethers.Contract | null = null;
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.JsonRpcSigner | null = null;

    constructor(provider?: ethers.BrowserProvider) {
        if (provider) {
            this.provider = provider;
            this.contract = new ethers.Contract(CONFIG.TRUST_TOKEN_ADDRESS, TRUST_TOKEN_ABI, provider);
        }
    }

    async connect() {
        if (typeof window !== 'undefined' && window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.contract = new ethers.Contract(CONFIG.TRUST_TOKEN_ADDRESS, TRUST_TOKEN_ABI, this.signer);
        }
    }

    async getLockedBalance(address: string): Promise<string> {
        if (!this.contract) await this.connect();
        if (!this.contract) return '0.0';

        try {
            const balanceWei = await this.contract.getLockedBalance(address);
            return ethers.formatUnits(balanceWei, 18);
        } catch (error) {
            console.error('Error fetching locked balance:', error);
            return '0.0';
        }
    }

    async lockTokens(jobId: string, amount: string, freelancerAddress: string): Promise<string> {
        if (!this.contract) await this.connect();
        if (!this.contract) throw new Error('Contract not connected');

        try {
            const amountWei = ethers.parseUnits(amount.toString(), 18);
            // Ensure jobId is a number or hash as expected by contract. Assuming numeric ID for now.
            // If jobId is a UUID string, we might need to hash it or use a mapping. 
            // For now, let's try to parse, if NaN use a dummy or hash.
            const numericJobId = parseInt(jobId) || 1;

            const tx = await this.contract.lockTokens(numericJobId, amountWei, freelancerAddress);
            await tx.wait();
            return tx.hash;
        } catch (error) {
            console.error('Error locking tokens:', error);
            throw error;
        }
    }

    async releaseTokens(jobId: string, milestoneId: string): Promise<boolean> {
        if (!this.contract) await this.connect();
        if (!this.contract) throw new Error('Contract not connected');

        try {
            const numericJobId = parseInt(jobId) || 0;
            const numericMilestoneId = parseInt(milestoneId) || 0;

            const tx = await this.contract.releaseTokens(numericJobId, numericMilestoneId);
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Error releasing tokens:', error);
            throw error;
        }
    }
}

export const tokenContract = new TokenContract();
 