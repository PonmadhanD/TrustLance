"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Save,
    X,
    Upload,
    MapPin,
    Briefcase,
    Mail,
    Phone,
    Globe,
    Linkedin,
    Github,
    Twitter,
    ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function EditProfilePage() {
    const router = useRouter();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        fullName: "John Doe",
        username: user?.username || "johndoe",
        email: user?.email || "john.doe@example.com",
        phone: "+91 98765 43210",
        location: "Mumbai, India",
        bio: "Full-stack developer with 5+ years of experience building modern web applications. Specialized in React, Node.js, and cloud technologies. Passionate about creating user-friendly interfaces and scalable backend systems.",
        hourlyRate: "50",
        title: "Full Stack Developer",
        company: "Freelancer",
        website: "https://johndoe.dev",
        linkedin: "https://linkedin.com/in/johndoe",
        github: "https://github.com/johndoe",
        twitter: "@johndoe",
    });

    const [skills, setSkills] = useState(["React", "Node.js", "TypeScript", "UI/UX Design", "MongoDB", "Next.js"]);
    const [newSkill, setNewSkill] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill("");
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Save profile data
        console.log("Saving profile:", { ...formData, skills });
        router.push(`/profile/${formData.username}`);
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 -ml-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back
                    </Button>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                    <p className="text-gray-600 mt-2">Update your profile information and settings</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Profile Picture */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src="/api/placeholder/96/96" />
                                    <AvatarFallback className="text-2xl">JD</AvatarFallback>
                                </Avatar>
                                <div>
                                    <Button type="button" variant="outline" className="mb-2">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Photo
                                    </Button>
                                    <p className="text-sm text-gray-600">JPG, PNG or GIF. Max size 2MB.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="johndoe"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">
                                        <Mail className="h-4 w-4 inline mr-2" />
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="john.doe@example.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">
                                        <Phone className="h-4 w-4 inline mr-2" />
                                        Phone
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="location">
                                    <MapPin className="h-4 w-4 inline mr-2" />
                                    Location
                                </Label>
                                <Input
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Mumbai, India"
                                />
                            </div>

                            <div>
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Professional Information */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Professional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">
                                        <Briefcase className="h-4 w-4 inline mr-2" />
                                        Professional Title
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Full Stack Developer"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                                    <Input
                                        id="hourlyRate"
                                        name="hourlyRate"
                                        type="number"
                                        value={formData.hourlyRate}
                                        onChange={handleInputChange}
                                        placeholder="50"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="company">Company</Label>
                                <Input
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder="Freelancer"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-sm">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="ml-2 hover:text-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Add a skill..."
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddSkill();
                                        }
                                    }}
                                />
                                <Button type="button" onClick={handleAddSkill}>
                                    Add
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Links */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Social Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="website">
                                    <Globe className="h-4 w-4 inline mr-2" />
                                    Website
                                </Label>
                                <Input
                                    id="website"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="linkedin">
                                    <Linkedin className="h-4 w-4 inline mr-2" />
                                    LinkedIn
                                </Label>
                                <Input
                                    id="linkedin"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleInputChange}
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>
                            <div>
                                <Label htmlFor="github">
                                    <Github className="h-4 w-4 inline mr-2" />
                                    GitHub
                                </Label>
                                <Input
                                    id="github"
                                    name="github"
                                    value={formData.github}
                                    onChange={handleInputChange}
                                    placeholder="https://github.com/username"
                                />
                            </div>
                            <div>
                                <Label htmlFor="twitter">
                                    <Twitter className="h-4 w-4 inline mr-2" />
                                    Twitter
                                </Label>
                                <Input
                                    id="twitter"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleInputChange}
                                    placeholder="@username"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
