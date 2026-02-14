"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

export function PostProjectForm() {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center space-y-2">
        <div className="text-2xl font-bold text-blue-600">TrustLance</div>
        <h1 className="text-2xl font-semibold">Tell us what you need done</h1>
        <p className="text-muted-foreground text-sm">
          Get free quotes from skilled freelancers within minutes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Describe your project in detail
          </Label>
          <Textarea
            id="description"
            placeholder="e.g. I need a modern website designed for my restaurant business. It should include an online menu, reservation system, and contact information. The design should be mobile-friendly and professional."
            className="min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Be as specific as possible to get the best quotes
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-sm">What happens next?</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-medium">Get free quotes</span>
                <p className="text-muted-foreground text-xs">Receive proposals from skilled freelancers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-medium">Compare & hire</span>
                <p className="text-muted-foreground text-xs">Review profiles and choose the best freelancer</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-medium">Pay when satisfied</span>
                <p className="text-muted-foreground text-xs">Release payment only when work is completed</p>
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700" size="lg">
          Get Free Quotes
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          It's free to post a project and you'll get quotes within minutes
        </p>
      </CardContent>
    </Card>
  );
}
 