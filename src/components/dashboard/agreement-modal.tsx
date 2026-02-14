"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SignaturePad } from "./signature-pad";
import {
    FileCheck,
    ShieldCheck,
    Download,
    AlertTriangle,
    FileText,
    Calendar,
    Wallet,
    Hash
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface AgreementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSign: (signature: string) => void;
    data: {
        clientName: string;
        clientWallet: string;
        freelancerName: string;
        freelancerWallet: string;
        projectId: string;
        projectTitle: string;
        projectDescription: string;
        milestones: Array<{ title: string; description: string; tokens: number }>;
    };
    userRole: 'client' | 'freelancer';
}

export function AgreementModal({ isOpen, onClose, onSign, data, userRole }: AgreementModalProps) {
    const [signature, setSignature] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSign = () => {
        if (signature) {
            onSign(signature);
        }
    };

    const generatePDF = () => {
        setIsGenerating(true);
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text("Digital Freelance Service Agreement", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text("(Smart Contract & Token-Based Payment)", pageWidth / 2, 26, { align: "center" });

        // Table of Parties
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("1. Parties Involved", 20, 40);

        autoTable(doc, {
            startY: 45,
            head: [['Field', 'Value']],
            body: [
                ['Client Name', data.clientName],
                ['Client Wallet', data.clientWallet],
                ['Freelancer Name', data.freelancerName],
                ['Freelancer Wallet', data.freelancerWallet],
                ['Project ID', data.projectId],
                ['Date', format(new Date(), 'PPP')]
            ],
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] }
        });

        // Project Scope
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.text("2. Project Scope", 20, finalY);
        doc.setFontSize(10);
        doc.text(`Title: ${data.projectTitle}`, 20, finalY + 7);
        const splitDesc = doc.splitTextToSize(`Description: ${data.projectDescription}`, pageWidth - 40);
        doc.text(splitDesc, 20, finalY + 14);

        // Milestones Table
        const milestoneY = finalY + 20 + (splitDesc.length * 5);
        doc.setFontSize(12);
        doc.text("4. Milestone Structure", 20, milestoneY);

        autoTable(doc, {
            startY: milestoneY + 5,
            head: [['Milestone', 'Description', 'Tokens']],
            body: data.milestones.map((m, i) => [`M${i + 1}: ${m.title}`, m.description, m.tokens]),
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] } // blue-600
        });

        // Agreement Text (Summary)
        const termsY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(12);
        doc.text("Terms & Conditions Summary", 20, termsY);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const terms = "By signing this document, both parties agree to the token-based payment model, AI-assisted dispute resolution, and intellectual property transfer upon full payment as outlined in the platform's terms of service.";
        doc.text(doc.splitTextToSize(terms, pageWidth - 40), 20, termsY + 7);

        // Signatures
        const sigY = termsY + 25;
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text("Client Signature", 20, sigY);
        doc.text("Freelancer Signature", pageWidth / 2 + 10, sigY);

        if (signature && userRole === 'client') {
            doc.addImage(signature, 'PNG', 20, sigY + 5, 40, 20);
        }
        // Note: In real app, you'd fetch both signatures if available

        doc.save(`Agreement-${data.projectId}.pdf`);
        setIsGenerating(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 bg-white border-none shadow-2xl overflow-hidden rounded-[32px]">
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldCheck className="h-24 w-24" />
                    </div>
                    <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <FileCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-white leading-tight">
                                    Digital Service Agreement
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                    Legally binding smart-contract terms
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Agreement Text */}
                    <div className="p-8 border-r border-slate-100 h-[500px] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Content</span>
                            <Button variant="ghost" size="sm" onClick={generatePDF} disabled={isGenerating} className="h-7 text-[10px] font-bold text-blue-600">
                                <Download className="h-3 w-3 mr-1" />
                                Preview PDF
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
                                <section>
                                    <h4 className="font-black text-slate-900 uppercase mb-2">1. Parties & Project</h4>
                                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Project ID</span>
                                            <span className="font-bold text-slate-700">{data.projectId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Client</span>
                                            <span className="font-bold text-slate-700">{data.clientName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Freelancer</span>
                                            <span className="font-bold text-slate-700">{data.freelancerName}</span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="font-black text-slate-900 uppercase mb-2">2. Token-Based Payment</h4>
                                    <p>Payments are made using platform tokens (1 Token = ₹10). Tokens are locked in a smart contract and released only on milestone approval. The platform does not hold real money during execution.</p>
                                </section>

                                <section>
                                    <h4 className="font-black text-slate-900 uppercase mb-2">3. Milestone Structure</h4>
                                    <div className="space-y-2">
                                        {data.milestones.map((m, i) => (
                                            <div key={i} className="flex gap-3 items-center p-2 rounded-lg bg-blue-50/50 border border-blue-100/50">
                                                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-800 truncate">{m.title}</div>
                                                    <div className="text-[10px] text-slate-500 line-clamp-1">{m.description}</div>
                                                </div>
                                                <div className="font-black text-blue-700 whitespace-nowrap">{m.tokens} TRT</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="font-black text-slate-900 uppercase mb-2">4. Dispute & Termination</h4>
                                    <p>Step 1: AI-Based Review. Step 2: Mutual Acceptance. Step 3: Human Arbitration by platform experts. Either party may terminate by mutual consent or arbitrator decision.</p>
                                </section>

                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 mt-4">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                                    <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                                        By signing, you acknowledge that blockchain records act as final proof of transaction.
                                    </p>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Signature Area */}
                    <div className="p-8 bg-slate-50/30 flex flex-col justify-center">
                        <div className="mb-8">
                            <h3 className="text-lg font-black text-slate-900 mb-1">Affix your Signature</h3>
                            <p className="text-xs text-slate-500 font-medium">Please sign clearly within the box below.</p>
                        </div>

                        <SignaturePad
                            onSave={setSignature}
                            onClear={() => setSignature(null)}
                            label={`${userRole === 'client' ? 'Client' : 'Freelancer'} Digital Signature`}
                        />

                        <div className="mt-8 space-y-3">
                            <Button
                                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200"
                                disabled={!signature}
                                onClick={handleSign}
                            >
                                Confirm & Digital Sign
                            </Button>
                            <Button variant="ghost" className="w-full h-12 text-slate-400 font-bold" onClick={onClose}>
                                Review Later
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
