"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_type: string;
  budget_range: string;
  budget_min: number;
  budget_max: number;
  skills: string[];
  status: string;
  created_at: string;
  client?: {
    username: string;
    name: string;
    rating: number;
  };
}

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBottomBanner, setShowBottomBanner] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs?status=open');
      const data = await res.json();
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const formatBudget = (job: Job) => {
    if (job.budget_min && job.budget_max) {
      return `₹${job.budget_min} - ₹${job.budget_max}`;
    }
    return job.budget_range;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMs = now.getTime() - created.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Top Jobs</h1>
            <div className="flex gap-3">
              <Link href="/post-project"><Button variant="outline">Hire a Freelancer</Button></Link>
              <Button>Earn Money Freelancing</Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 max-w-4xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for jobs..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select defaultValue="online">
              <SelectTrigger className="w-48 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online Job</SelectItem>
                <SelectItem value="local">Local Job</SelectItem>
              </SelectContent>
            </Select>
            <Button size="lg" className="px-8">Search</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Recent Searches */}
                  <div>
                    <h3 className="font-semibold mb-3">Filter by</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Budget</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-600 mb-1 block">Fixed Price Projects</label>
                            <div className="flex gap-2">
                              <Input placeholder="Min" className="h-8" />
                              <Input placeholder="Max" className="h-8" />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 mb-1 block">Hourly Projects</label>
                            <div className="flex gap-2">
                              <Input placeholder="Min" className="h-8" />
                              <Input placeholder="Max" className="h-8" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Select defaultValue="all">
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Durations</SelectItem>
                            <SelectItem value="short">Less than 1 month</SelectItem>
                            <SelectItem value="medium">1-3 months</SelectItem>
                            <SelectItem value="long">More than 3 months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Project Type</h4>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="contests" />
                          <label htmlFor="contests" className="text-sm">Contests</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Job Listings */}
          <div className="col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Showing {jobs.length} jobs</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="bg-blue-600 text-white">1</Button>
                  <Button variant="outline" size="sm" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Select defaultValue="newest">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="budget-high">Highest budget</SelectItem>
                  <SelectItem value="budget-low">Lowest budget</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading top jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No open jobs found</h3>
                  <p className="text-gray-600">Check back later for new opportunities.</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <Link href={`/projects/${job.id}`} className="text-lg font-semibold text-blue-600 hover:underline">
                          {job.title}
                        </Link>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(job.created_at)}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills?.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-[10px] font-normal">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs uppercase border-blue-200 text-blue-700 bg-blue-50">
                            {job.budget_type}
                          </Badge>
                          {job.status === 'open' ? (
                            <Badge className="bg-green-500 text-xs">OPEN</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">{job.status.toUpperCase()}</Badge>
                          )}
                        </div>
                        <span className="font-semibold text-green-600">{formatBudget(job)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      {showBottomBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Need to hire a freelancer for a job?</h3>
              <p className="text-sm text-blue-100">It's free to sign up, type in what you need & receive free quotes in seconds</p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                placeholder="What do you need done?"
                className="w-80 bg-white text-black"
              />
              <Link href="/post-project"><Button variant="secondary">Post a Project</Button></Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBottomBanner(false)}
                className="text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}