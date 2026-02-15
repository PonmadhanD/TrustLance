"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Mail, Phone, MapPin, Building, Briefcase, DollarSign, User } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const EducationList = dynamic(() => import('@/components/profile/education-list').then(mod => mod.EducationList), { ssr: false });

export default function EditProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Form States
    const [basicInfo, setBasicInfo] = useState({
        name: '',
        username: '', // Read-only
        email: '',    // Read-only
        phone: '',
        profession_title: '',
        profession_category: '',
        location: '',
        company: '',
        hourly_rate: '',
    });
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [about, setAbout] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            setUser(profile);
            setBasicInfo({
                name: profile.name || '',
                username: profile.username || '',
                email: user.email || '',
                phone: profile.phone || '',
                profession_title: profile.profession_title || '',
                profession_category: profile.profession_category || '',
                location: profile.location || '',
                company: profile.company || '',
                hourly_rate: profile.hourly_rate ? String(profile.hourly_rate) : '',
            });
            setAbout(profile.about || '');
            setSkills(profile.skills || []);
            setAvatarUrl(profile.avatar_url);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }

    async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) throw new Error('You must select an image.');

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            const { error: updateError } = await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id);
            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            toast({ title: 'Success', description: 'Profile photo updated.' });
        } catch (error: any) {
            console.error('Upload Error:', error);
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    }

    async function handleSaveBasic() {
        setSaving(true);
        try {
            const response = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: basicInfo.name,
                    profession_title: basicInfo.profession_title,
                    profession_category: basicInfo.profession_category,
                    location: basicInfo.location,
                    phone: basicInfo.phone,
                    company: basicInfo.company,
                    hourly_rate: basicInfo.hourly_rate ? parseFloat(basicInfo.hourly_rate) : null,
                    about,
                    skills
                }),
            });

            if (!response.ok) throw new Error('Failed to update');

            toast({ title: 'Success', description: 'Profile updated successfully' });
            router.refresh();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save changes', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    }

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50/50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Profile</h1>
                        <p className="text-gray-500 mt-1">Manage your public presence and professional details.</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push(`/u/${basicInfo.username}`)} className="bg-white hover:bg-gray-50">
                        View Public Profile
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Tabs */}
                    <div className="lg:col-span-1">
                        <Tabs defaultValue="basic" className="w-full flex-col h-full bg-transparent space-y-8" orientation="vertical">
                            <TabsList className="bg-white p-2 rounded-xl shadow-sm border flex flex-col items-start h-auto w-full space-y-1">
                                <TabsTrigger value="basic" className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-gray-600 font-medium rounded-lg transition-all">
                                    <User className="h-4 w-4 mr-3" /> Basic Info
                                </TabsTrigger>
                                <TabsTrigger value="about" className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-gray-600 font-medium rounded-lg transition-all">
                                    <Textarea className="h-4 w-4 mr-3" /> About / Bio
                                </TabsTrigger>
                                <TabsTrigger value="skills" className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-gray-600 font-medium rounded-lg transition-all">
                                    <Plus className="h-4 w-4 mr-3" /> Skills
                                </TabsTrigger>
                                <TabsTrigger value="education" className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-gray-600 font-medium rounded-lg transition-all">
                                    <Building className="h-4 w-4 mr-3" /> Education
                                </TabsTrigger>
                            </TabsList>

                            {/* Mobile Save Button (visible on small screens only if needed, currently reusing main save) */}
                        </Tabs>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        <TabsContent value="basic" className="mt-0">
                            <Card className="border-none shadow-sm ring-1 ring-gray-200/50">
                                <CardHeader className="pb-4 border-b bg-gray-50/50 rounded-t-xl">
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>Your core identity and contact details.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 py-8">
                                    {/* Avatar Section */}
                                    <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                                        <div className="relative group">
                                            <Avatar className="h-28 w-28 border-4 border-white shadow-md">
                                                <AvatarImage src={avatarUrl || ''} className="object-cover" />
                                                <AvatarFallback className="text-3xl bg-blue-100 text-blue-600 font-semibold">
                                                    {basicInfo.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg border-2 border-white">
                                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <h3 className="font-semibold text-gray-900 text-lg">Profile Photo</h3>
                                            <p className="text-sm text-gray-500 mt-1 max-w-xs">
                                                This will be displayed on your public profile. Recommended size: 400x400px.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input className="pl-9" value={basicInfo.name} onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Username</Label>
                                            <Input value={basicInfo.username} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input className="pl-9 bg-gray-50 text-gray-500 cursor-not-allowed" value={basicInfo.email} disabled />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input className="pl-9" placeholder="+1 (555) 000-0000" value={basicInfo.phone} onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-gray-700">Location</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input className="pl-9" placeholder="e.g. San Francisco, CA" value={basicInfo.location} onChange={(e) => setBasicInfo({ ...basicInfo, location: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Professional Title</Label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input className="pl-9" placeholder="e.g. Senior Full Stack Developer" value={basicInfo.profession_title} onChange={(e) => setBasicInfo({ ...basicInfo, profession_title: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Hourly Rate (SHM)</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input type="number" className="pl-9" placeholder="0.00" value={basicInfo.hourly_rate} onChange={(e) => setBasicInfo({ ...basicInfo, hourly_rate: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Category</Label>
                                            <Input placeholder="e.g. Web Development" value={basicInfo.profession_category} onChange={(e) => setBasicInfo({ ...basicInfo, profession_category: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Company / Agency</Label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input className="pl-9" placeholder="e.g. Freelancer Inc." value={basicInfo.company} onChange={(e) => setBasicInfo({ ...basicInfo, company: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t">
                                        <Button onClick={handleSaveBasic} disabled={saving} size="lg" className="min-w-[150px]">
                                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="about" className="mt-0">
                            <Card className="border-none shadow-sm ring-1 ring-gray-200/50">
                                <CardHeader className="pb-4 border-b bg-gray-50/50 rounded-t-xl">
                                    <CardTitle>About You</CardTitle>
                                    <CardDescription>Tell clients about your experience and expertise.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 py-8">
                                    <Textarea
                                        className="min-h-[300px] text-base leading-relaxed p-4 resize-y font-sans"
                                        placeholder="I am a passionate developer with expertise in..."
                                        value={about}
                                        onChange={(e) => setAbout(e.target.value)}
                                    />
                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                        <span>{about.length} characters</span>
                                        <Button onClick={handleSaveBasic} disabled={saving} size="lg">
                                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Description
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="skills" className="mt-0">
                            <Card className="border-none shadow-sm ring-1 ring-gray-200/50">
                                <CardHeader className="pb-4 border-b bg-gray-50/50 rounded-t-xl">
                                    <CardTitle>Skills & Expertise</CardTitle>
                                    <CardDescription>Showcase your tech stack and capabilities.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 py-8">
                                    <div className="flex gap-3">
                                        <Input
                                            placeholder="Add a new skill (e.g. React, Python)"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                            className="max-w-md"
                                        />
                                        <Button onClick={addSkill} variant="secondary">
                                            <Plus className="h-4 w-4 mr-2" /> Add
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-3 min-h-[100px] p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-300">
                                        {skills.length === 0 && (
                                            <div className="w-full text-center text-gray-400 py-4">
                                                No skills added yet. Start typing above!
                                            </div>
                                        )}
                                        {skills.map((skill) => (
                                            <div key={skill} className="bg-white border shadow-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 group hover:border-blue-200 hover:text-blue-600 transition-colors">
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end pt-4 border-t">
                                        <Button onClick={handleSaveBasic} disabled={saving} size="lg">
                                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Skills
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="education" className="mt-0">
                            <Card className="border-none shadow-sm ring-1 ring-gray-200/50">
                                <CardHeader className="pb-4 border-b bg-gray-50/50 rounded-t-xl">
                                    <CardTitle>Education</CardTitle>
                                    <CardDescription>Manage your educational background.</CardDescription>
                                </CardHeader>
                                <CardContent className="py-8">
                                    {user && <EducationList userId={user.id} />}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </div>
            </div>
        </div>
    );
}
