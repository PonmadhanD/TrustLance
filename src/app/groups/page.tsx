"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Clock,
  Users,
  DollarSign,
  Briefcase,
  ChevronDown
} from "lucide-react";

const categories = [
  "All Categories",
  "Web Development",
  "Mobile Apps",
  "Design",
  "Writing",
  "Data / AI",
  "Marketing"
];

const projectTypes = ["All Types", "Fixed", "Hourly", "Contest"];
const experienceLevels = ["All Levels", "Beginner", "Intermediate", "Expert"];

const projects = [
  {
    id: 1,
    title: "E-commerce Website Development",
    description: "Need a modern e-commerce website built with React and Node.js. Should include payment integration, user authentication, and admin dashboard.",
    skills: ["React", "Node.js", "MongoDB", "Payment Integration"],
    budget: { min: 50000, max: 80000, type: "Fixed" },
    timeRemaining: "6 days left",
    bidCount: 12,
    experienceLevel: "Intermediate"
  },
  {
    id: 2,
    title: "Mobile App UI/UX Design",
    description: "Looking for a talented designer to create modern UI/UX for our fitness tracking mobile app. Need wireframes, mockups, and prototypes.",
    skills: ["UI/UX Design", "Figma", "Mobile Design", "Prototyping"],
    budget: { min: 25000, max: 40000, type: "Fixed" },
    timeRemaining: "4 days left",
    bidCount: 8,
    experienceLevel: "Expert"
  },
  {
    id: 3,
    title: "Content Writing for Tech Blog",
    description: "Need experienced tech writers to create engaging blog posts about AI, machine learning, and software development trends.",
    skills: ["Content Writing", "Technical Writing", "SEO", "Research"],
    budget: { min: 500, max: 1000, type: "Hourly" },
    timeRemaining: "2 days left",
    bidCount: 15,
    experienceLevel: "Intermediate"
  },
  {
    id: 4,
    title: "Data Analysis and Visualization",
    description: "Analyze sales data and create interactive dashboards using Python and Tableau. Experience with machine learning preferred.",
    skills: ["Python", "Data Analysis", "Tableau", "Machine Learning"],
    budget: { min: 35000, max: 50000, type: "Fixed" },
    timeRemaining: "5 days left",
    bidCount: 6,
    experienceLevel: "Expert"
  }
];

export default function ProjectsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" ||
      project.skills.some(skill => skill.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesType = selectedType === "All Types" || project.budget.type === selectedType;
    const matchesLevel = selectedLevel === "All Levels" || project.experienceLevel === selectedLevel;

    return matchesSearch && matchesCategory && matchesType && matchesLevel;
  });

  const handleBidNow = (projectId: number) => {
    // Redirect to bid form or login
    console.log(`Bidding on project ${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Projects</h1>
          <p className="text-gray-600 mt-2">Find projects posted by clients and start earning today</p>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <div className="w-80 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Filters</h3>

                {/* Search */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search projects..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (INR)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      placeholder="Min"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      placeholder="Max"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Project Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {projectTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Experience Level */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Project List */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">{filteredProjects.length} projects found</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest first</option>
                <option value="budget-high">Budget high to low</option>
                <option value="budget-low">Budget low to high</option>
              </select>
            </div>

            {/* Project Cards */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-20">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects available at the moment</h3>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/post-project')}
                >
                  Post a Project
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <button
                            className="text-xl font-semibold text-blue-600 hover:text-blue-800 text-left mb-2"
                            onClick={() => router.push(`/projects/${project.id}`)}
                          >
                            {project.title}
                          </button>
                          <p className="text-gray-700 mb-4 leading-relaxed">{project.description}</p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>
                                ₹{project.budget.min.toLocaleString()} - ₹{project.budget.max.toLocaleString()}
                                {project.budget.type === "Hourly" && "/hr"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              <span>{project.budget.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{project.timeRemaining}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{project.bidCount} bids</span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-6">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleBidNow(project.id)}
                          >
                            Bid Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm" className="bg-blue-600 text-white">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 