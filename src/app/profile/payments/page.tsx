"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Info,
  ArrowLeft
} from "lucide-react";

export default function ProfilePaymentsPage() {
  const router = useRouter();
  const [paypalConnected, setPaypalConnected] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("john.doe@example.com");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/profile')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-green-600" />
            Payments & Payouts
          </h1>
          <p className="text-gray-600 mt-2">Manage your payment methods for receiving freelancer payouts</p>
        </div>

        {/* Info Panel */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-blue-800 font-medium mb-2">How Payments Work</p>
                <p className="text-blue-700 text-sm mb-2">
                  • Payment methods added here are used for <strong>freelancer payouts</strong> and dispute resolutions
                </p>
                <p className="text-blue-700 text-sm">
                  • Client payments are handled via platform escrow (no setup required)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Payment Methods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Connected Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* PayPal */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">PayPal</h3>
                    <p className="text-sm text-gray-600">
                      {paypalConnected ? `Connected: ${paypalEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}` : 'Not connected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={paypalConnected ? "default" : "secondary"}>
                    {paypalConnected ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </>
                    )}
                  </Badge>
                  {paypalConnected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaypalConnected(false)}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => router.push('/profile/payments/paypal')}
                    >
                      Connect PayPal
                    </Button>
                  )}
                </div>
              </div>

              {/* Future Payment Methods */}
              <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Stripe</h3>
                    <p className="text-sm text-gray-400">Coming soon</p>
                  </div>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                className="w-full justify-between"
                onClick={() => router.push('/profile/payments/paypal')}
              >
                <span>Manage PayPal Account</span>
                <ExternalLink className="h-4 w-4" />
              </Button>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">What PayPal is used for:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Milestone payouts from completed projects</li>
                  <li>✓ Dispute settlement payments</li>
                  <li>✓ Refunds if applicable</li>
                  <li>✓ Platform fee deductions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 