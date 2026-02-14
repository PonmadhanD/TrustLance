'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ethers } from 'ethers';
import { CONFIG } from '@/lib/config';

interface User {
  id: string;
  walletAddress: string;
  defaultRole: 'CLIENT' | 'FREELANCER';
  email?: string;
  name?: string;
  balance?: string; // ETH Balance
  tokenBalance?: string; // TRT Balance
}

interface Project {
  id: string;
  clientWallet: string;
  freelancerWallet: string;
  paymentType: 'BLOCKCHAIN_ESCROW' | 'EXTERNAL_PAYMENT';
  contractAddress?: string;
}

interface WalletContextType {
  user: User | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchRole: (projectId: string, role: 'CLIENT' | 'FREELANCER') => boolean;
  canActAsRole: (projectId: string, role: 'CLIENT' | 'FREELANCER') => boolean;
  projects: Project[];
  getBalance: () => Promise<string>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [projects] = useState<Project[]>([
    {
      id: '1',
      clientWallet: '0x742d35Cc6634C0532925a3b8D404fddF4f780EAD',
      freelancerWallet: '0x8ba1f109551bD432803012645Hac136c',
      paymentType: 'BLOCKCHAIN_ESCROW',
      contractAddress: '0x1234567890123456789012345678901234567890'
    }
  ]);

  const router = useRouter();
  const pathname = usePathname();

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // MetaMask connection
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        const walletAddress = accounts[0];

        // Generate nonce and verify signature (simplified)
        const nonce = Math.random().toString(36);
        const message = `Sign this message to authenticate: ${nonce}`;

        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, walletAddress]
        });

        // Mock user creation/retrieval
        const userData: User = {
          id: `user_${walletAddress.slice(-8)}`,
          walletAddress,
          defaultRole: 'FREELANCER',
          name: 'John Doe'
        };

        setUser(userData);
        setIsConnected(true);

        setUser(userData);
        setIsConnected(true);

        localStorage.setItem('walletAddress', walletAddress);

        // Auto-redirect to dashboard if on public pages
        if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
          router.push('/dashboard');
        }
      } else {
        // Fallback for demo - simulate wallet connection
        const mockWallet = '0x742d35Cc6634C0532925a3b8D404fddF4f780EAD';
        const userData: User = {
          id: 'user_demo',
          walletAddress: mockWallet,
          defaultRole: 'CLIENT',
          name: 'Demo User'
        };

        setUser(userData);
        setUser(userData);
        setIsConnected(true);
        localStorage.setItem('walletAddress', mockWallet);

        // Auto-redirect to dashboard if on public pages
        if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const disconnectWallet = () => {
    setUser(null);
    setIsConnected(false);
    localStorage.removeItem('walletAddress');
  };

  const canActAsRole = (projectId: string, role: 'CLIENT' | 'FREELANCER'): boolean => {
    if (!user) return false;

    const project = projects.find(p => p.id === projectId);
    if (!project) return true; // New project, can select role

    // Role locking logic - critical rule
    if (role === 'CLIENT') {
      return project.clientWallet === user.walletAddress;
    } else {
      return project.freelancerWallet === user.walletAddress;
    }
  };

  const switchRole = (projectId: string, role: 'CLIENT' | 'FREELANCER'): boolean => {
    return canActAsRole(projectId, role);
  };

  const getTokenBalance = async (): Promise<string> => {
    if (!user?.walletAddress || typeof window === 'undefined' || !window.ethereum) return '0.0';

    try {
      // Use ethers v6 BrowserProvider
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Minimal ABI for balanceOf
      const abi = [
        "function balanceOf(address owner) view returns (uint256)"
      ];

      const contract = new ethers.Contract(CONFIG.TRUST_TOKEN_ADDRESS, abi, provider);
      const balanceWei = await contract.balanceOf(user.walletAddress);
      return ethers.formatUnits(balanceWei, 18); // Assuming 18 decimals
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return '0.0';
    }
  };

  const getBalance = async (): Promise<string> => {
    if (!user?.walletAddress) return '0.0';

    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const balanceWei = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [user.walletAddress, 'latest']
        });
        const balanceEth = parseInt(balanceWei, 16) / 1e18;
        return balanceEth.toFixed(4);
      }
      return '0.0';
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0.0';
    }
  };

  const refreshBalance = async () => {
    if (user) {
      const [balance, tokenBalance] = await Promise.all([
        getBalance(),
        getTokenBalance()
      ]);
      setUser({ ...user, balance, tokenBalance });
    }
  };

  // Auto-connect on page load
  useEffect(() => {
    const savedWallet = localStorage.getItem('walletAddress');
    if (savedWallet) {
      const userData: User = {
        id: 'user_demo',
        walletAddress: savedWallet,
        defaultRole: 'CLIENT',
        name: 'Demo User',
        balance: '0.0',
        tokenBalance: '0.0'
      };
      setUser(userData);
      setIsConnected(true);
    }
  }, []);

  // Auto-refresh balance when connected
  useEffect(() => {
    if (isConnected && user) {
      refreshBalance();
      // Refresh balance every 15 seconds
      const interval = setInterval(refreshBalance, 15000);
      return () => clearInterval(interval);
    }
  }, [isConnected, user?.walletAddress]);

  return (
    <WalletContext.Provider value={{
      user,
      isConnected,
      connectWallet,
      disconnectWallet,
      switchRole,
      canActAsRole,
      projects,
      getBalance,
      refreshBalance
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}