"use client";

import { useState } from "react";

export type ProjectState = 
  | 'JOB_POSTED'
  | 'PROPOSAL_ACCEPTED'
  | 'PROJECT_CREATED'
  | 'ESCROW_PENDING'
  | 'ESCROW_FUNDED'
  | 'IN_PROGRESS'
  | 'MILESTONE_SUBMITTED'
  | 'PAYMENT_RELEASED'
  | 'COMPLETED'
  | 'DISPUTED';

export type MilestoneState = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'PAID' | 'DISPUTED';

export type PaymentMethod = 'BLOCKCHAIN_ESCROW' | 'PAYPAL_PLATFORM_MANAGED';

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  state: MilestoneState;
  submittedAt?: string;
  approvedAt?: string;
  transactionHash?: string;
  paypalTransactionId?: string;
}

export interface ProjectData {
  id: string;
  title: string;
  clientId: string;
  freelancerId: string;
  state: ProjectState;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  contractAddress?: string;
  paypalOrderId?: string;
  escrowStatus: 'LOCKED' | 'RELEASED';
  milestones: ProjectMilestone[];
  currentMilestone: number;
  createdAt: string;
}

export function useProjectWorkspace(projectId: string) {
  const [loading, setLoading] = useState(false);

  // Mock project data - in real app, fetch from API
  const getProject = (): ProjectData => ({
    id: projectId,
    title: "E-commerce Website Development",
    clientId: "client_123",
    freelancerId: "freelancer_456",
    state: 'ESCROW_PENDING',
    paymentMethod: 'BLOCKCHAIN_ESCROW',
    totalAmount: 2500,
    contractAddress: '0xABCD1234567890ABCDEF1234567890ABCDEF1234',
    escrowStatus: 'LOCKED',
    milestones: [
      {
        id: "m1",
        title: "Initial Design & Wireframes",
        description: "Create initial design mockups and wireframes",
        amount: 800,
        dueDate: "2024-02-15",
        state: 'PENDING',
        transactionHash: '0x5678EF90ABCD1234567890ABCDEF1234567890AB'
      },
      {
        id: "m2", 
        title: "Frontend Development",
        description: "Implement responsive frontend",
        amount: 1200,
        dueDate: "2024-03-01",
        state: 'PENDING'
      },
      {
        id: "m3",
        title: "Backend & Testing",
        description: "Complete backend integration and testing",
        amount: 500,
        dueDate: "2024-03-15",
        state: 'PENDING'
      }
    ],
    currentMilestone: 0,
    createdAt: "2024-01-15"
  });

  const fundEscrow = async (amount: number): Promise<boolean> => {
    setLoading(true);
    try {
      console.log(`Deploying smart contract for project ${projectId}`);
      console.log(`Locking ${amount} ETH in escrow`);
      // Smart contract deployment would happen here
      return true;
    } finally {
      setLoading(false);
    }
  };

  const submitMilestone = async (milestoneId: string, deliverables: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log(`Submitting milestone ${milestoneId} for project ${projectId}`);
      console.log(`Deliverables: ${deliverables}`);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const approveMilestone = async (milestoneId: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log(`Approving milestone ${milestoneId} - releasing payment`);
      console.log('Smart contract release function called');
      return true;
    } finally {
      setLoading(false);
    }
  };

  const requestChanges = async (milestoneId: string, feedback: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log(`Requesting changes for milestone ${milestoneId}: ${feedback}`);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const raiseDispute = async (reason: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log(`Raising dispute for project ${projectId}: ${reason}`);
      return true;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getProject,
    fundEscrow,
    submitMilestone,
    approveMilestone,
    requestChanges,
    raiseDispute
  };
} 