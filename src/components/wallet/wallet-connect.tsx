'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Shield, 
  Copy, 
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useWallet } from '@/contexts/wallet-context';

export function WalletConnect() {
  const { user, isConnected, connectWallet, disconnectWallet } = useWallet();

  const copyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-6 w-6 text-blue-600" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600 mb-4">
            Connect your wallet to access the platform with cryptographic identity
          </div>
          
          <Button 
            onClick={connectWallet}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect MetaMask
          </Button>
          
          <div className="text-xs text-gray-500 text-center">
            Your wallet address serves as your unique identity
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Wallet Connected
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Wallet Address</div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
            <code className="text-sm font-mono flex-1">
              {formatAddress(user?.walletAddress || '')}
            </code>
            <Button variant="ghost" size="sm" onClick={copyAddress}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Default Role</div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {user?.defaultRole}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Identity</div>
          <div className="text-sm text-gray-600">
            User ID: {user?.id}
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-700">
              <strong>Role Locking:</strong> Once assigned to a project, your role cannot be changed for that specific project.
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={disconnectWallet}
          className="w-full"
        >
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  );
} 