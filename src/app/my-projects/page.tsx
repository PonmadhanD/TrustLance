

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Clock,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  Coins,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface Job {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  status: string;
  client_id: string;
  created_at: string;
  category?: string;
  skills?: string[];
  _count?: {
    proposals: number;
  };
}

interface Bid {
  id: string;
  job_id: string;
  amount: number;
  proposal: string;
  status: string;
  created_at: string;
  job?: {
    id: string;
    title: string;
    description: string;
    status: string;
  };
}

export default function MyProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const tabParam = searchParams?.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'freelancer' ? 'freelancer' : 'client');
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [appliedBids, setAppliedBids] = useState<Bid[]>([]);
  const [loadingPosted, setLoadingPosted] = useState(true);
  const [loadingApplied, setLoadingApplied] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchPostedJobs();
      fetchAppliedBids();
    }
  }, [user?.id]);

  const fetchPostedJobs = async () => {
    try {
      setLoadingPosted(true);
      const response = await fetch(`/api/jobs?created_by=${user?.id}`);

      if (!response.ok) {
        console.error("Failed to fetch jobs:", response.statusText);
        setPostedJobs([]);
        return;
      }

      const data = await response.json();
      // Ensure data is an array
      setPostedJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching posted jobs:", error);
      setPostedJobs([]);
    } finally {
      setLoadingPosted(false);
    }
  };

  const fetchAppliedBids = async () => {
    try {
      setLoadingApplied(true);
      const response = await fetch(`/api/bids/my-bids?freelancer_id=${user?.id}`);

      if (!response.ok) {
        console.error("Failed to fetch bids:", response.statusText);
        setAppliedBids([]);
        return;
      }

      const data = await response.json();
      // Ensure data is an array
      setAppliedBids(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applied bids:", error);
      setAppliedBids([]);
    } finally {
      setLoadingApplied(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-blue-600" />
                My Projects
              </h1>
              <p className="text-gray-600">Manage projects you posted and jobs you applied to</p>
            </div>
            <Button onClick={() => router.push("/post-project")}>Post New Project</Button>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="client">
              <Briefcase className="h-4 w-4 mr-2" />
              Client View
            </TabsTrigger>
            <TabsTrigger value="freelancer">
              <Users className="h-4 w-4 mr-2" />
              Freelancer View
            </TabsTrigger>
          </TabsList>

          {/* CLIENT VIEW - Projects You Posted */}
          <TabsContent value="client" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Posted</p>
                    <p className="text-2xl font-bold text-blue-600">{postedJobs.length}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Open Projects</p>
                    <p className="text-2xl font-bold text-green-600">
                      {postedJobs.filter((j) => j.status === "open").length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {postedJobs.reduce((sum, j) => sum + (j._count?.proposals || 0), 0)}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </CardContent>
              </Card>
            </div>

            {/* Job List */}
            <div className="space-y-4">
              {loadingPosted ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-600">Loading your projects...</p>
                  </CardContent>
                </Card>
              ) : postedJobs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You haven't posted any projects yet</p>
                    <Button onClick={() => router.push("/post-project")}>
                      Post Your First Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                postedJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Coins className="h-4 w-4" />
                              {job.budget_min.toLocaleString()} - {job.budget_max.toLocaleString()} SHM
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(job.created_at).toLocaleDateString()}
                            </span>
                            {job._count && job._count.proposals > 0 && (
                              <span className="flex items-center gap-1 text-blue-600 font-medium">
                                <Users className="h-4 w-4" />
                                {job._count.proposals} application{job._count.proposals !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant={job.status === "open" ? "default" : "secondary"} className="text-sm">
                          {job.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                      {/* Skills */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t pt-4">
                        {job._count && job._count.proposals > 0 ? (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">{job._count.proposals} proposal{job._count.proposals !== 1 ? "s" : ""} received</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <AlertCircle className="h-4 w-4" />
                            <span>No applications yet</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/job/${job.id}`)}
                          >
                            {job._count && job._count.proposals > 0 ? "View Applications" : "View Details"}
                          </Button>
                          <Button onClick={() => router.push(`/job/${job.id}`)}>Manage</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* FREELANCER VIEW - Jobs You Applied To */}
          <TabsContent value="freelancer" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-blue-600">{appliedBids.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {appliedBids.filter((b) => b.status === "pending").length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Accepted</p>
                    <p className="text-2xl font-bold text-green-600">
                      {appliedBids.filter((b) => b.status === "accepted").length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </CardContent>
              </Card>
            </div>

            {/* Bid List */}
            <div className="space-y-4">
              {loadingApplied ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-600">Loading your applications...</p>
                  </CardContent>
                </Card>
              ) : appliedBids.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You haven't applied to any projects yet</p>
                    <Button onClick={() => router.push("/dashboard")}>Browse Projects</Button>
                  </CardContent>
                </Card>
              ) : (
                appliedBids.map((bid) => (
                  <Card key={bid.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{bid.job?.title || "Project"}</CardTitle>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Coins className="h-4 w-4" />
                              Your bid: {bid.amount.toLocaleString()} SHM
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Applied {new Date(bid.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            bid.status === "accepted"
                              ? "default"
                              : bid.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-sm"
                        >
                          {bid.status === 'pending' ? 'Waiting for approval' :
                            bid.status === 'accepted' ? 'Accepted' :
                              bid.status === 'rejected' ? 'Rejected' :
                                bid.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 line-clamp-2">{bid.proposal}</p>

                      <div className="flex items-center justify-end gap-2 border-t pt-4">
                        {bid.status === "ACCEPTED" ? (
                          <Button onClick={() => router.push(`/escrow/${bid.job_id}`)}>
                            View Escrow
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/job/${bid.job_id}`)}
                          >
                            View Project
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 