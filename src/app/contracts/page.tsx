// Contracts list page - shows all contracts for the user
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Briefcase,
    DollarSign,
    Clock,
    FileText,
    AlertCircle,
    CheckCircle,
    XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface Contract {
    id: string;
    project_id: string;
    title: string;
    client_id: string;
    freelancer_id: string;
    total_amount: number;
    locked_amount: number;
    status: 'active' | 'completed' | 'disputed' | 'cancelled';
    created_at: string;
    client_name?: string;
    freelancer_name?: string;
}

export default function ContractsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        fetchContracts();
    }, [user]);

    const fetchContracts = async () => {
        try {
            const response = await fetch(`/api/contracts?user_id=${user?.id}`);
            if (response.ok) {
                const data = await response.json();
                setContracts(Array.isArray(data) ? data : []);
            } else {
                setContracts([]);
            }
        } catch (error) {
            console.error('Error fetching contracts:', error);
            setContracts([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { color: string; icon: any }> = {
            active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            completed: { color: 'bg-blue-100 text-blue-800', icon: FileText },
            disputed: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
            cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
        };
        const variant = variants[status] || variants.active;
        const Icon = variant.icon;

        return (
            <Badge className={`${variant.color} flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const filteredContracts = contracts.filter(contract => {
        if (filter === 'all') return true;
        return contract.status === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <p className="text-center text-gray-600">Loading contracts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">My Contracts</h1>
                    <p className="text-gray-600">Manage your active and completed project contracts</p>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        size="sm"
                    >
                        All ({contracts.length})
                    </Button>
                    <Button
                        variant={filter === 'active' ? 'default' : 'outline'}
                        onClick={() => setFilter('active')}
                        size="sm"
                    >
                        Active ({contracts.filter(c => c.status === 'active').length})
                    </Button>
                    <Button
                        variant={filter === 'completed' ? 'default' : 'outline'}
                        onClick={() => setFilter('completed')}
                        size="sm"
                    >
                        Completed ({contracts.filter(c => c.status === 'completed').length})
                    </Button>
                </div>

                {/* Contracts List */}
                {filteredContracts.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {filter === 'all' ? 'No contracts yet' : `No ${filter} contracts`}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Contracts are created when a client accepts your bid or you accept a freelancer's bid
                            </p>
                            <Button onClick={() => router.push('/dashboard')}>
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredContracts.map((contract) => (
                            <Card
                                key={contract.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => router.push(`/contracts/${contract.id}`)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold mb-2">{contract.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>
                                                    {contract.client_id === user?.id
                                                        ? `Freelancer: ${contract.freelancer_name || 'Unknown'}`
                                                        : `Client: ${contract.client_name || 'Unknown'}`
                                                    }
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(contract.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {getStatusBadge(contract.status)}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="text-sm text-gray-600">Total Value</p>
                                                <p className="text-xl font-bold text-green-600">
                                                    ${contract.total_amount?.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Locked in Escrow</p>
                                                <p className="text-lg font-semibold text-blue-600">
                                                    ${contract.locked_amount?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/contracts/${contract.id}`);
                                        }}>
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
 