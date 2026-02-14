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
  balance?: string; // SHM Balance (Native)
  tokenBalance?: string; // TRT Balance (Legacy/Optional)
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

    // Skip if address is not set or seems like a placeholder for Shardeum
    if (!CONFIG.TRUST_TOKEN_ADDRESS || CONFIG.TRUST_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
      return '0.0';
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const abi = [
        "function balanceOf(address owner) view returns (uint256)"
      ];

      const contract = new ethers.Contract(CONFIG.TRUST_TOKEN_ADDRESS, abi, provider);

      // Use a timeout or catch specific CALL_EXCEPTION
      const balanceWei = await contract.balanceOf(user.walletAddress).catch(() => null);

      if (balanceWei === null) return '0.0';

      return ethers.formatUnits(balanceWei, 18);
    } catch (error) {
      // Silently handle RPC/Contract errors to avoid console noise
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
        const [balance, tokenBalance] = await Promise.all([
          getBalance(),
          getTokenBalance()
        ]);
        // For Shardeum, native balance (SHM) is what we primarily care about.
        // We'll map 'balance' to SHM.
        setUser({ ...user, balance, tokenBalance });
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
        tokenBalance: '0.0'
      };
      setUser(userData);
      setIsConnected(true);
    }
  }, []);

  // Auto-refresh balance when connected
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const eth = window.ethereum;
      eth.request({ method: 'eth_chainId' }).then((id: string) => {
        setCurrentChainId(parseInt(id, 16).toString());
      });

      const handleChainChanged = (id: string) => {
        const newId = parseInt(id, 16).toString();
        setCurrentChainId(newId);
        console.log(`Chain changed to: ${newId}. Refreshing balance...`);
        refreshBalance();
      };

      eth.on('chainChanged', handleChainChanged);
      return () => {
        if (eth.removeListener) {
          eth.removeListener('chainChanged', handleChainChanged);
        }
      };
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