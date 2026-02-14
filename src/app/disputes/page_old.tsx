'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Eye,
  MessageSquare,
  FileText,
  Calendar,
  DollarSign,
  User,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { DisputeAIAssistant } from '@/components/disputes/dispute-ai-assistant';
import { DisputeLayout } from '@/components/disputes/dispute-layout';

interface Dispute {
  id: string;
  title: string;
  type: string;
  status: 'open' | 'under_review' | 'awaiting_evidence' | 'resolved' | 'escalated';
  amount: number;
  project: string;
  otherParty: string;
  createdAt: string;
  lastUpdate: string;
  priority: 'low' | 'medium' | 'high';
}

const mockDisputes: Dispute[] = [
  {
    id: 'DSP-001',
    title: 'Payment not released after milestone completion',
    type: 'Payment Issue',
    status: 'under_review',
    amount: 1500,
    project: 'E-commerce Website Development',
    otherParty: 'TechCorp Inc.',
    createdAt: '2024-01-15',
    lastUpdate: '2 hours ago',
    priority: 'high'
  },
  {
    id: 'DSP-002', 
    title: 'Scope creep without additional payment',
    type: 'Scope Violation',
    status: 'awaiting_evidence',
    amount: 800,
    project: 'Mobile App UI Design',
    otherParty: 'StartupXYZ',
    createdAt: '2024-01-12',
    lastUpdate: '1 day ago',
    priority: 'medium'
  }
];

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [disputes] = useState<Dispute[]>(mockDisputes);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'awaiting_evidence': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'awaiting_evidence': return <FileText className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'escalated': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    if (activeTab === 'all') return true;
    return dispute.status === activeTab;
  });

  return (
    <DisputeLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Scale className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Disputes</h1>
                  <p className="text-gray-600">Manage and track your dispute cases</p>
                </div>
              </div>
              <Link href="/disputes/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Raise New Dispute
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                      <p className="text-2xl font-bold text-gray-900">{disputes.length}</p>
                    </div>
                    <Scale className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Under Review</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {disputes.filter(d => d.status === 'under_review').length}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Resolved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {disputes.filter(d => d.status === 'resolved').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${disputes.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>My Disputes</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="open">Open</TabsTrigger>
                    <TabsTrigger value="under_review">Under Review</TabsTrigger>
                    <TabsTrigger value="awaiting_evidence">Awaiting Evidence</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    <TabsTrigger value="escalated">Escalated</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="mt-6">
                    {filteredDisputes.length === 0 ? (
                      <div className="text-center py-12">
                        <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes found</h3>
                        <p className="text-gray-600 mb-4">
                          {activeTab === 'all' 
                            ? "You don't have any disputes yet." 
                            : `No disputes with status "${activeTab.replace('_', ' ')}".`
                          }
                        </p>
                        <Link href="/disputes/new">
                          <Button>Raise New Dispute</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredDisputes.map((dispute) => (
                          <Card key={dispute.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {dispute.title}
                                    </h3>
                                    <Badge variant="outline" className={getStatusColor(dispute.status)}>
                                      {getStatusIcon(dispute.status)}
                                      <span className="ml-1 capitalize">
                                        {dispute.status.replace('_', ' ')}
                                      </span>
                                    </Badge>
                                    <Badge variant="outline" className={getPriorityColor(dispute.priority)}>
                                      {dispute.priority.toUpperCase()}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      <span>ID: {dispute.id}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Building className="h-4 w-4" />
                                      <span>{dispute.project}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      <span>{dispute.otherParty}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="font-medium">${dispute.amount.toLocaleString()}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Created {dispute.createdAt}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>Updated {dispute.lastUpdate}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm">
                                        <MessageSquare className="h-4 w-4 mr-1" />
                                        Messages
                                      </Button>
                                      <Link href={`/disputes/${dispute.id}`}>
                                        <Button size="sm">
                                          View Details
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:w-96">
            <DisputeAIAssistant />
          </div>
        </div>
      </div>
    </DisputeLayout>
  );
} 