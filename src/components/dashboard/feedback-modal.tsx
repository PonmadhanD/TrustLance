"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    freelancerId: string;
    freelancerName: string;
    projectTitle: string;
}

export function FeedbackModal({
    isOpen,
    onClose,
    projectId,
    freelancerId,
    freelancerName,
    projectTitle
}: FeedbackModalProps) {
    const [step, setStep] = useState(1);
    const [freelancerRating, setFreelancerRating] = useState(0);
    const [siteRating, setSiteRating] = useState(0);
    const [siteFeedback, setSiteFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    freelancerId,
                    freelancerRating,
                    siteRating,
                    siteFeedback
                })
            });

            if (!response.ok) throw new Error('Failed to submit feedback');

            toast({
                title: "Thank you!",
                description: "Your feedback has been submitted successfully.",
            });
            onClose();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to submit feedback. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarRating = ({ rating, setRating }: { rating: number, setRating: (r: number) => void }) => (
        <div className="flex gap-2 justify-center my-4">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                >
                    <Star
                        className={`h-8 w-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                </button>
            ))}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">
                        {step === 1 ? "Rate Freelancer's Work" : "Rate TrustLance"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {step === 1
                            ? `How was your experience working with ${freelancerName} on "${projectTitle}"?`
                            : "How likely are you to recommend TrustLance to a friend?"}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 && (
                        <div className="text-center">
                            <StarRating rating={freelancerRating} setRating={setFreelancerRating} />
                            <p className="text-sm text-gray-500 font-medium mt-2">
                                {freelancerRating === 5 ? "Excellent!" : freelancerRating > 0 ? "Thanks for rating!" : "Tap a star to rate"}
                            </p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <StarRating rating={siteRating} setRating={setSiteRating} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Any feedback for us?</label>
                                <Textarea
                                    placeholder="Tell us what you liked or how we can improve..."
                                    value={siteFeedback}
                                    onChange={(e) => setSiteFeedback(e.target.value)}
                                    className="resize-none h-24"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-between flex-row gap-2">
                    {step === 2 && (
                        <Button variant="ghost" onClick={() => setStep(1)} disabled={isSubmitting}>
                            Back
                        </Button>
                    )}
                    <div className="flex-1 flex justify-end">
                        {step === 1 ? (
                            <Button
                                onClick={() => setStep(2)}
                                disabled={freelancerRating === 0}
                                className="w-full sm:w-auto"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={siteRating === 0 || isSubmitting}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Feedback"}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
