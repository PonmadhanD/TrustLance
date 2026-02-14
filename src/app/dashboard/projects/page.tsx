"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Briefcase,
    Clock,
    DollarSign,
    User,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getUserRoleInProject } from "@/lib/roles";

interface Project {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: string;
    client_id: string;
    freelancer_id: string;
    created_at: string;
    milestones?: any[];
    client?: {
        id: string;
        username: string;
        full_name: string;
        rating: number;
    };
    freelancer?: {
        id: string;
        username: string;
        full_name: string;
        rating: number;
    };
}

export default function ProjectsDashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchProjects();
        }
    }, [user?.id]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            // Fetch projects where user is client OR freelancer
            const response = await fetch(`/api/projects?user_id=${user?.id}`);
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const getProjectRole = (project: Project) => {
        return getUserRoleInProject(project, user?.id);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800';
            case 'DISPUTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Briefcase className="h-8 w-8 text-blue-600" />
                        Active Projects
                    </h1>
                    <p className="text-gray-600">Projects where you are client or freelancer</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                            <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600 mb-1">As Client</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {projects.filter(p => p.client_id === user?.id).length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600 mb-1">As Freelancer</p>
                            <p className="text-2xl font-bold text-green-600">
                                {projects.filter(p => p.freelancer_id === user?.id).length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600 mb-1">Active</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {projects.filter(p => p.status === 'ACTIVE').length}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Projects List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">Loading projects...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">No active projects</p>
                                <div className="flex gap-4 justify-center">
                                    <Button onClick={() => router.push('/post-project')}>
                                        Post a Job
                                    </Button>
                                    <Button variant="outline" onClick={() => router.push('/dashboard/jobs')}>
                                        Find Work
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        projects.map((project) => {
                            const role = getProjectRole(project);
                            const otherParty = role === 'CLIENT' ? project.freelancer : project.client;

                            return (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <CardTitle className="text-xl">{project.title}</CardTitle>
                                                    <Badge className={role === 'CLIENT' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
                                                        You are {role}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4" />
                                                        ${project.budget.toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        Started {new Date(project.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(project.status)}>
                                                {project.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 mb-4 line-clamp-2">{project.description}</p>

                                        {/* Other Party Info */}
                                        {otherParty && (
                                            <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded">
                                                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {otherParty.full_name?.charAt(0) || otherParty.username?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {role === 'CLIENT' ? 'Freelancer' : 'Client'}: {otherParty.full_name || otherParty.username}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        ⭐ {otherParty.rating || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Milestones Preview */}
                                        {project.milestones && project.milestones.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-sm font-semibold mb-2">Milestones</p>
                                                <div className="flex gap-2">
                                                    {project.milestones.map((milestone: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-1 text-xs">
                                                            {milestone.status === 'PAID' ? (
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <AlertCircle className="h-4 w-4 text-gray-400" />
                                                            )}
                                                            <span>{milestone.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => router.push(`/profile/contracts/${project.id}`)}
                                            >
                                                View Contract
                                            </Button>
                                            <Button onClick={() => router.push(`/project/${project.id}`)}>
                                                {role === 'CLIENT' ? 'Manage Project' : 'View Project'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
 