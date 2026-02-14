"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Search,
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    TrendingUp,
    Filter,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface Job {
    id: string;
    title: string;
    description: string;
    budget_min: number;
    budget_max: number;
    status: string;
    created_by: string;
    created_at: string;
    category?: string;
    skills?: string[];
    location?: string;
    client?: {
        name: string;
        rating: number;
    };
}

export default function JobsMarketplacePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            // Fetch ALL open jobs - no filtering by user
            const response = await fetch('/api/jobs?status=open');
            const data = await response.json();

            // Show ALL jobs - users can see their own posted jobs too
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            // Mock data for now
            setJobs(getMockJobs());
        } finally {
            setLoading(false);
        }
    };

    const getMockJobs = (): Job[] => [
        {
            id: "1",
            title: "Build a Modern E-commerce Website",
            description: "Looking for an experienced full-stack developer to build a modern e-commerce platform with React and Node.js. Must have experience with payment gateways and product management systems.",
            budget_min: 5000,
            budget_max: 8000,
            status: "OPEN",
            created_by: "client123",
            created_at: new Date().toISOString(),
            category: "Web Development",
            skills: ["React", "Node.js", "MongoDB", "Stripe"],
            location: "Remote",
            client: {
                name: "TechCorp Inc",
                rating: 4.8
            }
        },
        {
            id: "2",
            title: "Mobile App UI/UX Design",
            description: "Need a creative designer to create stunning UI/UX for our fitness tracking mobile app. Should include wireframes, prototypes, and final designs.",
            budget_min: 2000,
            budget_max: 3500,
            status: "OPEN",
            created_by: "client456",
            created_at: new Date().toISOString(),
            category: "Design",
            skills: ["Figma", "UI/UX", "Mobile Design"],
            location: "Remote",
            client: {
                name: "FitLife",
                rating: 4.9
            }
        },
        {
            id: "3",
            title: "Smart Contract Development for NFT Marketplace",
            description: "Seeking blockchain developer to create and audit smart contracts for our NFT marketplace on Polygon. Experience with ERC-721 and marketplace standards required.",
            budget_min: 8000,
            budget_max: 12000,
            status: "OPEN",
            created_by: "client789",
            created_at: new Date().toISOString(),
            category: "Blockchain",
            skills: ["Solidity", "Web3", "Polygon", "Smart Contracts"],
            location: "Remote",
            client: {
                name: "NFT Gallery",
                rating: 4.7
            }
        }
    ];

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || job.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["all", "Web Development", "Design", "Blockchain", "Mobile", "Data Science"];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Briefcase className="h-8 w-8 text-blue-600" />
                        Job Marketplace
                    </h1>
                    <p className="text-gray-600">Browse and apply to open jobs from clients worldwide</p>
                </div>

                {/* Search and Filter */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    placeholder="Search jobs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="flex gap-2 flex-wrap">
                                {categories.map((category) => (
                                    <Button
                                        key={category}
                                        variant={selectedCategory === category ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category === "all" ? "All Categories" : category}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Open Jobs</p>
                                <p className="text-2xl font-bold text-blue-600">{filteredJobs.length}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg Budget</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ${Math.round(filteredJobs.reduce((acc, job) => acc + (job.budget_min + job.budget_max) / 2, 0) / filteredJobs.length || 0)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Remote Jobs</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {filteredJobs.filter(j => j.location === "Remote").length}
                                </p>
                            </div>
                            <MapPin className="h-8 w-8 text-purple-600" />
                        </CardContent>
                    </Card>
                </div>

                {/* Job List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">Loading jobs...</p>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No jobs found matching your criteria</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredJobs.map((job) => (
                            <Card key={job.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    ${job.budget_min.toLocaleString()} - ${job.budget_max.toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {job.location || "Remote"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    Posted {new Date(job.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">{job.category || "General"}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 mb-4">{job.description}</p>

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

                                    {/* Client Info & Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-2">
                                            {job.client && (
                                                <>
                                                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                        {job.client.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{job.client.name}</p>
                                                        <p className="text-xs text-gray-600">⭐ {job.client.rating}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <Button onClick={() => router.push(`/job/${job.id}`)}>
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
 