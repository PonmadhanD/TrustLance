'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  FileText,
  ExternalLink,
  Users,
  Gavel
} from 'lucide-react';
import { PaymentManager, ContractState, PaymentMethod, Project } from '@/lib/payments/payment-manager';
import { useWallet } from '@/contexts/wallet-context';

interface ProjectLifecycleProps {
  projectId: string;
  paymentMethod: PaymentMethod;
}

export function ProjectLifecycle({ projectId, paymentMethod }: ProjectLifecycleProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useWallet();
  const paymentManager = new PaymentManager();

  useEffect(() => {
    loadProject();
  }, [projectId, paymentMethod]);

  const loadProject = async () => {
    try {
      const projectData = await paymentManager.getProjectStatus(projectId, paymentMethod);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: ContractState) => {
    switch (state) {
      case 'CREATED': return 'bg-gray-100 text-gray-800';
      case 'FUNDED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'DISPUTED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStateIcon = (state: ContractState) => {
    switch (state) {
      case 'CREATED': return <FileText className="h-4 w-4" />;
      case 'FUNDED': return <Shield className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4" />;
      case 'DISPUTED': return <AlertTriangle className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (state: ContractState) => {
    switch (state) {
      case 'CREATED': return 10;
      case 'FUNDED': return 25;
      case 'IN_PROGRESS': return 50;
      case 'DISPUTED': return 75;
      case 'COMPLETED': return 100;
      case 'CANCELLED': return 0;
      default: return 0;
    }
  };

  const handleAction = async (action: string) => {
    if (!project || !user) return;

    const provider = paymentManager.getProvider(project.paymentMethod);

    try {
      switch (action) {
        case 'DEPOSIT':
          await provider.depositFunds(projectId, project.totalAmount);
          break;
        case 'SUBMIT':
          await provider.submitMilestone(projectId, project.milestones[0]?.id);
          break;
        case 'APPROVE':
          await provider.approveMilestone(projectId, project.milestones[0]?.id);
          break;
        case 'DISPUTE':
          await provider.raiseDispute(projectId, 'Payment issue');
          break;
        case 'CANCEL':
          await provider.cancelContract(projectId);
          break;
      }

      await loadProject();
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  if (!project) {
    return <div className="text-center text-gray-500">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-600" />
              Project #{project.id}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStateColor(project.contractState)}>
                {getStateIcon(project.contractState)}
                <span className="ml-1">{project.contractState}</span>
              </Badge>
              <Badge variant="outline">
                {project.paymentMethod}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Contract Progress</span>
                <span>{getProgressPercentage(project.contractState)}%</span>
              </div>
              <Progress value={getProgressPercentage(project.contractState)} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Total: ${project.totalAmount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Created: {project.createdAt}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span>Last Activity: {project.lastActivity}</span>
              </div>
            </div>

            {project.contractAddress && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Smart Contract</div>
                    <code className="text-xs text-gray-600">{project.contractAddress}</code>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {project.paypalOrderId && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-700">PayPal Order</div>
                    <code className="text-xs text-blue-600">{project.paypalOrderId}</code>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user?.walletAddress === project.clientWallet && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Client Actions</h4>

                {project.contractState === 'CREATED' && (
                  <Button
                    onClick={() => handleAction('DEPOSIT')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Deposit Funds
                  </Button>
                )}

                {project.contractState === 'IN_PROGRESS' && (
                  <Button
                    onClick={() => handleAction('APPROVE')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Milestone
                  </Button>
                )}

                {(project.contractState === 'FUNDED' || project.contractState === 'CREATED') && (
                  <Button
                    onClick={() => handleAction('CANCEL')}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel Contract
                  </Button>
                )}
              </div>
            )}

            {user?.walletAddress === project.freelancerWallet && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Freelancer Actions</h4>

                {project.contractState === 'FUNDED' && (
                  <Button
                    onClick={() => handleAction('SUBMIT')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Milestone
                  </Button>
                )}
              </div>
            )}

            {(user?.walletAddress === project.clientWallet || user?.walletAddress === project.freelancerWallet) &&
              project.contractState === 'IN_PROGRESS' && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Dispute Resolution</h4>
                  <Button
                    onClick={() => handleAction('DISPUTE')}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Gavel className="h-4 w-4 mr-2" />
                    Raise Dispute
                  </Button>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{milestone.description}</div>
                  <div className="text-sm text-gray-600">${milestone.amount}</div>
                </div>
                <Badge variant="outline" className={
                  milestone.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    milestone.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
                      milestone.status === 'DISPUTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                }>
                  {milestone.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Timeout Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• Client inactive 7 days → Freelancer can escalate</div>
            <div>• Freelancer inactive 7 days → Client can cancel</div>
            <div>• Dispute {'>'} 14 days → Admin auto-decision</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 