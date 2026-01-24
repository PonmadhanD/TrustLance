"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MapPin,
  Calendar,
  Edit,
  Briefcase,
  TrendingUp,
  Award,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  Eye,
  Heart,
  MessageCircle
} from "lucide-react";

const skills = ["React", "Node.js", "TypeScript", "UI/UX Design", "MongoDB", "Next.js"];

const portfolioItems = [
  {
    id: 1,
    title: "E-commerce Website",
    description: "Modern e-commerce platform with React and Node.js",
    image: "/api/placeholder/300/200",
    likes: 24,
    views: 156
  },
  {
    id: 2,
    title: "Mobile App Design",
    description: "iOS and Android app design for fitness tracking",
    image: "/api/placeholder/300/200",
    likes: 18,
    views: 89
  },
  {
    id: 3,
    title: "Dashboard UI",
    description: "Analytics dashboard with data visualization",
    image: "/api/placeholder/300/200",
    likes: 32,
    views: 203
  }
];

const reviews = [
  {
    id: 1,
    client: "Sarah Johnson",
    rating: 5,
    comment: "Excellent work! John delivered exactly what we needed on time.",
    project: "Website Development",
    date: "2024-01-10"
  },
  {
    id: 2,
    client: "Mike Chen",
    rating: 5,
    comment: "Great communication and high-quality code. Highly recommended!",
    project: "Mobile App",
    date: "2024-01-05"
  }
];

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  // Unwrap params Promise using React.use()
  const { username } = React.use(params);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src="/api/placeholder/96/96" />
                    <AvatarFallback className="text-2xl">JD</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
                  <p className="text-gray-600">@{username}</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Freelancer</Badge>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">4.9</span>
                    <span className="text-gray-600">(127 reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Mumbai, India</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Member since Jan 2022</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full" onClick={() => router.push('/edit-profile')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center - Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="finances">Finances</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      Full-stack developer with 5+ years of experience building modern web applications.
                      Specialized in React, Node.js, and cloud technologies. Passionate about creating
                      user-friendly interfaces and scalable backend systems.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portfolio" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolioItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="aspect-video bg-gray-200 relative">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={300}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {item.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {item.views}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold">{review.client}</h4>
                            <p className="text-sm text-gray-600">{review.project}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="projects" className="mt-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No public projects to display</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="finances" className="mt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Available Balance</p>
                            <p className="text-2xl font-bold text-green-600">₹2,450</p>
                          </div>
                          <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-orange-600">₹8,500</p>
                          </div>
                          <Clock className="h-8 w-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">This Month</p>
                            <p className="text-2xl font-bold text-blue-600">₹15,000</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Recent Payments
                        <Button variant="outline" size="sm" onClick={() => window.location.href = '/wallet'}>
                          View All
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">Website Development</p>
                              <p className="text-sm text-gray-500">Jan 15, 2024</p>
                            </div>
                          </div>
                          <span className="font-semibold text-green-600">+₹15,000</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-orange-600" />
                            <div>
                              <p className="font-medium">Mobile App Design</p>
                              <p className="text-sm text-gray-500">Jan 12, 2024</p>
                            </div>
                          </div>
                          <span className="font-semibold text-orange-600">₹8,500</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-4">
                    <Button className="flex-1" onClick={() => window.location.href = '/payment-demo'}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Payment System
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/wallet'}>
                      Full Wallet
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="groups" className="mt-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No groups joined yet</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right - Stats Panel */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Jobs Completed</span>
                    <span className="font-semibold">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ongoing Projects</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Earnings</span>
                    <span className="font-semibold">₹4,52,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">98%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Project completed</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">New review received</p>
                      <p className="text-xs text-gray-500">1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Top Rated badge earned</p>
                      <p className="text-xs text-gray-500">2 weeks ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}