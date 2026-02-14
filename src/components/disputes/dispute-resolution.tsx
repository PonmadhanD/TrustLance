'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  Users, 
  Shield, 
  Gavel, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  FileText,
  TrendingUp
} from 'lucide-react';

interface DisputeResolutionProps {
  disputeId: string;
  projectId: string;
}

interface AIAnalysis {
  riskScore: number;
  confidence: number;
  suggestedOutcome: 'FREELANCER' | 'CLIENT' | 'PARTIAL';
  reasoning: string;
  evidenceScore: number;
}

interface ExpertVote {
  expertId: string;
  expertName: string;
  vote: 'FREELANCER' | 'CLIENT' | 'PARTIAL';
  reasoning: string;
  expertise: string;
}

export function DisputeResolution({ disputeId, projectId }: DisputeResolutionProps) {
  const [currentLayer, setCurrentLayer] = useState<'AI' | 'EXPERT' | 'ADMIN'>('AI');
  const [aiAnalysis] = useState<AIAnalysis>({
    riskScore: 25,
    confidence: 87,
    suggestedOutcome: 'FREELANCER',
    reasoning: 'Timeline analysis shows milestone was completed on time with proper deliverables. Client acknowledgment found in chat logs. No evidence of quality issues.',
    evidenceScore: 92
  });
  
  const [expertVotes] = useState<ExpertVote[]>([
    {
      expertId: 'exp1',
      expertName: 'Sarah Mitchell',
      vote: 'FREELANCER',
      reasoning: 'Work meets specifications. Client approved deliverables before dispute.',
      expertise: 'Web Development'
    },
    {
      expertId: 'exp2', 
      expertName: 'David Chen',
      vote: 'FREELANCER',
      reasoning: 'Contract terms clearly met. Payment release justified.',
      expertise: 'Contract Law'
    },
    {
      expertId: 'exp3',
      expertName: 'Maria Rodriguez', 
      vote: 'PARTIAL',
      reasoning: 'Minor scope additions warrant 80% payment to freelancer.',
      expertise: 'Payment Disputes'
    }
  ]);

  const [adminDecision, setAdminDecision] = useState<'FREELANCER' | 'CLIENT' | 'PARTIAL' | null>(null);
  const [adminReasoning, setAdminReasoning] = useState('');

  const getVoteCount = () => {
    const counts = { FREELANCER: 0, CLIENT: 0, PARTIAL: 0 };
    expertVotes.forEach(vote => counts[vote.vote]++);
    return counts;
  };

  const getMajorityVote = () => {
    const counts = getVoteCount();
    return Object.entries(counts).reduce((a, b) => counts[a[0] as keyof typeof counts] > counts[b[0] as keyof typeof counts] ? a : b)[0];
  };

  const handleAdminDecision = () => {
    if (adminDecision && adminReasoning.trim()) {
      console.log('Admin decision:', { decision: adminDecision, reasoning: adminReasoning });
      // Execute decision logic here
    }
  };

  return (
    <div className="space-y-6">
      {/* Layer Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-6 w-6 text-blue-600" />
            Three-Layer Dispute Resolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button
              variant={currentLayer === 'AI' ? 'default' : 'outline'}
              onClick={() => setCurrentLayer('AI')}
              className="flex items-center gap-2"
            >
              <Bot className="h-4 w-4" />
              Layer 1: AI Analysis
            </Button>
            <Button
              variant={currentLayer === 'EXPERT' ? 'default' : 'outline'}
              onClick={() => setCurrentLayer('EXPERT')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Layer 2: Expert Jury
            </Button>
            <Button
              variant={currentLayer === 'ADMIN' ? 'default' : 'outline'}
              onClick={() => setCurrentLayer('ADMIN')}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Layer 3: Admin Decision
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Layer 1: AI Analysis */}
      {currentLayer === 'AI' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              AI Dispute Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Analysis Complete</h4>
              </div>
              <p className="text-sm text-blue-700">
                AI has analyzed contract terms, timeline, communications, and evidence with {aiAnalysis.confidence}% confidence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{aiAnalysis.riskScore}/100</div>
                    <div className="text-sm text-gray-600">Risk Score</div>
                    <div className="text-xs text-gray-500 mt-1">Low Risk</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{aiAnalysis.confidence}%</div>
                    <div className="text-sm text-gray-600">Confidence</div>
                    <div className="text-xs text-gray-500 mt-1">High Confidence</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{aiAnalysis.evidenceScore}%</div>
                    <div className="text-sm text-gray-600">Evidence Score</div>
                    <div className="text-xs text-gray-500 mt-1">Strong Evidence</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">AI Recommendation</h4>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-800">
                  Favor {aiAnalysis.suggestedOutcome}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{aiAnalysis.reasoning}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-xs text-yellow-700">
                  <strong>Note:</strong> AI analysis is advisory only. Final decisions require human expert review.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layer 2: Expert Jury */}
      {currentLayer === 'EXPERT' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Expert Freelancer Jury
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Jury Consensus</h4>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-green-700">
                  <strong>Majority Vote:</strong> {getMajorityVote()}
                </div>
                <div className="text-xs text-green-600">
                  {expertVotes.filter(v => v.vote === getMajorityVote()).length}/{expertVotes.length} experts agree
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {expertVotes.map((vote) => (
                <Card key={vote.expertId} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{vote.expertName}</div>
                        <div className="text-sm text-gray-600">{vote.expertise} Expert</div>
                      </div>
                      <Badge className={
                        vote.vote === 'FREELANCER' ? 'bg-green-100 text-green-800' :
                        vote.vote === 'CLIENT' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {vote.vote}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{vote.reasoning}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Vote Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(getVoteCount()).map(([vote, count]) => (
                  <div key={vote} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Favor {vote}:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(count / expertVotes.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layer 3: Admin Decision */}
      {currentLayer === 'ADMIN' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Admin Final Authority
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Review Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">AI Recommendation:</span>
                  <span className="ml-2 font-medium">{aiAnalysis.suggestedOutcome}</span>
                </div>
                <div>
                  <span className="text-blue-700">Expert Majority:</span>
                  <span className="ml-2 font-medium">{getMajorityVote()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Final Decision</Label>
                <RadioGroup value={adminDecision || ''} onValueChange={(value) => setAdminDecision(value as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FREELANCER" id="admin-freelancer" />
                    <Label htmlFor="admin-freelancer">Favor Freelancer - Release Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CLIENT" id="admin-client" />
                    <Label htmlFor="admin-client">Favor Client - Refund Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PARTIAL" id="admin-partial" />
                    <Label htmlFor="admin-partial">Partial Settlement</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="admin-reasoning" className="text-base font-medium">
                  Admin Reasoning (Required)
                </Label>
                <Textarea
                  id="admin-reasoning"
                  value={adminReasoning}
                  onChange={(e) => setAdminReasoning(e.target.value)}
                  placeholder="Provide detailed reasoning for the final decision, considering AI analysis and expert votes..."
                  className="min-h-24 mt-2"
                />
              </div>

              <Button 
                onClick={handleAdminDecision}
                disabled={!adminDecision || !adminReasoning.trim()}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Gavel className="h-4 w-4 mr-2" />
                Execute Final Decision
              </Button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-xs text-red-700">
                  <strong>Warning:</strong> Admin decisions are final and will immediately execute payment/refund actions. This action cannot be undone.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 