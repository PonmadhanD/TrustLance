"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Scale,
  Plus,
  MessageCircle,
  Eye,
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from "lucide-react";
import { useDisputeActions } from "@/hooks/use-dispute-actions";

export default function DisputesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const { getDisputes } = useDisputeActions();
  const disputes = getDisputes();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'AWAITING_EVIDENCE': return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW': return 'bg-orange-100 text-orange-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'ESCALATED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertTriangle className="h-4 w-4" />;
      case 'AWAITING_EVIDENCE': return <Clock className="h-4 w-4" />;
      case 'UNDER_REVIEW': return <Eye className="h-4 w-4" />;
      case 'RESOLVED': return <CheckCircle className="h-4 w-4" />;
      case 'ESCALATED': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filterDisputes = (status: string) => {
    if (status === 'all') return disputes;
    return disputes.filter(d => d.status.toLowerCase().replace('_', '-') === status);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Top Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Scale className="h-8 w-8 text-purple-600" />
                Disputes & Resolutions
              </h1>
              <p className="text-gray-600 mt-2">Manage project disputes and payment resolutions</p>
            </div>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => router.push('/disputes/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Raise Dispute
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Disputes</p>
                  <p className="text-2xl font-bold text-gray-900">{disputes.length}</p>
                </div>
                <Scale className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Cases</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {disputes.filter(d => ['OPEN', 'AWAITING_EVIDENCE', 'UNDER_REVIEW'].includes(d.status)).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {disputes.filter(d => d.status === 'RESOLVED').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Amount Locked</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${disputes.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="awaiting-evidence">Awaiting Evidence</TabsTrigger>
            <TabsTrigger value="under-review">Under Review</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="escalated">Escalated</TabsTrigger>
          </TabsList>

          {['all', 'open', 'awaiting-evidence', 'under-review', 'resolved', 'escalated'].map(tab => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="space-y-4">
                {filterDisputes(tab).map((dispute) => (
                  <Card key={dispute.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{dispute.id}</h3>
                            <Badge className={getStatusColor(dispute.status)}>
                              {getStatusIcon(dispute.status)}
                              <span className="ml-1">{dispute.status.replace('_', ' ')}</span>
                            </Badge>
                            <Badge variant="outline">
                              {dispute.role}
                            </Badge>
                          </div>

                          <p className="text-gray-700 font-medium mb-1">{dispute.projectName}</p>
                          <p className="text-gray-600 text-sm mb-2">{dispute.reason}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              ${dispute.amount.toLocaleString()} locked
                            </span>
                            <span>{dispute.paymentMethod.replace('_', ' ')}</span>
                            <span>Created: {dispute.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/disputes/${dispute.id}/messages`)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Messages
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/disputes/${dispute.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filterDisputes(tab).length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No disputes found for this category</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}