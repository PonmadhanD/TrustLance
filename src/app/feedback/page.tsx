"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import Header from "@/components/layout/header";

interface SiteReview {
  id: string;
  rating: number;
  feedback: string;
  created_at: string;
  user: {
    name: string;
    avatar_url: string;
    role: string;
  };
  project?: {
    title: string;
  };
}

export default function FeedbackPage() {
  const [reviews, setReviews] = useState<SiteReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("site_reviews")
        .select(`
          id,
          rating,
          feedback,
          created_at,
          user:users(name, avatar_url, role),
          project:projects(title)
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setReviews(data as any);
      }
      setLoading(false);
    }

    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trusted by thousands of freelancers and clients worldwide. Here's what they have to say about their experience with TrustLance.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <Card key={review.id} className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Quote className="h-24 w-24 text-blue-600 transform rotate-12" />
                </div>

                <CardContent className="p-8 relative z-10">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 text-lg italic mb-6 leading-relaxed">
                    "{review.feedback}"
                  </p>

                  <div className="flex items-center gap-4 mt-auto">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={review.user.avatar_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                        {review.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-gray-900">{review.user.name}</h4>
                      <div className="text-sm text-gray-500 flex flex-col">
                        <span className="capitalize">{review.user.role}</span>
                        {review.project && (
                          <span className="text-xs text-blue-600 mt-0.5 truncate max-w-[150px]">
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
        )}

        {!loading && reviews.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </main>
    </div>
  );
}