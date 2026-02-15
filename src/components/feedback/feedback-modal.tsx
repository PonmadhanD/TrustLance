// Feedback Modal Component
// Two-step modal for collecting feedback from clients/freelancers after project completion

"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { StarRating } from './star-rating';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

interface FeedbackModalProps {
    open: boolean;
    onClose: () => void;
    contractId: string;
    role: 'client' | 'freelancer';
    counterpartyName: string;
    projectTitle: string;
}

interface CriteriaRatings {
    communication: number;
    quality?: number; // for freelancer
    timeliness?: number; // for freelancer
    professionalism?: number; // for freelancer
    clarity?: number; // for client
    paymentTimeliness?: number; // for client
    overall?: number; // for client
}

export function FeedbackModal({
    open,
    onClose,
    contractId,
    role,
    counterpartyName,
    projectTitle
}: FeedbackModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Step 1: Counterparty feedback
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [wouldWorkAgain, setWouldWorkAgain] = useState<boolean | null>(null);
    const [criteriaRatings, setCriteriaRatings] = useState<CriteriaRatings>({
        communication: 0,
        ...(role === 'client' ? {
            quality: 0,
            timeliness: 0,
            professionalism: 0
        } : {
            clarity: 0,
            paymentTimeliness: 0,
            overall: 0
        })
    });

    // Step 2: Platform feedback
    const [platformRating, setPlatformRating] = useState(0);
    const [platformComment, setPlatformComment] = useState('');

    const isStep1Valid = rating > 0 && review.trim().length > 10;
    const isStep2Valid = platformRating > 0; // Platform comment is optional

    const handleNext = () => {
        if (step === 1 && isStep1Valid) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async () => {
        if (!isStep1Valid || !isStep2Valid) {
            toast({
                title: "Validation Error",
                description: "Please complete all required fields",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/feedback/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractId,
                    feedbackType: role === 'client' ? 'freelancer' : 'client',
                    rating,
                    review,
                    wouldWorkAgain,
                    criteriaRatings,
                    platformFeedback: {
                        rating: platformRating,
                        comment: platformComment
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Thank you!",
                    description: "Your feedback has been submitted successfully.",
                });
                onClose();
                // Optionally refresh the page or update UI
                window.location.reload();
            } else {
                toast({
                    title: "Submission Failed",
                    description: data.error || "Failed to submit feedback. Please try again.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast({
                title: "Error",
                description: "An error occurred. Please try again later.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => {
        const isRatingFreelancer = role === 'client';

        return (
            <div className="space-y-6">
                <div>
                    <DialogHeader>
                        <DialogTitle>
                            Rate {isRatingFreelancer ? 'Freelancer' : 'Client'}
                        </DialogTitle>
                        <DialogDescription>
                            Share your experience working with {counterpartyName} on "{projectTitle}"
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Overall Rating */}
                <div className="space-y-2">
                    <Label>Overall Rating *</Label>
                    <StarRating
                        value={rating}
                        onChange={setRating}
                        size="lg"
                        showValue
                    />
                </div>

                {/* Criteria Ratings */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Rate the following:</Label>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Communication</span>
                            <StarRating
                                value={criteriaRatings.communication}
                                onChange={(val) => setCriteriaRatings(prev => ({ ...prev, communication: val }))}
                                size="sm"
                                showValue={false}
                            />
                        </div>

                        {isRatingFreelancer ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Quality of Work</span>
                                    <StarRating
                                        value={criteriaRatings.quality || 0}
                                        onChange={(val) => setCriteriaRatings(prev => ({ ...prev, quality: val }))}
                                        size="sm"
                                        showValue={false}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Timeliness</span>
                                    <StarRating
                                        value={criteriaRatings.timeliness || 0}
                                        onChange={(val) => setCriteriaRatings(prev => ({ ...prev, timeliness: val }))}
                                        size="sm"
                                        showValue={false}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Professionalism</span>
                                    <StarRating
                                        value={criteriaRatings.professionalism || 0}
                                        onChange={(val) => setCriteriaRatings(prev => ({ ...prev, professionalism: val }))}
                                        size="sm"
                                        showValue={false}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Clarity of Requirements</span>
                                    <StarRating
                                        value={criteriaRatings.clarity || 0}
                                        onChange={(val) => setCriteriaRatings(prev => ({ ...prev, clarity: val }))}
                                        size="sm"
                                        showValue={false}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Payment Timeliness</span>
                                    <StarRating
                                        value={criteriaRatings.paymentTimeliness || 0}
                                        onChange={(val) => setCriteriaRatings(prev => ({ ...prev, paymentTimeliness: val }))}
                                        size="sm"
                                        showValue={false}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Overall Experience</span>
                                    <StarRating
                                        value={criteriaRatings.overall || 0}
                                        onChange={(val) => setCriteriaRatings(prev => ({ ...prev, overall: val }))}
                                        size="sm"
                                        showValue={false}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                    <Label htmlFor="review">
                        Write a review * <span className="text-xs text-gray-500">(minimum 10 characters)</span>
                    </Label>
                    <Textarea
                        id="review"
                        placeholder={`Share your experience working with ${counterpartyName}...`}
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                    <p className="text-xs text-gray-500">
                        {review.length}/500 characters
                    </p>
                </div>

                {/* Would Work Again */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="workAgain"
                        checked={wouldWorkAgain === true}
                        onCheckedChange={(checked) => setWouldWorkAgain(checked as boolean)}
                    />
                    <Label htmlFor="workAgain" className="text-sm font-normal cursor-pointer">
                        I would work with {counterpartyName} again
                    </Label>
                </div>

                {/* Helper Text */}
                <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
                    💡 Your review helps keep the marketplace safe and transparent for everyone.
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleNext} disabled={!isStep1Valid || loading}>
                        Next: Rate Platform
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderStep2 = () => {
        return (
            <div className="space-y-6">
                <div>
                    <DialogHeader>
                        <DialogTitle>Rate TrustLance Platform</DialogTitle>
                        <DialogDescription>
                            Help us improve by sharing your experience with the platform
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Platform Rating */}
                <div className="space-y-2">
                    <Label>How was your experience using TrustLance? *</Label>
                    <StarRating
                        value={platformRating}
                        onChange={setPlatformRating}
                        size="lg"
                        showValue
                    />
                </div>

                {/* Platform Comment */}
                <div className="space-y-2">
                    <Label htmlFor="platformComment">
                        Additional comments <span className="text-xs text-gray-500">(optional)</span>
                    </Label>
                    <Textarea
                        id="platformComment"
                        placeholder="Tell us what you liked or how we can improve..."
                        value={platformComment}
                        onChange={(e) => setPlatformComment(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-between gap-3 pt-4">
                    <Button variant="outline" onClick={handleBack} disabled={loading}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={handleSubmit} disabled={loading}>
                            Skip Platform Feedback
                        </Button>
                        <Button onClick={handleSubmit} disabled={!isStep2Valid || loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Feedback'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !loading && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className={`h-2 w-2 rounded-full ${step === 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                    <div className="h-0.5 w-8 bg-gray-300" />
                    <div className={`h-2 w-2 rounded-full ${step === 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                </div>

                {step === 1 ? renderStep1() : renderStep2()}
            </DialogContent>
        </Dialog>
    );
}
