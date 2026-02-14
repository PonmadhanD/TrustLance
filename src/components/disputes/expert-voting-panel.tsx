'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  FileText, 
  DollarSign, 
  AlertTriangle,
  Shield,
  Gavel,
  MessageSquare,
  Eye,
  Download
} from 'lucide-react';

interface ExpertVotingProps {
  disputeId: string;
  disputeTitle: string;
  amount: number;
  evidence: any[];
  aiRecommendation: string;
  onVoteSubmit: (vote: string, reasoning: string) => void;
}

export function ExpertVotingPanel({ 
  disputeId, 
  disputeTitle, 
  amount, 
  evidence, 
  aiRecommendation, 
  onVoteSubmit 
}: ExpertVotingProps) {
  const [selectedVote, setSelectedVote] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const voteOptions = [
    {
      value: 'favor_freelancer',
      label: 'Favor Freelancer',
      description: 'Release full payment to freelancer',
      color: 'bg-green-100 text-green-800'
    },
    {
      value: 'favor_client',
      label: 'Favor Client',
      description: 'Refund full amount to client',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      value: 'partial_freelancer',
      label: 'Partial - Favor Freelancer',
      description: 'Release partial payment to freelancer',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      value: 'partial_client',
      label: 'Partial - Favor Client',
      description: 'Partial refund to client',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      value: 'rework_required',
      label: 'Rework Required',
      description: 'Freelancer must complete additional work',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      value: 'insufficient_evidence',
      label: 'Insufficient Evidence',
      description: 'Request additional evidence from both parties',
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  const handleSubmitVote = async () => {
    if (!selectedVote || !reasoning.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onVoteSubmit(selectedVote, reasoning);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gavel className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">Expert Panel Review</CardTitle>
                <p className="text-gray-600">Dispute #{disputeId}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Shield className="h-4 w-4 mr-1" />
              Verified Expert
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Title:</span>
              <span>{disputeTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="font-medium">Amount:</span>
              <span>${amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Evidence:</span>
              <span>{evidence.length} files</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            AI Pre-Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>AI Recommendation:</strong> {aiRecommendation}
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              Note: This is advisory only. Your expert judgment takes precedence.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evidence & Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {evidence.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">{file.name}</div>
                    <div className="text-sm text-gray-500">{file.size} • {file.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voting Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cast Your Vote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={selectedVote} onValueChange={setSelectedVote}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {voteOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                      <Badge className={option.color}>
                        {option.label.split(' - ')[0]}
                      </Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div>
            <Label htmlFor="reasoning" className="text-base font-medium">
              Reasoning & Justification *
            </Label>
            <Textarea
              id="reasoning"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Provide detailed reasoning for your decision. Include analysis of evidence, contract terms, and relevant factors..."
              className="min-h-32 mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Your reasoning will be shared with both parties and used for transparency.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Expert Guidelines</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Review all evidence thoroughly before voting</li>
                  <li>• Consider contract terms and platform policies</li>
                  <li>• Provide clear, objective reasoning</li>
                  <li>• Vote cannot be changed once submitted</li>
                  <li>• Maintain confidentiality of case details</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Your vote will be combined with other expert opinions for final decision.
            </div>
            <Button 
              onClick={handleSubmitVote}
              disabled={!selectedVote || !reasoning.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Vote
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Other Expert Votes (if any) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Panel Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Votes Submitted:</span>
              <span className="text-sm font-semibold">1 of 3</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Sarah Mitchell</div>
                  <div className="text-sm text-gray-600">Web Development Expert</div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Voted
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback>DC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">David Chen</div>
                  <div className="text-sm text-gray-600">Contract Law Expert</div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Reviewing
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Maria Rodriguez</div>
                  <div className="text-sm text-gray-600">Payment Disputes Expert</div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  You
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 