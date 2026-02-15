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
  balance?: string; // SHM Balance (Available)
  lockedBalance?: string; // SHM Locked in Escrow
  totalBalance?: string; // Total SHM (Available + Locked)
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
  isSyncing: boolean;
  networkError: string | null;
  currentChainId: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  switchRole: (projectId: string, role: 'CLIENT' | 'FREELANCER') => boolean;
  canActAsRole: (projectId: string, role: 'CLIENT' | 'FREELANCER') => boolean;
  projects: Project[];
  getBalance: () => Promise<string>;
  getLockedBalance: () => Promise<string>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
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

  const switchNetwork = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const chainIdHex = `0x${parseInt(CONFIG.NETWORK_ID).toString(16)}`;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: CONFIG.NETWORK_NAME,
                nativeCurrency: {
                  name: 'Shardeum',
                  symbol: 'SHM',
                  decimals: 18,
                },
                rpcUrls: ['https://api.shardeum.org'],
                blockExplorerUrls: ['https://explorer-sphinx.shardeum.org/'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding Shardeum network:', addError);
        }
      }
      console.error('Error switching to Shardeum network:', switchError);
    }
  };

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
          name: 'John Doe',
          balance: '0.0',
          lockedBalance: '0.0',
          totalBalance: '0.0'
        };

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
          name: 'Demo User',
          balance: '0.0',
          lockedBalance: '0.0',
          totalBalance: '0.0'
        };

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

  // getTrtBalance removed - using native SHM

  const getLockedBalance = async (): Promise<string> => {
    if (!user?.walletAddress || typeof window === 'undefined' || !window.ethereum) return '0.0';

    try {
      // For now, this is a mock since we don't have a view function in Escrow.sol yet for global user locks
      // In a real scenario, you'd add a "totalLocked(address)" function to Escrow.sol
      return '0.0';
    } catch (error) {
      return '0.0';
    }
  };

  const getBalance = async (): Promise<string> => {
    if (!user?.walletAddress || typeof window === 'undefined' || !window.ethereum) return '0.0';

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(user.walletAddress).catch(() => null);

      if (balanceWei === null) return '0.0';

      const balanceEth = ethers.formatUnits(balanceWei, 18);
      return parseFloat(balanceEth).toFixed(4);
    } catch (error) {
      // Silently handle RPC errors
      return '0.0';
    }
  };

  const refreshBalance = async () => {
    if (user && !isSyncing) {
      setIsSyncing(true);
      setNetworkError(null);
      try {
        const [balance, locked] = await Promise.all([
          getBalance(),
          getLockedBalance()
        ]);

        // Calculate total
        const balanceNum = parseFloat(balance) || 0;
        const lockedNum = parseFloat(locked) || 0;
        const total = (balanceNum + lockedNum).toFixed(4);
        setUser({ ...user, balance, lockedBalance: locked, totalBalance: total });
      } catch (err: any) {
        if (err.code === -32002) {
          setNetworkError("RPC Rate Limited - retrying...");
        } else {
          setNetworkError("Network sync error");
        }
      } finally {
        setIsSyncing(false);
      }
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
        lockedBalance: '0.0',
        totalBalance: '0.0'
      };
      setUser(userData);
      setIsConnected(true);
    }
  }, []);

  // Auto-refresh balance when connected
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const eth = window.ethereum;
      try {
        eth.request({ method: 'eth_chainId' })
          .then((id: string) => {
            setCurrentChainId(parseInt(id, 16).toString());
          })
          .catch((err: any) => console.error("Error fetching chainId:", err));

        const handleChainChanged = (id: string) => {
          const newId = parseInt(id, 16).toString();
          setCurrentChainId(newId);
          console.log(`Chain changed to: ${newId}. Refreshing balance...`);
          refreshBalance();
        };

        if (eth.on) {
          eth.on('chainChanged', handleChainChanged);
        }

        return () => {
          if (eth.removeListener) {
            eth.removeListener('chainChanged', handleChainChanged);
          }
        };
      } catch (err) {
        console.error("Error setting up wallet listeners:", err);
      }
    }
  }, []);

  // Auto-refresh balance when connected
  useEffect(() => {
    if (isConnected && user) {
      refreshBalance();
      // Refresh balance every 30 seconds
      const interval = setInterval(refreshBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, user?.walletAddress]);

  return (
    <WalletContext.Provider value={{
      user,
      isConnected,
      isSyncing,
      networkError,
      currentChainId,
      connectWallet,
      disconnectWallet,
      switchNetwork,
      switchRole,
      canActAsRole,
      projects,
      getBalance,
      getLockedBalance,
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