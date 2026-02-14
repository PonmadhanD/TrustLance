// Individual contract page with milestone management
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    ArrowLeft,
    DollarSign,
    Lock,
    AlertCircle,
    CheckCircle,
    Clock,
    Upload,
    Send,
    FileText,
    XCircle,
    Flag,
    AlertTriangle,
    ShieldCheck,
    Download,
    Star,
    MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { AgreementModal } from "@/components/dashboard/agreement-modal";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FeedbackModal } from "@/components/dashboard/feedback-modal";

interface Milestone {
    title: string;
    amount: number;
    description: string;
    duration: string;
}

interface MilestoneSubmission {
    id?: string;
    milestone_index: number;
    proof_of_work_url: string;
    description: string;
    status: 'pending' | 'approved' | 'revision_requested';
    feedback?: string;
    submitted_at?: string;
    reviewed_at?: string;
}

interface ContractMessage {
    id: string;
    sender_id: string;
    message: string;
    created_at: string;
    milestone_index?: number; // Optional context
}

interface Contract {
    id: string;
    project_id: string;
    client_id: string;
    freelancer_id: string;
    total_amount: number;
    locked_amount: number;
    status: string;
    milestones: Milestone[];
    milestone_submissions: MilestoneSubmission[];
    project?: {
        title: string;
        description: string;
        client_signature?: string;
        created_at?: string;
    };
    client?: {
        id: string; // Ensure ID is available
        name: string;
        username: string;
        rating: number;
        wallet_address?: string;
    };
    freelancer?: {
        id: string; // Ensure ID is available
        name: string;
        username: string;
        rating: number;
        wallet_address?: string;
    };
    freelancer_signature?: string;
    freelancer_signed_at?: string;
    client_signature?: string;
    client_signed_at?: string;
    agreement_pdf_url?: string;
}

export default function ContractDetailPage({ params }: { params: Promise<{ contractId: string }> }) {
    const router = useRouter();
    const { user } = useAuth();
    const { contractId } = React.use(params);

    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<number | null>(null);

    // Form states for milestone submission
    const [powUrl, setPowUrl] = useState<Record<number, string>>({});
    const [powDescription, setPowDescription] = useState<Record<number, string>>({});
    const [feedback, setFeedback] = useState<Record<number, string>>({});

    // Chat state
    const [chatMessage, setChatMessage] = useState("");
    const [messages, setMessages] = useState<ContractMessage[]>([]); // In a real app, fetch these

    // Notification state (Toast replacement)
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Dispute State
    const [disputeOpen, setDisputeOpen] = useState(false);
    const [selectedDisputeMilestone, setSelectedDisputeMilestone] = useState<number | null>(null);
    const [disputeReason, setDisputeReason] = useState("");
    const [disputeDomain, setDisputeDomain] = useState("Web Development");

    // Agreement Signing State
    const [showSigningModal, setShowSigningModal] = useState(false);
    const [isSigning, setIsSigning] = useState(false);

    // Feedback State
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const handleRaiseDisputeClick = (index: number | null) => {
        setSelectedDisputeMilestone(index);
        setDisputeOpen(true);
    };

    const submitDispute = async () => {
        try {
            // Default to milestone 0 if none selected (e.g. from header button)
            const milestoneIdx = selectedDisputeMilestone !== null ? selectedDisputeMilestone : 0;

            setSubmitting(999); // distinct ID for dispute loading
            const response = await fetch(`/api/contracts/${contractId}/dispute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    milestoneIndex: milestoneIdx,
                    reason: disputeReason,
                    domain: disputeDomain,
                    amount: contract?.milestones[milestoneIdx]?.amount || 0
                })
            });

            if (response.ok) {
                const data = await response.json();
                showNotification(`Dispute Raised! Arbitrator assigned. ID: ${data.dispute.id}`);
                setDisputeOpen(false);
                fetchContract();
            } else {
                const error = await response.json();
                showNotification(`Failed: ${error.error}`, 'error');
            }
        } catch (error) {
            console.error('Error raising dispute:', error);
            showNotification('Failed to raise dispute', 'error');
        } finally {
            setSubmitting(null);
        }
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
    };

    useEffect(() => {
        if (contractId) {
            fetchContract();
            fetchMessages();
        }
    }, [contractId]);

    const fetchContract = async () => {
        try {
            const response = await fetch(`/api/contracts/${contractId}`);
            if (response.ok) {
                const data = await response.json();
                setContract(data);
            }
        } catch (error) {
            console.error('Error fetching contract:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/contracts/${contractId}/messages`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSubmitPOW = async (milestoneIndex: number) => {
        try {
            setSubmitting(milestoneIndex);
            const response = await fetch(`/api/contracts/${contractId}/milestones/${milestoneIndex}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proof_of_work_url: powUrl[milestoneIndex] || '',
                    description: powDescription[milestoneIndex] || ''
                })
            });

            if (response.ok) {
                showNotification('Proof of work submitted successfully!');
                fetchContract();
                setPowUrl({ ...powUrl, [milestoneIndex]: '' });
                setPowDescription({ ...powDescription, [milestoneIndex]: '' });
                // Also send a system message or auto-notify via chat could be a nice touch, but optional
            } else {
                const error = await response.json();
                showNotification(`Failed: ${error.error}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting POW:', error);
            showNotification('Failed to submit proof of work', 'error');
        } finally {
            setSubmitting(null);
        }
    };

    const handleReleaseFunds = async (milestoneIndex: number) => {
        try {
            setSubmitting(milestoneIndex);
            const response = await fetch(`/api/contracts/${contractId}/milestones/${milestoneIndex}/release`, {
                method: 'POST'
            });

            if (response.ok) {
                const data = await response.json();
                showNotification(data.message);
                fetchContract();

                // Check if this was the last milestone
                const isLastMilestone = milestoneIndex === (contract?.milestones.length || 0) - 1;
                if (isLastMilestone) {
                    setShowFeedbackModal(true);
                }
            } else {
                const error = await response.json();
                showNotification(`Failed: ${error.error}`, 'error');
            }
        } catch (error) {
            console.error('Error releasing funds:', error);
            showNotification('Failed to release funds', 'error');
        } finally {
            setSubmitting(null);
        }
    };

    const handleSendFeedback = async (milestoneIndex: number) => {
        try {
            setSubmitting(milestoneIndex);
            const response = await fetch(`/api/contracts/${contractId}/milestones/${milestoneIndex}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feedback: feedback[milestoneIndex] || ''
                })
            });

            if (response.ok) {
                showNotification('Feedback sent to freelancer');
                fetchContract();
                setFeedback({ ...feedback, [milestoneIndex]: '' });
            } else {
                const error = await response.json();
                showNotification(`Failed: ${error.error}`, 'error');
            }
        } catch (error) {
            console.error('Error sending feedback:', error);
            showNotification('Failed to send feedback', 'error');
        } finally {
            setSubmitting(null);
        }
    };

    const handleSendMessage = async () => {
        if (!chatMessage.trim()) return;

        try {
            const response = await fetch(`/api/contracts/${contractId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: chatMessage
                })
            });

            if (response.ok) {
                fetchMessages();
                setChatMessage("");
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Send failed:", response.status, errorData);
                showNotification(`Send Failed: ${response.status} - ${errorData.error || response.statusText}`, 'error');
            }
        } catch (error: any) {
            console.error('Error sending message:', error);
            showNotification(`Network Error: ${error.message}`, 'error');
        }
    };

    const handleFreelancerSign = async (signature: string) => {
        try {
            setIsSigning(true);
            const response = await fetch(`/api/contracts/${contractId}/sign`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ signature })
            });

            if (response.ok) {
                showNotification('Agreement Digitally Signed!');
                setShowSigningModal(false);
                fetchContract();
            } else {
                const error = await response.json();
                showNotification(`Signing failed: ${error.error}`, 'error');
            }
        } catch (error) {
            console.error('Error signing:', error);
            showNotification('Failed to sign agreement', 'error');
        } finally {
            setIsSigning(false);
        }
    };

    const downloadAgreement = () => {
        if (!contract) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text("Signed Freelance Service Agreement", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on ${format(new Date(), 'PPP')}`, pageWidth / 2, 26, { align: "center" });

        // Parties
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("Project & Parties", 20, 40);

        autoTable(doc, {
            startY: 45,
            head: [['Party', 'Name', 'Wallet Address', 'Signed Date']],
            body: [
                ['Client', contract.client?.name || 'N/A', contract.client?.wallet_address || 'N/A', contract.project?.created_at ? format(new Date(contract.project.created_at), 'PP') : 'N/A'],
                ['Freelancer', contract.freelancer?.name || 'N/A', contract.freelancer?.wallet_address || 'N/A', contract.freelancer_signed_at ? format(new Date(contract.freelancer_signed_at), 'PP') : 'Not Signed Yet']
            ],
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] }
        });

        // Project Info
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.text("Project Details", 20, finalY);
        doc.setFontSize(10);
        doc.text(`Title: ${contract.project?.title}`, 20, finalY + 10);
        const splitDesc = doc.splitTextToSize(`Description: ${contract.project?.description}`, pageWidth - 40);
        doc.text(splitDesc, 20, finalY + 17);

        // Milestones
        const milestoneY = finalY + 25 + (splitDesc.length * 5);
        doc.text("Milestones", 20, milestoneY);
        autoTable(doc, {
            startY: milestoneY + 5,
            head: [['Milestone', 'Amount']],
            body: contract.milestones.map((m, i) => [`M${i + 1}: ${m.title}`, `$${m.amount}`]),
            theme: 'grid'
        });

        // Signatures
        const sigY = (doc as any).lastAutoTable.finalY + 20;
        if (contract.project?.client_signature) {
            doc.text("Client Signature:", 20, sigY);
            doc.addImage(contract.project.client_signature, 'PNG', 20, sigY + 5, 40, 20);
        }
        if (contract.freelancer_signature) {
            doc.text("Freelancer Signature:", pageWidth / 2 + 10, sigY);
            doc.addImage(contract.freelancer_signature, 'PNG', pageWidth / 2 + 10, sigY + 5, 40, 20);
        }

        doc.save(`Signed-Agreement-${contract.id}.pdf`);
    };

    const getMilestoneStatus = (index: number): MilestoneSubmission | null => {
        if (!contract) return null;
        return contract.milestone_submissions?.find(s => s.milestone_index === index) || null;
    };

    const getStatusBadge = (status?: string) => {
        if (!status) return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;

        const variants: Record<string, { color: string; icon: any }> = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            revision_requested: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
        };

        const variant = variants[status] || variants.pending;
        const Icon = variant.icon;

        return (
            <Badge className={`${variant.color} flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const isFreelancer = contract?.freelancer_id === user?.id;
    const isClient = contract?.client_id === user?.id;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <p className="text-center text-gray-600">Loading contract...</p>
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <p className="text-center text-red-600">Contract not found</p>
                </div>
            </div>
        );
    }

    const otherParty = isFreelancer ? contract.client : contract.freelancer;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Contracts
                </Button>

                {/* Contract Header */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-2xl mb-2">{contract.project?.title}</CardTitle>
                                <div className="flex items-center gap-4 mt-1">
                                    <p className="text-gray-600">ID: {contractId.substring(0, 8)}</p>
                                    {contract.freelancer_signature ? (
                                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3" />
                                            Contract Signed
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-amber-600 border-amber-600 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Awaiting Signature
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={downloadAgreement}
                                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Agreement
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => handleRaiseDisputeClick(null)}
                                >
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Raise Dispute
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Dispute Dialog */}
                    <AlertDialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                        <AlertDialogContent className="max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="h-5 w-5" />
                                    Raise a Dispute
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    An arbitrator will be assigned to review this milestone. Please provide details.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Milestone</Label>
                                    <Input disabled value={selectedDisputeMilestone !== null ? contract?.milestones[selectedDisputeMilestone]?.description : 'General Contract Dispute'} />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Domain / Category</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={disputeDomain}
                                        onChange={(e) => setDisputeDomain(e.target.value)}
                                    >
                                        <option value="Web Development">Web Development</option>
                                        <option value="Mobile App">Mobile App</option>
                                        <option value="Design">Design & Creative</option>
                                        <option value="Writing">Writing & Translation</option>
                                    </select>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Reason for Dispute</Label>
                                    <Textarea
                                        placeholder="Describe the issue clearly..."
                                        value={disputeReason}
                                        onChange={(e) => setDisputeReason(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => { e.preventDefault(); submitDispute(); }}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={!disputeReason.trim()}
                                >
                                    Raise Dispute
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Locked Amount */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lock className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">Locked in Escrow</span>
                                </div>
                                <p className="text-3xl font-bold text-blue-600">
                                    ${contract.locked_amount?.toLocaleString()}
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    of ${contract.total_amount?.toLocaleString()} total
                                </p>
                            </div>

                            {/* Other Party Info */}
                            <div className="col-span-2 flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="bg-purple-600 text-white text-xl">
                                        {otherParty?.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {isFreelancer ? 'Client' : 'Freelancer'}
                                    </p>
                                    <h3 className="text-lg font-semibold">{otherParty?.name}</h3>
                                    <p className="text-sm text-gray-600">@{otherParty?.username}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                        <span className="text-sm font-medium">{otherParty?.rating || 5.0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card >

                {/* Milestones */}
                < Card >
                    <CardHeader>
                        <CardTitle>Project Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {contract.milestones?.map((milestone, index) => {
                                const submission = getMilestoneStatus(index);
                                const isApproved = submission?.status === 'approved';
                                const isPending = submission?.status === 'pending';
                                const needsRevision = submission?.status === 'revision_requested';

                                return (
                                    <div key={index} className={`border rounded-lg p-6 ${isApproved ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                                        {/* Milestone Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">
                                                        Milestone {index + 1}: {milestone.title}
                                                    </h3>
                                                    {getStatusBadge(submission?.status)}

                                                    {/* FLAG BUTTON */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50 ml-2"
                                                        title="Raise Dispute on this Milestone"
                                                        onClick={() => handleRaiseDisputeClick(index)}
                                                    >
                                                        <Flag className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4" />
                                                        ${milestone.amount?.toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {milestone.duration}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submission Details */}
                                        {submission && (
                                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                <h4 className="font-medium mb-2">Submitted Work</h4>
                                                <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">{submission.description}</p>
                                                {submission.proof_of_work_url && (
                                                    submission.proof_of_work_url.match(/^(http|https):\/\/[^ "]+$/) ? (
                                                        <a
                                                            href={submission.proof_of_work_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline text-sm flex items-center gap-1 inline-flex"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                            View Proof of Work
                                                        </a>
                                                    ) : (
                                                        <div className="text-sm text-gray-700 bg-gray-100 p-2 rounded flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-gray-500" />
                                                            <span className="font-medium">Link/Ref:</span> {submission.proof_of_work_url}
                                                        </div>
                                                    )
                                                )}
                                                {needsRevision && submission.feedback && (
                                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                                        <p className="text-sm font-medium text-red-900 mb-1">Client Feedback:</p>
                                                        <p className="text-sm text-red-800">{submission.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Freelancer Actions: Submit or Resubmit */}
                                        {isFreelancer && !isApproved && submission?.status !== 'pending' && (
                                            <div className="space-y-3 mt-4">
                                                <div>
                                                    <Label>Proof of Work URL (Link to deliverable)</Label>
                                                    <Input
                                                        value={powUrl[index] || ''}
                                                        onChange={(e) => setPowUrl({ ...powUrl, [index]: e.target.value })}
                                                        placeholder="https://github.com/yourrepo or https://drive.google.com/..."
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Description of Work Done</Label>
                                                    <Textarea
                                                        value={powDescription[index] || ''}
                                                        onChange={(e) => setPowDescription({ ...powDescription, [index]: e.target.value })}
                                                        placeholder="Describe what you completed for this milestone..."
                                                        rows={3}
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button
                                                        onClick={() => handleSubmitPOW(index)}
                                                        disabled={submitting === index || !powUrl[index]}
                                                        className="flex-1"
                                                    >
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        {needsRevision ? 'Resubmit Work' : 'Submit Work'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Freelancer View: Pending Review */}
                                        {isFreelancer && isPending && (
                                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                                                <Clock className="h-5 w-5 text-yellow-600" />
                                                <div>
                                                    <p className="font-semibold text-yellow-900">Waiting for Client Review</p>
                                                    <p className="text-sm text-yellow-800">
                                                        You have submitted your work. The client will review it and release funds or request changes.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Client Actions: Review & Release */}
                                        {isClient && isPending && (
                                            <div className="space-y-4 mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Action Required: Review Submission
                                                </h4>

                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                disabled={submitting === index}
                                                                className="bg-green-600 hover:bg-green-700 flex-1"
                                                            >
                                                                <DollarSign className="h-4 w-4 mr-2" />
                                                                Approve & Release ${milestone.amount?.toLocaleString()}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Release Funds?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to release ${milestone.amount?.toLocaleString()} for Milestone {index + 1}?
                                                                    This action cannot be undone and funds will be transferred to the freelancer's wallet immediately.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleReleaseFunds(index)}
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                >
                                                                    Release Funds
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>

                                                <div className="pt-3 border-t border-blue-200">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Request Changes (Optional)</p>
                                                    <div className="flex gap-2">
                                                        <Textarea
                                                            value={feedback[index] || ''}
                                                            onChange={(e) => setFeedback({ ...feedback, [index]: e.target.value })}
                                                            placeholder="Explain what needs to be improved..."
                                                            rows={2}
                                                            className="bg-white"
                                                        />
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => handleSendFeedback(index)}
                                                            disabled={submitting === index || !feedback[index]}
                                                            className="h-auto"
                                                        >
                                                            <MessageSquare className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Approved State */}
                                        {isApproved && (
                                            <div className="flex items-center gap-2 text-green-700 bg-green-100 p-3 rounded">
                                                <CheckCircle className="h-5 w-5" />
                                                <span className="font-medium">Milestone completed and funds released</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card >

                {/* Contract Chat / Communication */}
                < Card className="mt-6 shadow-sm border-gray-200" >
                    <CardHeader className="pb-3 border-b bg-gray-50/50">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                            Contract Discussion
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Chat Area */}
                        <div className="bg-[#e5e5e5] (bg-opacity-30) h-[400px] overflow-y-auto p-4 flex flex-col gap-3"
                            ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}> {/* Auto-scroll hack */}

                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                                    <MessageSquare className="h-12 w-12 mb-2" />
                                    <p className="text-sm">No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm relative group ${isMe
                                                ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' // WhatsApp-like green for me
                                                : 'bg-white text-gray-800 rounded-tl-none' // White for them
                                                }`}>

                                                {!isMe && <span className="text-[10px] font-bold text-orange-600 block mb-1">
                                                    {contract?.client_id === msg.sender_id ? contract?.client?.name : contract?.freelancer?.name || 'User'}
                                                </span>}

                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>

                                                <span className="text-[9px] text-gray-400 block text-right mt-1 opacity-70">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t flex gap-2 items-end">
                            <Textarea
                                placeholder="Type a message..."
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                className="min-h-[44px] max-h-32 resize-none py-3 px-4 rounded-xl border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500 bg-gray-50"
                            />
                            <Button
                                onClick={handleSendMessage}
                                size="icon"
                                className="h-11 w-11 rounded-full shrink-0 bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                                disabled={!chatMessage.trim()}
                            >
                                <Send className="h-5 w-5 text-white" />
                            </Button>
                        </div>
                    </CardContent>
                </Card >
            </div >

            {/* Notification Toast */}
            {
                notification && (
                    <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-in slide-in-from-top-2 fade-in ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                        <div className="flex items-center gap-2">
                            {notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            {notification.message}
                        </div>
                    </div>
                )
            }

            <AgreementModal
                isOpen={showSigningModal}
                onClose={() => setShowSigningModal(false)}
                onSign={handleFreelancerSign}
                userRole={isClient ? 'client' : 'freelancer'}
                data={{
                    clientName: contract.client?.name || 'Client',
                    clientWallet: contract.client?.wallet_address || '0x...',
                    freelancerName: contract.freelancer?.name || 'Freelancer',
                    freelancerWallet: contract.freelancer?.wallet_address || '0x...',
                    projectId: contract.id,
                    projectTitle: contract.project?.title || '',
                    projectDescription: contract.project?.description || '',
                    milestones: contract.milestones.map(m => ({
                        title: m.title,
                        description: m.description,
                        tokens: Math.round(m.amount / 10) // 1 Token = ₹10
                    }))
                }}
            />

            {/* Sign Prompt for Freelancer OR Client */}
            {((isFreelancer && !contract.freelancer_signature) || (isClient && !contract.client_signature)) && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full border-none shadow-2xl rounded-[32px] overflow-hidden">
                        <div className="bg-blue-600 p-8 text-white text-center">
                            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                                <FileText className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Signature Required</h2>
                            <p className="text-blue-100 text-sm font-bold">You must sign the Digital Service Agreement before proceeding.</p>
                        </div>
                        <CardContent className="p-8 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Legally Binding</p>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">By signing, you agree to the milestone structure, token-based payment model, and intellectual property transfer upon project completion.</p>
                            </div>
                            <Button
                                className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest shadow-xl transition-all"
                                onClick={() => setShowSigningModal(true)}
                                disabled={isSigning}
                            >
                                {isSigning ? "Signing..." : "Proceed to Sign"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Feedback Modal */}
            {contract && (
                <FeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    projectId={contract.project_id}
                    freelancerId={contract.freelancer_id}
                    freelancerName={contract.freelancer?.name || 'Freelancer'}
                    projectTitle={contract.project?.title || 'Project'}
                />
            )}
        </div >
    );
}
