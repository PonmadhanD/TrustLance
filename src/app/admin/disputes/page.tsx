'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Bot, 
  BarChart3,
  Search,
  Filter,
  Download,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  Settings
} from 'lucide-react';

interface AdminDispute {
  id: string;
  title: string;
  type: string;
  status: string;
  amount: number;
  freelancer: string;
  client: string;
  createdAt: string;
  aiScore: number;
  expertVotes: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  flagged: boolean;
}

const mockDisputes: AdminDispute[] = [
  {
    id: 'DSP-001',
    title: 'Payment not released after milestone completion',
    type: 'Payment Issue',
    status: 'under_review',
    amount: 1500,
    freelancer: 'John Doe',
    client: 'TechCorp Inc.',
    createdAt: '2024-01-15',
    aiScore: 25,
    expertVotes: 2,
    priority: 'high',
    flagged: false
  },
  {
    id: 'DSP-002',
    title: 'Scope creep without additional payment',
    type: 'Scope Violation',
    status: 'awaiting_evidence',
    amount: 800,
    freelancer: 'Jane Smith',
    client: 'StartupXYZ',
    createdAt: '2024-01-12',
    aiScore: 65,
    expertVotes: 1,
    priority: 'medium',
    flagged: true
  },
  {
    id: 'DSP-003',
    title: 'Work quality dispute',
    type: 'Quality Issue',
    status: 'escalated',
    amount: 2200,
    freelancer: 'Mike Johnson',
    client: 'Enterprise Corp',
    createdAt: '2024-01-10',
    aiScore: 85,
    expertVotes: 3,
    priority: 'critical',
    flagged: true
  }
];

const aiMetrics = {
  totalAnalyzed: 1247,
  accuracyRate: 87.3,
  biasScore: 12.5,
  falsePositives: 8.2,
  averageProcessingTime: '2.3 seconds',
  modelVersion: 'v2.1.4'
};

const expertMetrics = {
  totalExperts: 156,
  activeExperts: 89,
  averageRating: 4.7,
  averageResponseTime: '4.2 hours',
  consensusRate: 92.1
};

export default function AdminDisputesPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

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
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDisputes = mockDisputes.filter(dispute => {
    const matchesSearch = dispute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.freelancer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || dispute.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin - Dispute Management</h1>
            <p className="text-gray-600">Monitor and manage platform disputes with AI insights</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                <p className="text-2xl font-bold text-gray-900">{mockDisputes.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flagged Cases</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockDisputes.filter(d => d.flagged).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                <p className="text-2xl font-bold text-green-600">{aiMetrics.accuracyRate}%</p>
              </div>
              <Bot className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Experts</p>
                <p className="text-2xl font-bold text-blue-600">{expertMetrics.activeExperts}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${mockDisputes.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-monitoring">AI Monitoring</TabsTrigger>
          <TabsTrigger value="expert-panel">Expert Panel</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Disputes</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search disputes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="awaiting_evidence">Awaiting Evidence</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDisputes.map((dispute) => (
                  <Card key={dispute.id} className={`hover:shadow-md transition-shadow ${dispute.flagged ? 'border-red-200 bg-red-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{dispute.title}</h3>
                            <Badge className={getStatusColor(dispute.status)}>
                              {dispute.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={getPriorityColor(dispute.priority)}>
                              {dispute.priority.toUpperCase()}
                            </Badge>
                            {dispute.flagged && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                FLAGGED
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-5 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">ID:</span> {dispute.id}
                            </div>
                            <div>
                              <span className="font-medium">Freelancer:</span> {dispute.freelancer}
                            </div>
                            <div>
                              <span className="font-medium">Client:</span> {dispute.client}
                            </div>
                            <div>
                              <span className="font-medium">Amount:</span> ${dispute.amount.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">AI Score:</span> {dispute.aiScore}/100
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Override
                          </Button>
                          {dispute.flagged && (
                            <Button variant="destructive" size="sm">
                              <Ban className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Monitoring Tab */}
        <TabsContent value="ai-monitoring" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  AI Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Total Analyzed</div>
                    <div className="text-2xl font-bold text-gray-900">{aiMetrics.totalAnalyzed.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Accuracy Rate</div>
                    <div className="text-2xl font-bold text-green-600">{aiMetrics.accuracyRate}%</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Bias Score</div>
                    <div className="text-2xl font-bold text-yellow-600">{aiMetrics.biasScore}%</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">False Positives</div>
                    <div className="text-2xl font-bold text-red-600">{aiMetrics.falsePositives}%</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing Time:</span>
                    <span className="font-medium">{aiMetrics.averageProcessingTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Model Version:</span>
                    <span className="font-medium">{aiMetrics.modelVersion}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bias Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-900">Bias Alert</h4>
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">
                      AI showing slight bias toward freelancers in payment disputes (12.5% deviation from neutral).
                    </p>
                    <Button size="sm" variant="outline">
                      Review Training Data
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Freelancer Favor Rate</span>
                        <span>56.3%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '56.3%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Client Favor Rate</span>
                        <span>43.7%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '43.7%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent AI Decisions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDisputes.slice(0, 5).map((dispute) => (
                    <div key={dispute.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          dispute.aiScore < 30 ? 'bg-green-500' : 
                          dispute.aiScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <div className="font-medium text-gray-900">{dispute.title}</div>
                          <div className="text-sm text-gray-500">Score: {dispute.aiScore}/100</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {dispute.aiScore < 30 ? 'Low Risk' : 
                           dispute.aiScore < 70 ? 'Medium Risk' : 'High Risk'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expert Panel Tab */}
        <TabsContent value="expert-panel" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Expert Panel Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Total Experts</div>
                    <div className="text-2xl font-bold text-gray-900">{expertMetrics.totalExperts}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Active Now</div>
                    <div className="text-2xl font-bold text-green-600">{expertMetrics.activeExperts}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Avg Rating</div>
                    <div className="text-2xl font-bold text-yellow-600">{expertMetrics.averageRating}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Consensus Rate</div>
                    <div className="text-2xl font-bold text-blue-600">{expertMetrics.consensusRate}%</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avg Response Time:</span>
                    <span className="font-medium">{expertMetrics.averageResponseTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expert Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium text-green-900">High Performance</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Expert panel maintaining 92.1% consensus rate with average 4.7/5 rating.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Decision Accuracy</span>
                        <span>94.2%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Response Time</span>
                        <span>85.7%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85.7%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Dispute Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Monthly Growth</h4>
                    <p className="text-2xl font-bold text-blue-600">+12.3%</p>
                    <p className="text-sm text-blue-700">Compared to last month</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Payment Issues</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quality Issues</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Scope Issues</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">78%</div>
                      <div className="text-sm text-green-700">Favor Freelancer</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">22%</div>
                      <div className="text-sm text-blue-700">Favor Client</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg Resolution Time:</span>
                      <span className="font-medium">4.2 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Appeal Rate:</span>
                      <span className="font-medium">3.1%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Satisfaction Score:</span>
                      <span className="font-medium">4.6/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 