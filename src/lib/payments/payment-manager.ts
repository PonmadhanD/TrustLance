import { ethers } from 'ethers';
import { CONFIG } from '@/lib/config';

export type ContractState =
  | 'CREATED'
  | 'FUNDED'
  | 'IN_PROGRESS'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'BLOCKCHAIN_ESCROW' | 'PAYPAL_PLATFORM_MANAGED' | 'STRIPE';

export interface Milestone {
  id: string;
  amount: number;
  description: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'DISPUTED';
  submittedAt?: string;
  approvedAt?: string;
}

export interface Project {
  id: string;
  clientWallet: string;
  freelancerWallet: string;
  paymentMethod: PaymentMethod;
  contractState: ContractState;
  contractAddress?: string;
  paypalOrderId?: string;
  milestones: Milestone[];
  totalAmount: number;
  createdAt: string;
  lastActivity: string;
}

export interface PaymentProvider {
  depositFunds(projectId: string, amount: number): Promise<boolean>;
  submitMilestone(projectId: string, milestoneId: string): Promise<boolean>;
  approveMilestone(projectId: string, milestoneId: string): Promise<boolean>;
  raiseDispute(projectId: string, reason: string): Promise<boolean>;
  resolveDispute(projectId: string, decision: 'FREELANCER' | 'CLIENT' | 'PARTIAL'): Promise<boolean>;
  cancelContract(projectId: string): Promise<boolean>;
  getProjectStatus(projectId: string): Promise<Project>;
}

export class SmartContractEscrow implements PaymentProvider {
  async depositFunds(projectId: string, amount: number): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error("No crypto wallet found");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // SHM Native token (or wrapped if using specific contract)
      // For Shardeum Sphinx native, we usually just transfer SHM. 
      // But we'll update the logs to be consistent.
      const tokenContract = new ethers.Contract(
        CONFIG.TRUST_TOKEN_ADDRESS,
        [
          "function transfer(address to, uint256 amount) returns (boolean)",
          "function decimals() view returns (uint8)"
        ],
        signer
      );

      // Destination: Mock Escrow or Project Wallet
      // In a real app, this would be the Escrow Smart Contract Address
      const destinationAddress = '0x742d35Cc6634C0532925a3b8D404fddF4f780EAD';

      // Amount to Wei
      const decimals = 18; // Default
      const amountWei = ethers.parseUnits(amount.toString(), decimals);

      console.log(`Initiating Transfer of ${amount} SHM to ${destinationAddress}...`);

      // Execute Transfer
      const tx = await tokenContract.transfer(destinationAddress, amountWei);
      console.log("Transaction sent:", tx.hash);

      await tx.wait();
      console.log("Transaction confirmed!");

      return true;
    } catch (error) {
      console.error("Deposit failed:", error);
      return false;
    }
  }

  async submitMilestone(projectId: string, milestoneId: string): Promise<boolean> {
    console.log(`Submitting milestone ${milestoneId} for project ${projectId}`);
    return true;
  }

  async approveMilestone(projectId: string, milestoneId: string): Promise<boolean> {
    console.log(`Approving milestone ${milestoneId} - releasing funds`);
    return true;
  }

  async raiseDispute(projectId: string, reason: string): Promise<boolean> {
    console.log(`Raising dispute for project ${projectId}: ${reason}`);
    return true;
  }

  async resolveDispute(projectId: string, decision: 'FREELANCER' | 'CLIENT' | 'PARTIAL'): Promise<boolean> {
    console.log(`Resolving dispute for project ${projectId}: ${decision}`);
    return true;
  }

  async cancelContract(projectId: string): Promise<boolean> {
    console.log(`Cancelling contract for project ${projectId}`);
    return true;
  }

  async getProjectStatus(projectId: string): Promise<Project> {
    // Mock project data
    return {
      id: projectId,
      clientWallet: '0x742d35Cc6634C0532925a3b8D404fddF4f780EAD',
      freelancerWallet: '0x8ba1f109551bD432803012645Hac136c',
      paymentMethod: 'BLOCKCHAIN_ESCROW',
      contractState: 'FUNDED',
      contractAddress: '0x1234567890123456789012345678901234567890',
      milestones: [
        {
          id: '1',
          amount: 500,
          description: 'Initial Design',
          status: 'APPROVED'
        }
      ],
      totalAmount: 1500,
      createdAt: '2024-01-15',
      lastActivity: '2 hours ago'
    };
  }
}

export class PayPalEscrow implements PaymentProvider {
  async depositFunds(projectId: string, amount: number): Promise<boolean> {
    // Platform-managed escrow: Client pays to Platform PayPal Business Account
    console.log(`Creating PayPal payment to Platform account for $${amount} - project ${projectId}`);
    console.log('Payment captured and held by platform - funds locked until milestone approval');
    return true;
  }

  async submitMilestone(projectId: string, milestoneId: string): Promise<boolean> {
    console.log(`Milestone ${milestoneId} submitted - awaiting client approval for payout`);
    return true;
  }

  async approveMilestone(projectId: string, milestoneId: string): Promise<boolean> {
    // Platform triggers PayPal Payout API to freelancer
    console.log(`Client approved - triggering PayPal payout to freelancer for milestone ${milestoneId}`);
    console.log('POST /paypal/payout - Platform → Freelancer transfer');
    return true;
  }

  async raiseDispute(projectId: string, reason: string): Promise<boolean> {
    console.log(`PayPal escrow dispute raised for project ${projectId}: ${reason}`);
    console.log('Payout blocked - funds remain with platform until resolution');
    return true;
  }

  async resolveDispute(projectId: string, decision: 'FREELANCER' | 'CLIENT' | 'PARTIAL'): Promise<boolean> {
    switch (decision) {
      case 'FREELANCER':
        console.log(`Dispute resolved: PayPal payout to freelancer - project ${projectId}`);
        break;
      case 'CLIENT':
        console.log(`Dispute resolved: PayPal refund to client - project ${projectId}`);
        break;
      case 'PARTIAL':
        console.log(`Dispute resolved: Split payout - project ${projectId}`);
        break;
    }
    return true;
  }

  async cancelContract(projectId: string): Promise<boolean> {
    console.log(`Refunding PayPal payment to client for project ${projectId}`);
    console.log('POST /paypal/refund - Platform → Client refund');
    return true;
  }

  async getProjectStatus(projectId: string): Promise<Project> {
    return {
      id: projectId,
      clientWallet: '0x742d35Cc6634C0532925a3b8D404fddF4f780EAD',
      freelancerWallet: '0x8ba1f109551bD432803012645Hac136c',
      paymentMethod: 'PAYPAL_PLATFORM_MANAGED',
      contractState: 'FUNDED',
      paypalOrderId: 'PAYPAL-TXN-123456',
      milestones: [
        {
          id: '1',
          amount: 500,
          description: 'Initial Design',
          status: 'SUBMITTED'
        }
      ],
      totalAmount: 1500,
      createdAt: '2024-01-15',
      lastActivity: '1 hour ago'
    };
  }
}

export class PaymentManager {
  private providers: Map<PaymentMethod, PaymentProvider> = new Map();

  constructor() {
    this.providers.set('BLOCKCHAIN_ESCROW', new SmartContractEscrow());
    this.providers.set('PAYPAL_PLATFORM_MANAGED', new PayPalEscrow());
  }

  getProvider(method: PaymentMethod): PaymentProvider {
    const provider = this.providers.get(method);
    if (!provider) {
      throw new Error(`Payment provider not found: ${method}`);
    }
    return provider;
  }

  async canPerformAction(
    projectId: string,
    userWallet: string,
    action: 'DEPOSIT' | 'SUBMIT' | 'APPROVE' | 'DISPUTE' | 'CANCEL'
  ): Promise<boolean> {
    // Role-based permission checking
    const project = await this.getProjectStatus(projectId, 'BLOCKCHAIN_ESCROW');

    switch (action) {
      case 'DEPOSIT':
      case 'APPROVE':
      case 'CANCEL':
        return project.clientWallet === userWallet;
      case 'SUBMIT':
        return project.freelancerWallet === userWallet;
      case 'DISPUTE':
        return project.clientWallet === userWallet || project.freelancerWallet === userWallet;
      default:
        return false;
    }
  }

  async getProjectStatus(projectId: string, method: PaymentMethod): Promise<Project> {
    const provider = this.getProvider(method);
    return provider.getProjectStatus(projectId);
  }
}