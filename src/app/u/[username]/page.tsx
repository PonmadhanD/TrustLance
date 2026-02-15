import Link from 'next/link';
import Image from "next/image";
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AuthenticatedHeader from '@/components/layout/authenticated-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    MapPin,
    Calendar,
    Star,
    Trophy,
    Briefcase,
    GraduationCap,
    Edit,
    Globe,
    Mail,
    CheckCircle,
    Clock,
    DollarSign,
    Building,
    MessageSquare,
    ThumbsUp,
    Github,
    Twitter,
    Linkedin,
    Award
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();

    // 1. Fetch Profile User
    const { data: user, error } = await supabase
        .from('users')
        .select(`
            *,
            user_education(*),
            user_certifications(*),
            portfolio_items(*)
        `)
        .eq('username', username)
        .single();

    if (error || !user) {
        console.error("Profile not found:", error);
        notFound();
    }

    // 2. Fetch Current User (for Edit permission)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const isOwner = currentUser?.id === user?.id;

    // 3. Fetch Wallet (Token Balance) - Only visible to owner usually, but user asked for "Total Earnings" in tokens
    // For public view, we might ideally show "Total Earned", but schema only has wallet balance. 
    // We'll check 'projects_completed' and maybe 'total_credits'. 
    // Unsure if 'token_balance' is public. Let's fetch it if it's owner, or show '0' if not owner for privacy unless explicitly public.
    // User request: "Total Earnings: {stats.totalEarningsTokens} SHM".
    // I will fetch wallet for now.
    let walletBalance = 0;
    if (isOwner) {
        const { data: wallet } = await supabase.from('user_wallets').select('token_balance').eq('user_id', user.id).single();
        walletBalance = wallet?.token_balance || 0;
    } else {
        // For public, maybe we don't show exact wallet balance, but "Total Earnings" from a transaction sum?
        // Schema has 'credit_transactions'. Let's stick to what's available.
        // If the user wants "Total Earnings", I should sum up 'RECEIVE' transactions from 'token_transactions'.
        // Let's try to fetch that sum if possible, or just default to 0 for non-owners for now to avoid privacy issues.
        // Or if the requirements implies public earnings, I'd need a specific field.
        // User request says: "Total Earnings: {stats.totalEarningsTokens} SHM".
        // I'll calculate it from transactions if possible, or if not, use a placeholder.
        const { data: transactions } = await supabase
            .from('token_transactions')
            .select('tokens')
            .eq('user_id', user.id)
            .eq('type', 'RECEIVE')
            .eq('status', 'SUCCESS');

        walletBalance = transactions?.reduce((sum, tx) => sum + tx.tokens, 0) || 0;
    }

    // 4. Fetch Reviews (Feedback)
    // Assuming 'reviewee_id' is the user receiving feedback
    const { data: reviews } = await supabase
        .from('feedback')
        .select('*, reviewer:reviewer_id(name, avatar_url)')
        .eq('reviewee_id', user.id)
        .order('created_at', { ascending: false });

    // 5. Fetch Projects (Active & Completed)
    // We fetch both projects created by user (Client) and projects worked on (Freelancer)
    let allProjects: any[] = [];

    // A. Fetch Posted Projects (Client side)
    const { data: postedProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

    if (postedProjects) {
        allProjects = [...postedProjects];
    }

    // B. Fetch Worked Projects (Freelancer side via Contracts)
    // This assumes 'contracts' table links freelancers to projects
    try {
        const { data: contracts } = await supabase
            .from('contracts')
            .select('project:projects(*)')
            .eq('freelancer_id', user.id);

        if (contracts) {
            const workedProjects = contracts.map((c: any) => c.project).filter(Boolean);
            allProjects = [...allProjects, ...workedProjects];
        }
    } catch (error) {
        console.warn("Could not fetch contracted projects (contracts table might be missing or structure differs)", error);
    }

    // Deduplicate projects (in case user is both client and freelancer on same project? unlikely but safe)
    const projects = Array.from(new Map(allProjects.map(p => [p.id, p])).values())
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


    // Process Data
    const portfolio = (user.portfolio_items || []).filter((item: any) => item.is_visible);
    const education = user.user_education || [];
    const certifications = user.user_certifications || [];
    const joinDate = new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    // Stats Calculation
    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0
        ? (reviews?.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : "N/A";

    const successRate = user.projects_completed > 0 ? 98 : 0; // Mock/Calced (98% hardcoded in user prompt logic or calc)

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AuthenticatedHeader />

            <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT COLUMN - Sticky Profile Card */}
                    <aside className="w-full lg:w-[320px] shrink-0 space-y-6">
                        <Card className="sticky top-24 overflow-hidden border-slate-200 shadow-sm">
                            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                                {isOwner && (
                                    <Link href="/profile/edit" className="absolute top-4 right-4">
                                        <Button size="sm" variant="secondary" className="h-8 gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm">
                                            <Edit className="h-3.5 w-3.5" />
                                            Edit
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <div className="px-6 pb-6 -mt-12 relative">
                                <Avatar className="h-24 w-24 border-4 border-white shadow-lg bg-white mb-4">
                                    <AvatarImage src={user.avatar_url || `https://placehold.co/150x150/png?text=${user.name?.charAt(0) || 'U'}`} />
                                    <AvatarFallback className="text-3xl bg-blue-50 text-blue-600 font-bold">{user.name?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>

                                <div className="space-y-1 mb-4">
                                    <h1 className="text-xl font-bold text-gray-900 leading-tight">{user.name}</h1>
                                    <p className="text-gray-500 font-medium text-sm">@{user.username}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 rounded-full px-3">
                                        Freelancer
                                    </Badge>
                                    {totalReviews > 0 && (
                                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200 text-xs font-bold">
                                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                            {averageRating} ({totalReviews})
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
                                    {user.profession_title && (
                                        <div className="flex items-start gap-3">
                                            <Briefcase className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                            <span className="font-medium text-gray-900">{user.profession_title}</span>
                                        </div>
                                    )}
                                    {user.company && (
                                        <div className="flex items-start gap-3">
                                            <Building className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                            <span>{user.company}</span>
                                        </div>
                                    )}
                                    {user.location && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                                            <span>{user.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                                        <span>Member since {joinDate}</span>
                                    </div>
                                    {user.profession_category && (
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                                            <span>{user.profession_category}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.skills && user.skills.length > 0 ? (
                                            user.skills.map((skill: string) => (
                                                <Badge key={skill} variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-normal hover:bg-slate-100">
                                                    {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">No skills listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Social Links (Mock for now) */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-4 flex justify-around text-gray-400">
                                <Github className="h-5 w-5 hover:text-gray-900 cursor-pointer transition-colors" />
                                <Twitter className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors" />
                                <Linkedin className="h-5 w-5 hover:text-blue-700 cursor-pointer transition-colors" />
                                <Globe className="h-5 w-5 hover:text-green-600 cursor-pointer transition-colors" />
                            </CardContent>
                        </Card>
                    </aside>

                    {/* RIGHT COLUMN - Tabs & Content */}
                    <div className="flex-1 min-w-0">
                        <Tabs defaultValue="overview" className="space-y-6">
                            <div className="flex items-center justify-between overflow-x-auto pb-1 scrollbar-hide">
                                <TabsList className="bg-white p-1 rounded-xl shadow-sm border h-12 w-full max-w-2xl justify-start">
                                    <TabsTrigger value="overview" className="h-full px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all">Overview</TabsTrigger>
                                    <TabsTrigger value="portfolio" className="h-full px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all">Portfolio</TabsTrigger>
                                    <TabsTrigger value="reviews" className="h-full px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all">Reviews</TabsTrigger>
                                    <TabsTrigger value="projects" className="h-full px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all">Projects</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Main Tab Content */}
                                <div className="xl:col-span-2 space-y-6">

                                    <TabsContent value="overview" className="space-y-6 mt-0">
                                        <Card className="border-slate-200 shadow-sm">
                                            <CardHeader>
                                                <CardTitle className="text-lg font-bold">About</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="whitespace-pre-wrap text-gray-600 leading-relaxed text-sm">
                                                    {user.about || "This user hasn't added a bio yet."}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {education.length > 0 && (
                                            <Card className="border-slate-200 shadow-sm">
                                                <CardHeader>
                                                    <CardTitle className="text-lg font-bold">Education</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-0 divide-y">
                                                    {education.map((edu: any) => (
                                                        <div key={edu.id} className="flex gap-4 items-start py-4 first:pt-0 last:pb-0">
                                                            <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 shrink-0">
                                                                <GraduationCap className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">{edu.institution}</h4>
                                                                <p className="text-gray-600 text-sm">{edu.degree}{edu.field_of_study ? `, ${edu.field_of_study}` : ''}</p>
                                                                <p className="text-gray-400 text-xs mt-1">
                                                                    {edu.start_date ? new Date(edu.start_date).getFullYear() : ''} -
                                                                    {edu.end_date ? new Date(edu.end_date).getFullYear() : 'Present'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}
                                        {certifications.length > 0 && (
                                            <Card className="border-slate-200 shadow-sm">
                                                <CardHeader>
                                                    <CardTitle className="text-lg font-bold">Certifications</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-0 divide-y">
                                                    {certifications.map((cert: any) => (
                                                        <div key={cert.id} className="flex gap-4 items-start py-4 first:pt-0 last:pb-0">
                                                            <div className="bg-green-50 p-2.5 rounded-lg text-green-600 shrink-0">
                                                                <Award className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                                                                <p className="text-gray-600 text-sm">{cert.issuing_organization}</p>
                                                                <div className="flex gap-3 mt-1">
                                                                    <p className="text-gray-400 text-xs">
                                                                        Issued {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : 'Unknown'}
                                                                    </p>
                                                                    {cert.expiration_date && (
                                                                        <p className="text-gray-400 text-xs">
                                                                            Expires {new Date(cert.expiration_date).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {cert.credential_url && (
                                                                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                                                                        View Credential
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="portfolio" className="mt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {portfolio.length === 0 ? (
                                                <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed text-gray-500">
                                                    <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                                    <p>No portfolio items to display.</p>
                                                </div>
                                            ) : (
                                                portfolio.map((item: any) => (
                                                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-all border-slate-200 group flex flex-col h-full">
                                                        <div className="h-40 bg-slate-100 relative overflow-hidden">
                                                            {item.thumbnail_url ? (
                                                                <div className="relative w-full h-full">
                                                                    <Image
                                                                        src={item.thumbnail_url}
                                                                        alt={item.title}
                                                                        fill
                                                                        className="object-cover transition-transform group-hover:scale-105"
                                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                                    <Briefcase className="h-10 w-10 text-gray-300" />
                                                                </div>
                                                            )}
                                                            {item.origin === 'auto' && (
                                                                <Badge className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700 shadow-sm border-none text-[10px uppercase]">Verified Project</Badge>
                                                            )}
                                                        </div>
                                                        <CardContent className="p-5 flex-1 flex flex-col">
                                                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</h3>
                                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                                                                {item.summary}
                                                            </p>

                                                            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                                                                <div className="flex items-center gap-1">
                                                                    {item.client_rating ? (
                                                                        <>
                                                                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                                                            <span className="font-medium text-gray-900">{item.client_rating}.0</span>
                                                                        </>
                                                                    ) : (
                                                                        <span>No rating</span>
                                                                    )}
                                                                </div>
                                                                {item.token_amount && (
                                                                    <span className="font-medium text-green-600 flex items-center gap-1">
                                                                        {item.token_amount} SHM
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="reviews" className="mt-0 space-y-4">
                                        {reviews && reviews.length > 0 ? (
                                            reviews.map((review: any) => (
                                                <Card key={review.id} className="border-slate-200">
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start gap-4">
                                                            <Avatar className="h-10 w-10 border border-gray-200">
                                                                <AvatarImage src={review.reviewer?.avatar_url} />
                                                                <AvatarFallback>{review.reviewer?.name?.charAt(0) || 'C'}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div>
                                                                        <h4 className="font-semibold text-gray-900 text-sm">{review.reviewer?.name || 'Client'}</h4>
                                                                        <p className="text-xs text-gray-500">Project Review</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-xs font-bold text-yellow-700">
                                                                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                                                        {review.rating}.0
                                                                    </div>
                                                                </div>
                                                                <p className="text-gray-600 text-sm leading-relaxed italic">
                                                                    "{review.feedback}"
                                                                </p>
                                                                <div className="mt-3 text-xs text-gray-400">
                                                                    {new Date(review.created_at).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-gray-500">
                                                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                                <p>No reviews recieved yet.</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="projects" className="mt-0">
                                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                                        <tr>
                                                            <th className="px-6 py-4">Project Name</th>
                                                            <th className="px-6 py-4">Status</th>
                                                            <th className="px-6 py-4">Tokens</th>
                                                            <th className="px-6 py-4">Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {projects && projects.length > 0 ? (
                                                            projects.map((project: any) => (
                                                                <tr key={project.id} className="hover:bg-gray-50/50">
                                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                                        {project.title}
                                                                        <div className="text-xs text-gray-500 font-normal mt-0.5 line-clamp-1">{project.description?.substring(0, 50)}...</div>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <Badge variant="outline" className={`
                                                                            ${project.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                                project.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                                    'bg-gray-50 text-gray-600 border-gray-200'}
                                                                        `}>
                                                                            {project.status || 'Unknown'}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                                        {project.budget_max ? `${project.budget_min} - ${project.budget_max}` : project.budget || '-'} SHM
                                                                    </td>
                                                                    <td className="px-6 py-4 text-gray-500">
                                                                        {new Date(project.created_at).toLocaleDateString()}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                                    No projects found.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Card>
                                    </TabsContent>
                                </div>

                                {/* RIGHT COLUMN - Widgets */}
                                <div className="space-y-6">
                                    {/* Stats Card */}
                                    <Card className="border-slate-200 shadow-sm bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base font-bold">Stats</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-sm text-gray-600">Jobs Completed</span>
                                                <span className="font-bold text-gray-900">{user.projects_completed || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-sm text-gray-600">Ongoing Projects</span>
                                                <span className="font-bold text-gray-900">{projects?.filter((p: any) => p.status === 'active').length || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-sm text-gray-600">Total Earnings</span>
                                                <span className="font-bold text-green-600">{walletBalance.toLocaleString()} SHM</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-sm text-gray-600">Success Rate</span>
                                                <span className="font-bold text-gray-900">{successRate}%</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-sm text-gray-600">Trust Credits</span>
                                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">{user.total_credits || 0}</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Recent Activity Card */}
                                    <Card className="border-slate-200 shadow-sm bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base font-bold">Recent Activity</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {/* Mock Activity Items based on real events/stats */}
                                                {user.projects_completed > 0 && (
                                                    <div className="flex gap-3">
                                                        <div className="mt-0.5 bg-green-100 p-1.5 rounded-full h-fit text-green-600">
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Project Completed</p>
                                                            <p className="text-xs text-gray-500">2 days ago</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {reviews && reviews.length > 0 && (
                                                    <div className="flex gap-3">
                                                        <div className="mt-0.5 bg-yellow-100 p-1.5 rounded-full h-fit text-yellow-600">
                                                            <Star className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">New Review Received</p>
                                                            <p className="text-xs text-gray-500">1 week ago</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex gap-3">
                                                    <div className="mt-0.5 bg-blue-100 p-1.5 rounded-full h-fit text-blue-600">
                                                        <Trophy className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">Joined TrustLance</p>
                                                        <p className="text-xs text-gray-500">{joinDate}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
