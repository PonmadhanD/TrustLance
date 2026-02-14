"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ArrowLeft,
  Shield,
  CheckCircle,
  ExternalLink,
  AlertCircle
} from "lucide-react";

export default function PayPalConnectPage() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handlePayPalConnect = async () => {
    setConnecting(true);

    // Simulate PayPal OAuth flow
    setTimeout(() => {
      setConnected(true);
      setConnecting(false);

      // Redirect back to payments page with success
      setTimeout(() => {
        router.push('/profile/payments?status=success');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/profile/payments')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">Connect Your PayPal Account</h1>
          <p className="text-gray-600 mt-2">
            Securely connect PayPal to receive milestone payments, refunds, and dispute resolutions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Instructions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Connect PayPal?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Receive milestone payouts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Get dispute settlements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Receive refunds if applicable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Automatic payment processing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Connection Card */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <CardContent className="p-8">
                {!connected ? (
                  <>
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CreditCard className="h-10 w-10 text-blue-600" />
                    </div>

                    <h3 className="text-xl font-semibold mb-4">PayPal Integration</h3>
                    <p className="text-gray-600 text-sm mb-6">
                      Click below to securely authorize our platform to send you payments
                    </p>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handlePayPalConnect}
                      disabled={connecting}
                    >
                      {connecting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Connect with PayPal
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>

                    <h3 className="text-xl font-semibold mb-4 text-green-700">Successfully Connected!</h3>
                    <p className="text-gray-600 text-sm mb-6">
                      Your PayPal account is now connected. Redirecting you back...
                    </p>

                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Security Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Secure OAuth</p>
                      <p className="text-gray-600">We use PayPal's official OAuth flow</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">No Credentials Stored</p>
                      <p className="text-gray-600">We never access your PayPal password</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Limited Permissions</p>
                      <p className="text-gray-600">Only payout permissions, no account access</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-yellow-800 text-xs">
                      You can disconnect PayPal anytime from your payments page
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 