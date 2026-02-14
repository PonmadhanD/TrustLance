"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import {
    Shield,
    Clock,
    Calendar as CalendarIcon,
    AlertCircle,
    CheckCircle,
    UserCheck,
    Briefcase,
    Gavel
} from "lucide-react";
import { format, addDays, startOfHour, addHours, isBefore, subMinutes } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const TOKENS_REQUIRED = 3000;

interface ArbitratorProfile {
    id: string;
    tokens: number;
    arbitrator_status: 'online' | 'offline' | 'busy';
    jobs_completed: number;
}

interface Gig {
    id: string;
    start_time: string;
    end_time: string;
    status: 'available' | 'booked' | 'completed' | 'cancelled';
}

export default function ArbitratorDashboard() {
    const router = useRouter();
    const { user } = useAuth();

    const [profile, setProfile] = useState<ArbitratorProfile | null>(null);
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [activeDisputes, setActiveDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingSlot, setBookingSlot] = useState<string | null>(null);

    // Polling for new disputes
    const prevDisputesLen = useRef(0);

    useEffect(() => {
        if (!user) return;

        // Initial fetch
        fetchProfile();

        const interval = setInterval(async () => {
            // specific lighter fetch just for disputes could be better, but profile is fine for MVP
            const res = await fetch(`/api/arbitrator/profile?user_id=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                const newDisputes = data.active_disputes || [];

                // Check for new assignments
                if (newDisputes.length > prevDisputesLen.current) {
                    toast({
                        title: "New Dispute Assigned!",
                        description: "You have been assigned a new case. Check your dashboard.",
                        variant: "default", // or a specific success style
                    });
                    // Play sound? (Optional, maybe later)
                }

                setActiveDisputes(newDisputes);
                setProfile(prev => prev ? { ...prev, ...data.profile } : null);
                prevDisputesLen.current = newDisputes.length;
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/arbitrator/profile?user_id=${user?.id}`);
            if (res.ok) {
                const data = await res.json();
                setProfile(data.profile);
                setGigs(data.gigs);
                setActiveDisputes(data.active_disputes || []);
                prevDisputesLen.current = (data.active_disputes || []).length;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookGig = async (startTime: Date) => {
        setBookingSlot(startTime.toISOString());
        try {
            const endTime = addHours(startTime, 1);
            const res = await fetch('/api/arbitrator/gigs/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString()
                })
            });

            if (res.ok) {
                toast({ title: "Gig Booked!", description: "You are scheduled for this slot." });
                fetchProfile();
            } else {
                const err = await res.json();
                toast({ title: "Booking Failed", description: err.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to book gig", variant: "destructive" });
        } finally {
            setBookingSlot(null);
        }
    };

    const toggleStatus = async (checked: boolean) => {
        const newStatus = checked ? 'online' : 'offline';
        try {
            const res = await fetch('/api/arbitrator/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setProfile(prev => prev ? { ...prev, arbitrator_status: newStatus } : null);
                toast({ title: `Status: ${newStatus.toUpperCase()}` });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    // Helper: Generate next 7 days slots (9 AM - 9 PM)
    const generateSlots = () => {
        const slots = [];
        const start = startOfHour(addHours(new Date(), 1)); // Start next hour

        for (let i = 0; i < 7; i++) {
            const day = addDays(start, i);
            const daySlots = [];
            for (let h = 9; h <= 21; h++) {
                const slotTime = new Date(day);
                slotTime.setHours(h, 0, 0, 0);
                daySlots.push(slotTime);
            }
            slots.push({ date: day, slots: daySlots });
        }
        return slots;
    };

    // Helper: Check if can go online (5 mins before gig)
    const canGoOnline = () => {
        if (!gigs.length) return false;
        const nextGig = gigs.find(g => new Date(g.start_time) > new Date());
        if (!nextGig) return false;

        const now = new Date();
        const gigStart = new Date(nextGig.start_time);
        // Allow online if within 5 mins before start OR during gig
        return isBefore(subMinutes(gigStart, 5), now) && isBefore(now, new Date(nextGig.end_time));
    };

    if (loading) return <div className="p-8 text-center">Loading Arbitrator Dashboard...</div>;

    if (!profile || (profile.tokens < TOKENS_REQUIRED)) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <Shield className="h-6 w-6" />
                            Arbitrator Eligibility Restricted
                        </CardTitle>
                        <CardDescription className="text-red-600">
                            You need {TOKENS_REQUIRED} tokens to become an arbitrator.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500">Your Tokens</p>
                                <p className="text-3xl font-bold text-red-600">{profile?.tokens || 0}</p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500">Required</p>
                                <p className="text-3xl font-bold text-gray-600">{TOKENS_REQUIRED}</p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-600">
                            Complete more jobs to earn tokens. You earn 30 tokens per completed project.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12 w-full max-w-full overflow-x-hidden">
            {/* Header Section */}
            <div className="bg-white border-b sticky top-16 z-30 w-full">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
                                <Shield className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
                                Arbitrator Dashboard
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm md:text-base">Manage your dispute resolution schedule and active cases</p>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border self-start md:self-auto">
                            <div className="px-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
                                <div className="flex items-center gap-2">
                                    <span className={`relative flex h-2.5 w-2.5`}>
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${profile.arbitrator_status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${profile.arbitrator_status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                    </span>
                                    <span className={`font-semibold ${profile.arbitrator_status === 'online' ? 'text-green-700' : 'text-gray-600'}`}>
                                        {profile.arbitrator_status === 'online' ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-gray-200" />
                            <Switch
                                checked={profile.arbitrator_status === 'online'}
                                onCheckedChange={toggleStatus}
                                disabled={!canGoOnline()}
                                className="data-[state=checked]:bg-green-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                                <Briefcase className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Jobs Completed</p>
                                <h3 className="text-2xl font-bold text-gray-900">{profile.jobs_completed}</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Token Balance</p>
                                <h3 className="text-2xl font-bold text-gray-900">{profile.tokens}</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                                <Gavel className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Active Cases</p>
                                <h3 className="text-2xl font-bold text-gray-900">{activeDisputes.length}</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-amber-50 text-amber-600">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Next Gig</p>
                                <h3 className="text-lg font-bold text-gray-900 truncate">
                                    {gigs.length > 0 ? format(new Date(gigs[0].start_time), "MMM d, h:mm a") : "None"}
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column: Dashboard Widgets */}
                    <div className="space-y-6">

                        {/* Active Disputes */}
                        <Card className="border-none shadow-md overflow-hidden min-h-[300px] flex flex-col">
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Gavel className="h-5 w-5" /> Assigned Disputes
                                </h3>
                            </div>
                            <CardContent className="p-0 flex-1 flex flex-col bg-white">
                                {activeDisputes.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white relative overflow-hidden">

                                        {profile?.arbitrator_status === 'online' ? (
                                            <>
                                                {/* Radar/Scanning Animation */}
                                                <div className="relative mb-6">
                                                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                                                    <div className="absolute inset-[-12px] bg-blue-500 rounded-full animate-pulse opacity-10"></div>
                                                    <div className="relative bg-white p-4 rounded-full shadow-sm border border-blue-100 z-10">
                                                        <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
                                                    </div>
                                                </div>

                                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Scanning for Disputes...</h4>
                                                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                                    You are <span className="text-green-600 font-bold">Online</span>. Searching for incoming disputes in your domain.
                                                </p>
                                                <div className="mt-4 flex gap-1 justify-center">
                                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="mb-4 bg-gray-200 p-4 rounded-full">
                                                    <Shield className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h4 className="text-gray-900 font-medium">Status: Offline</h4>
                                                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                                                    Go <b>Online</b> during your booked slot to start receiving cases.
                                                </p>
                                            </>
                                        )}

                                    </div>
                                ) : (
                                    <div className="divide-y relative z-10 bg-white">
                                        {activeDisputes.map((dispute: any) => (
                                            <div key={dispute.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-gray-900">
                                                            {dispute.project_name || `Case #${dispute.id.substring(0, 6)}`}
                                                        </h4>
                                                        <p className="text-xs text-purple-600 font-medium">
                                                            Amount: ${dispute.amount}
                                                        </p>
                                                    </div>
                                                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                                                        {dispute.status}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                                    onClick={() => router.push(`/resolution-gigs/room/${dispute.id}`)}
                                                >
                                                    Enter Resolution Room
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Gigs */}
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-3 border-b bg-gray-50/50">
                                <CardTitle className="text-base font-semibold text-gray-800">My Upcoming Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {gigs.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No upcoming gigs booked.</p>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[300px]">
                                        <div className="divide-y">
                                            {gigs.map(gig => (
                                                <div key={gig.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900">
                                                            {format(new Date(gig.start_time), "MMMM d, yyyy")}
                                                        </p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <Clock className="h-3 w-3" />
                                                            {format(new Date(gig.start_time), "h:mm a")} - {format(new Date(gig.end_time), "h:mm a")}
                                                        </p>
                                                    </div>
                                                    <Badge variant={gig.status === 'booked' ? 'default' : 'outline'} className={gig.status === 'booked' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-none' : ''}>
                                                        {gig.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Calendar */}
                    <div className="xl:col-span-2">
                        <Card className="border-none shadow-lg h-full flex flex-col">
                            <CardHeader className="bg-white border-b pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                            <CalendarIcon className="h-6 w-6 text-blue-600" />
                                            Book Availability
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Select 1-hour slots to act as an arbitrator. You earn commissions for resolved disputes.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-100 hidden sm:flex">
                                        1 Slot = 1 Hour
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 flex-1 bg-gray-50/30">
                                <div className="space-y-8">
                                    {generateSlots().map((dayGroup, i) => (
                                        <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                                {format(dayGroup.date, "EEEE, MMMM d")}
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                {dayGroup.slots.map((slot, j) => {
                                                    const isBooked = gigs.some(g =>
                                                        new Date(g.start_time).getTime() === slot.getTime()
                                                    );
                                                    const isPast = slot < new Date();

                                                    let buttonStyle = "border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50";
                                                    if (isBooked) buttonStyle = "bg-green-50 border-green-200 text-green-700 shadow-inner";
                                                    if (isPast) buttonStyle = "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed opacity-60";
                                                    if (bookingSlot === slot.toISOString()) buttonStyle = "bg-blue-600 text-white border-transparent animate-pulse";

                                                    return (
                                                        <button
                                                            key={j}
                                                            className={`
                                                                relative px-2 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200
                                                                flex flex-col items-center justify-center gap-0.5
                                                                ${buttonStyle}
                                                            `}
                                                            disabled={isBooked || isPast || !!bookingSlot}
                                                            onClick={() => !isBooked && handleBookGig(slot)}
                                                        >
                                                            <span>{format(slot, "h:mm a")}</span>
                                                            {isBooked && (
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600/80">Booked</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
 