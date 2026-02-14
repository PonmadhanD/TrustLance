"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Star,
  Calendar,
  Quote,
  User,
  Briefcase
} from "lucide-react";

interface Project {
  id: number;
  title: string;
  clientName: string;
  completionDate: string;
  amount: number;
}

interface Review {
  id: string;
  rating: number;
  feedback: string;
  user: {
    name: string;
    avatar_url?: string;
    role: string;
  };
  project?: {
    title: string;
  };
}

const initialProjects: Project[] = [
  // Empty by default - will show empty state
];

const supabase = createClient();

export default function FeedbackPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: ""
  });

  const handleLeaveFeedback = (project: Project) => {
    setSelectedProject(project);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    console.log("Submitting feedback:", feedback);
    // TODO: Implement actual submission logic
    setShowFeedbackModal(false);
  };

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select(`
            id,
            rating,
            feedback,
            user:reviewer_id (
              name,
              avatar_url,
              role
            ),
            project:project_id (
              title
            )
          `);

        if (error) {
          console.error("Error fetching reviews:", JSON.stringify(error, null, 2));
          // If the error is an abort error, we might want to ignore it
          return;
        }

        if (data) {
          // Transform data to match Review interface if necessary
          const processedData = (data as any[]).map(review => ({
            ...review,
            user: {
              ...review.user,
              // Use actual role from DB, default to 'unknown' if missing. NO RANDOM FALLBACK.
              role: review.user?.role?.toLowerCase() || 'unknown'
            }
          }));

          setReviews(processedData);
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
          console.log('Fetch aborted');
        } else {
          console.error("Unexpected error fetching reviews:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  // Filter reviews based on tab
  // If tab is 'freelancer', show reviews written by CLIENTS (Review of Freelancer)
  // If tab is 'client', show reviews written by FREELANCERS (Review of Client)
  const getFilteredReviews = (tabVal: string) => {
    return reviews.filter(review => {
      const role = review.user.role;
      if (tabVal === 'freelancer') return role === 'client';
      if (tabVal === 'client') return role === 'freelancer';
      return false;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Feedback</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trusted by thousands of freelancers and clients worldwide.
          </p>
        </div>

        <Tabs defaultValue="freelancer" className="w-full mb-8">
          <div className="flex justify-center mb-10">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 p-1 bg-gray-200/50 rounded-xl h-14">
              <TabsTrigger
                value="freelancer"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm h-full font-medium transition-all"
              >
                For Freelancers
              </TabsTrigger>
              <TabsTrigger
                value="client"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm h-full font-medium transition-all"
              >
                For Clients
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="freelancer" className="mt-0 space-y-8 animate-in fade-in-50 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800">What Clients Say About Our Freelancers</h2>
              <p className="text-gray-500 mt-2">Read reviews from clients who have hired freelancers on TrustLance.</p>
            </div>
            <ReviewsGrid loading={loading} reviews={getFilteredReviews('freelancer')} />
          </TabsContent>

          <TabsContent value="client" className="mt-0 space-y-8 animate-in fade-in-50 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800">What Freelancers Say About Our Clients</h2>
              <p className="text-gray-500 mt-2">Read reviews from freelancers about their experience working with clients.</p>
            </div>
            <ReviewsGrid loading={loading} reviews={getFilteredReviews('client')} />
          </TabsContent>
        </Tabs>

        {/* Feedback Modal */}
        {showFeedbackModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Leave Feedback</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedProject.title}</h4>
                  <p className="text-sm text-gray-600">Client: {selectedProject.clientName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                        className={`p-1 ${star <= feedback.rating ? "text-yellow-500" : "text-gray-300"
                          }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={feedback.comment}
                    onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Share your experience working with this client..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitFeedback}>
                  Submit Feedback
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ReviewsGrid({ loading, reviews }: { loading: boolean, reviews: Review[] }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900">No reviews yet</h3>
        <p className="text-gray-500 mt-2">Check back later for community feedback.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.map((review) => (
        <Card key={review.id} className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white relative overflow-hidden h-full flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Quote className="h-24 w-24 text-blue-600 transform rotate-12" />
          </div>

          <CardContent className="p-8 relative z-10 flex flex-col h-full">
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>

            <p className="text-gray-700 text-lg italic mb-6 leading-relaxed flex-grow">
              "{review.feedback}"
            </p>

            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-100">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarImage src={review.user.avatar_url} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                  {review.user.name ? review.user.name.charAt(0) : '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-gray-900">{review.user.name}</h4>
                <div className="text-sm text-gray-500 flex flex-col">
                  <span className="capitalize font-medium text-blue-600">{review.user.role}</span>
                  {review.project && (
                    <span className="text-xs text-gray-400 mt-0.5 truncate max-w-[150px]">
                      Project: {review.project.title}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 