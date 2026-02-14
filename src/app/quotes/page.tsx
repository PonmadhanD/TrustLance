'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Calendar, Coins, User, Eye, Edit, Trash2 } from 'lucide-react';

const quotes = [
  {
    id: 1,
    title: "E-commerce Website Development",
    client: "TechCorp Inc.",
    amount: 2500,
    currency: "SHM",
    status: "Pending",
    createdDate: "2024-01-15",
    validUntil: "2024-02-15",
    description: "Complete e-commerce solution with payment integration"
  },
  {
    id: 2,
    title: "Mobile App UI/UX Design",
    client: "StartupXYZ",
    amount: 4200,
    currency: "SHM",
    status: "Accepted",
    createdDate: "2024-01-10",
    validUntil: "2024-02-10",
    description: "Modern mobile app design for iOS and Android"
  },
  {
    id: 3,
    title: "Logo Design & Branding",
    client: "Creative Agency",
    amount: 800,
    currency: "SHM",
    status: "Rejected",
    createdDate: "2024-01-05",
    validUntil: "2024-02-05",
    description: "Complete brand identity package"
  }
];



export default function QuotesPage() {
  const [selectedTab, setSelectedTab] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    if (selectedTab === 'all') return true;
    return quote.status.toLowerCase() === selectedTab;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
            <p className="text-gray-600 mt-2">Manage your project quotes and proposals</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create New Quote
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                  <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Coins className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quotes.reduce((sum, quote) => sum + quote.amount, 0).toLocaleString()} SHM
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quotes.filter(q => q.status === 'Pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quotes.filter(q => q.status === 'Accepted').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['all', 'pending', 'accepted', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${selectedTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab} ({tab === 'all' ? quotes.length : quotes.filter(q => q.status.toLowerCase() === tab).length})
              </button>
            ))}
          </nav>
        </div>

        {/* Quotes List */}
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{quote.title}</h3>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {quote.client}
                      </div>
                      <div className="flex items-center">
                        <Coins className="h-4 w-4 mr-2" />
                        {quote.amount.toLocaleString()} {quote.currency}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Valid until {new Date(quote.validUntil).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="text-gray-700">{quote.description}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
            <p className="text-gray-600 mb-4">
              {selectedTab === 'all'
                ? "You haven't created any quotes yet."
                : `No ${selectedTab} quotes found.`}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Quote
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 