"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  MessageCircle,
  Share2,
  Users,
  Bell,
  Plus,
  CheckCircle,
  Star,
  Wallet,
  Crown,
  MessageSquare,
  X
} from "lucide-react";

const communityPosts = [
  {
    id: 1,
    user: { name: "Sarah Chen", avatar: "/api/placeholder/40/40", verified: true },
    group: "Web Development",
    timestamp: "2 hours ago",
    content: "Just completed a React project with Next.js 14! The new app router is amazing for performance. Anyone else working with the latest features?",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop",
    likes: 24,
    comments: 8,
    shares: 3
  },
  {
    id: 2,
    user: { name: "Mike Rodriguez", avatar: "/api/placeholder/40/40", verified: false },
    group: "Graphic Design",
    timestamp: "4 hours ago",
    content: "Looking for feedback on this logo design for a tech startup. What do you think about the color scheme and typography?",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&h=300&fit=crop",
    likes: 18,
    comments: 12,
    shares: 2
  },
  {
    id: 3,
    user: { name: "Priya Sharma", avatar: "/api/placeholder/40/40", verified: true },
    group: "AI & Machine Learning",
    timestamp: "6 hours ago",
    content: "Has anyone worked with GPT-4 API for content generation? I'm building a tool for automated blog writing and would love to hear about your experiences.",
    likes: 31,
    comments: 15,
    shares: 7
  }
];

export default function DashboardPage() {
  const [showMessages, setShowMessages] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Account Progress */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Complete Your Profile</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Profile Completion</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Profile photo added</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Skills verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    <span>Add portfolio items</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Community Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Creation */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Button variant="outline" className="w-full justify-start text-gray-500">
                      What's on your mind, John?
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Posts */}
            {communityPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={post.user.avatar} />
                      <AvatarFallback>{post.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{post.user.name}</span>
                        {post.user.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>in Community</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-800 mb-4">{post.content}</p>

                  {/* Post Image */}
                  {post.image && (
                    <div className="mb-4">
                      <Image
                        src={post.image}
                        alt="Post image"
                        width={500}
                        height={300}
                        className="rounded-lg w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-6">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-500">
                        <Heart className="h-4 w-4 mr-2" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-500">
                        <Share2 className="h-4 w-4 mr-2" />
                        {post.shares}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Progress */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Complete Your Profile</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Profile Completion</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Profile photo added</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Skills verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    <span>Add portfolio items</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Balance</span>
                  <div className="flex items-center gap-1">
                    <Wallet className="h-4 w-4 text-green-500" />
                    <span className="font-semibold text-green-600">₹2,450</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Membership</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Plus
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bids Remaining</span>
                  <span className="font-semibold">45</span>
                </div>
              </CardContent>
            </Card>

            {/* Promotional Card */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">0% Project Fees</h4>
                <p className="text-sm text-blue-100 mb-3">
                  Upgrade to Plus and pay zero fees on your next 5 projects
                </p>
                <Button size="sm" variant="secondary">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Messages */}
      <div className="fixed bottom-6 right-6 z-50">
        {showMessages ? (
          <Card className="w-80 h-96 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <h3 className="font-semibold">Messages</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowMessages(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No new messages</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            onClick={() => setShowMessages(true)}
            className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
}