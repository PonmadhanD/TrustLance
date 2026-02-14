'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Shield, 
  Scale, 
  CreditCard, 
  Smartphone,
  CheckCircle
} from 'lucide-react';
import { WalletConnect } from '@/components/wallet/wallet-connect';
import { ProjectLifecycle } from '@/components/payments/project-lifecycle';
import { DisputeResolution } from '@/components/disputes/dispute-resolution';
import { WalletProvider } from '@/contexts/wallet-context';

export default function PaymentSystemDemo() {
  const [activeDemo, setActiveDemo] = useState('wallet');

  return (
    <WalletProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Payment & Smart Contract Lifecycle
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hybrid escrow system with wallet-based identity, role-locked projects, 
            and AI-assisted dispute resolution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <Wallet className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Wallet Identity</h3>
              <p className="text-sm text-gray-600">
                Cryptographic identity with role binding and project locking
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Hybrid Escrow</h3>
              <p className="text-sm text-gray-600">
                Smart contracts + PayPal with unified lifecycle management
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Scale className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fair Disputes</h3>
              <p className="text-sm text-gray-600">
                Three-layer resolution: AI + Expert Jury + Admin Authority
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeDemo} onValueChange={setActiveDemo}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wallet">Wallet Auth</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain Escrow</TabsTrigger>
            <TabsTrigger value="paypal">PayPal Escrow</TabsTrigger>
            <TabsTrigger value="disputes">Dispute Resolution</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Wallet-Based Authentication</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>User Identity = User ID + Primary Wallet Address</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Cryptographic signature verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Role locking per project (CLIENT/FREELANCER)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Prevents fake accounts and ensures traceability</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <WalletConnect />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="blockchain" className="mt-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Smart Contract Escrow</h2>
                <p className="text-gray-600">
                  On-chain transparency with automatic milestone releases
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Contract States
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>CREATED</span>
                        <Badge variant="outline">Contract deployed</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>FUNDED</span>
                        <Badge variant="outline">Escrow locked</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>IN_PROGRESS</span>
                        <Badge variant="outline">Work ongoing</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>COMPLETED</span>
                        <Badge variant="outline">Funds released</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Role Permissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><strong>Client:</strong> Deposit, Approve, Cancel</div>
                      <div><strong>Freelancer:</strong> Submit milestones</div>
                      <div><strong>Both:</strong> Raise disputes</div>
                      <div><strong>Admin:</strong> Resolve disputes</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <ProjectLifecycle projectId="1" paymentMethod="BLOCKCHAIN_ESCROW" />
            </div>
          </TabsContent>

          <TabsContent value="paypal" className="mt-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Platform-Managed PayPal Escrow</h2>
                <p className="text-gray-600">
                  Client → Platform PayPal → Freelancer with milestone-based releases
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">PayPal Platform</h4>
                    <p className="text-sm text-gray-600">Platform-managed escrow</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Smartphone className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">UPI (India)</h4>
                    <p className="text-sm text-gray-600">Instant payments</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Shield className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">Stripe</h4>
                    <p className="text-sm text-gray-600">Global card processing</p>
                  </CardContent>
                </Card>
              </div>

              <ProjectLifecycle projectId="2" paymentMethod="PAYPAL_PLATFORM_MANAGED" />
            </div>
          </TabsContent>

          <TabsContent value="disputes" className="mt-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Three-Layer Dispute Resolution</h2>
                <p className="text-gray-600">
                  AI guidance + Expert jury + Admin authority for fair decisions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h4 className="font-medium mb-2">AI Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Evidence review, risk scoring, pattern matching
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 font-bold">2</span>
                    </div>
                    <h4 className="font-medium mb-2">Expert Jury</h4>
                    <p className="text-sm text-gray-600">
                      3 anonymous domain experts vote independently
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <h4 className="font-medium mb-2">Admin Authority</h4>
                    <p className="text-sm text-gray-600">
                      Final decision with payment execution
                    </p>
                  </CardContent>
                </Card>
              </div>

              <DisputeResolution disputeId="DSP-001" projectId="1" />
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Architecture Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">Judge-Ready Defense:</p>
              <p className="text-sm text-blue-700">
                "For non-crypto users, we implemented platform-managed PayPal escrow where client funds 
                are held by the platform and released only after milestone approval or dispute resolution, 
                mirroring the guarantees of blockchain escrow without requiring wallets."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </WalletProvider>
  );
} 