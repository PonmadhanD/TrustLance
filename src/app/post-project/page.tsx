'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useWallet } from '@/contexts/wallet-context';
import { TokenInput } from '@/components/ui/token-input';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, ArrowRight, Check, Upload, X, Plus, FileText, AlertTriangle } from 'lucide-react';
import Logo from '@/components/logo';
import Link from 'next/link';
import { AgreementModal } from '@/components/dashboard/agreement-modal';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ethers } from 'ethers';
import { CONFIG } from '@/lib/config';

interface ProjectData {
  title: string;
  description: string;
  files: File[];
  intent: 'hire' | 'job' | '';
  category: string;
  subcategory: string;
  budgetType: 'fixed' | 'hourly' | '';
  budgetAmount: string; // Changed from budgetRange
  startDate: string;
  endDate: string;
  experienceLevel: string;
  skills: string[];
  location: string;
  visibility: 'public' | 'private';
  clientSignature?: string;
}

const categories = {
  'design': {
    label: 'Design Work',
    subcategories: ['Graphic Design', 'Web Design', 'UI/UX Design', 'Branding', 'Other']
  },
  'development': {
    label: 'Development Work',
    subcategories: ['Web Development', 'Mobile Apps', 'Desktop Software', 'API Development', 'Other']
  },
  'content': {
    label: 'Content Creation',
    subcategories: ['Writing & Translation', 'Video & Animation', 'Photography', 'Voice Over', 'Other']
  },
  'marketing': {
    label: 'Marketing',
    subcategories: ['Digital Marketing', 'SEO', 'Social Media', 'Content Marketing', 'Other']
  },
  'other': {
    label: 'Other',
    subcategories: ['Data Entry', 'Virtual Assistant', 'Consulting', 'Custom']
  }
};

const skillSuggestions = {
  'Web Design': ['HTML', 'CSS', 'JavaScript', 'Figma', 'Adobe XD', 'Responsive Design'],
  'Graphic Design': ['Adobe Photoshop', 'Adobe Illustrator', 'Figma', 'Canva', 'Logo Design'],
  'Web Development': ['React', 'Node.js', 'Python', 'PHP', 'WordPress', 'JavaScript'],
  'Mobile Apps': ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin']
};

export default function PostProjectPage() {
  const { user } = useAuth();
  const { user: walletUser } = useWallet();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    description: '',
    files: [],
    intent: '',
    category: '',
    subcategory: '',
    budgetType: '',
    budgetAmount: '',
    startDate: '',
    endDate: '',
    experienceLevel: '',
    skills: [],
    location: 'anywhere',
    visibility: 'public',
    clientSignature: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [blockchainStep, setBlockchainStep] = useState<'idle' | 'approving' | 'locking' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);

  if (!user) {
    return null; // Let ConditionalLayout handle the redirect
  }

  const totalSteps = 9;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!projectData.title.trim()) newErrors.title = 'Project title is required';
        if (projectData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
        if (!projectData.description.trim()) newErrors.description = 'Project description is required';
        if (projectData.description.length < 30) newErrors.description = 'Description must be at least 30 characters';
        break;
      case 2:
        if (!projectData.intent) newErrors.intent = 'Please select an option';
        break;
      case 3:
        if (!projectData.category) newErrors.category = 'Please select a category';
        break;
      case 4:
        if (!projectData.subcategory) newErrors.subcategory = 'Please select a subcategory';
        break;
      case 5:
        if (!projectData.budgetType) newErrors.budgetType = 'Please select budget type';
        if (!projectData.budgetAmount) newErrors.budgetAmount = 'Please enter a budget amount';
        if (projectData.budgetAmount && isNaN(parseFloat(projectData.budgetAmount))) newErrors.budgetAmount = 'Please enter a valid amount';
        if (!projectData.startDate) newErrors.startDate = 'Please select a start date';
        if (!projectData.endDate) newErrors.endDate = 'Please select an end date';
        if (projectData.startDate && projectData.endDate && new Date(projectData.startDate) >= new Date(projectData.endDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
        if (!projectData.experienceLevel) newErrors.experienceLevel = 'Please select experience level';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2 && projectData.intent === 'job') {
        router.push('/find-jobs');
        return;
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addSkill = (skill: string) => {
    if (skill && !projectData.skills.includes(skill) && projectData.skills.length < 10) {
      setProjectData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setProjectData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProjectData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const removeFile = (index: number) => {
    setProjectData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const submitProject = async () => {
    try {
      setLoading(true);
      setBlockchainStep('idle');

      const budgetValue = parseFloat(projectData.budgetAmount);
      const budgetWei = ethers.parseUnits(projectData.budgetAmount, 18);
      const tempProjectId = `PROJ_${Math.random().toString(36).substring(7).toUpperCase()}`;

      // 0. CONFIG VALIDATION
      if (CONFIG.TRUST_TOKEN_ADDRESS.toLowerCase() === CONFIG.ESCROW_CONTRACT_ADDRESS.toLowerCase()) {
        setBlockchainStep('error');
        throw new Error("Misconfiguration: TrustToken and Escrow contract addresses cannot be the same. Please deploy the Escrow contract and update your config.");
      }

      // 1. BLOCKCHAIN VALIDATION
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error("MetaMask is not installed. Please install it to post projects.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId.toString() !== CONFIG.NETWORK_ID) {
        setBlockchainStep('error');
        alert(`Please switch your network to ${CONFIG.NETWORK_NAME} (Chain ID: ${CONFIG.NETWORK_ID})`);
        return;
      }

      const signer = await provider.getSigner();

      // 2. LOCK FUNDS IN ESCROW (Native SHM)
      setBlockchainStep('locking');
      const escrowAbi = ["function lockFunds(string memory projectId) public payable"];
      const escrowContract = new ethers.Contract(CONFIG.ESCROW_CONTRACT_ADDRESS, escrowAbi, signer);

      try {
        const lockTx = await escrowContract.lockFunds(tempProjectId, {
          value: budgetWei
        });
        console.log("Lock TX:", lockTx.hash);
        setTxHash(lockTx.hash);
        await lockTx.wait();
      } catch (err: any) {
        console.error("Locking failed:", err);
        throw new Error(`Locking SHM in escrow failed: ${err.reason || err.message}`);
      }

      setBlockchainStep('success');

      // 4. SAVE TO DATABASE
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: projectData.title,
          description: projectData.description,
          category: projectData.category,
          subcategory: projectData.subcategory,
          budget_type: projectData.budgetType,
          budget_range: `${budgetValue}`, // Required by database
          budget_amount: budgetValue, // New field
          budget_min: budgetValue, // Legacy support
          budget_max: budgetValue, // Legacy support
          start_date: projectData.startDate,
          end_date: projectData.endDate,
          experience_level: projectData.experienceLevel,
          skills: projectData.skills,
          location_preference: projectData.location,
          visibility: projectData.visibility,
          client_signature: projectData.clientSignature,
          client_signed_at: new Date().toISOString(),
          blockchain_tx: txHash,
          escrow_locked: true,
          temp_id: tempProjectId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to sync project to server after blockchain success.');
      }

      const data = await response.json();

      // Redirect to My Projects page after successful creation
      router.push('/my-projects?posted=true');
    } catch (error: any) {
      console.error('Error creating project:', error);
      setBlockchainStep('error');
      alert(`Failed to create project: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us what you need done</h2>
              <p className="text-gray-600">We'll guide you to create the perfect brief. The more detail, the better.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="e.g., Build a modern e-commerce website"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Description *</label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 ${errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Describe your project in detail. Include specific requirements, features, and any preferences you have."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                  <p className="text-gray-500 text-sm ml-auto">{projectData.description.length} characters</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Upload files to help explain your project</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                    Choose files
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, ZIP, Images (Max 10MB each)</p>
                </div>

                {projectData.files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {projectData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Are you trying to hire a freelancer?</h2>
              <p className="text-gray-600">Let us know your intent so we can guide you properly.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setProjectData(prev => ({ ...prev, intent: 'hire' }))}
                className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${projectData.intent === 'hire' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${projectData.intent === 'hire' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                    {projectData.intent === 'hire' && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">✅ Yes, I want to hire a freelancer</p>
                    <p className="text-sm text-gray-600">I have a project and need to find skilled freelancers</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setProjectData(prev => ({ ...prev, intent: 'job' }))}
                className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${projectData.intent === 'job' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${projectData.intent === 'job' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                    {projectData.intent === 'job' && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">❌ No, I'm looking for a job</p>
                    <p className="text-sm text-gray-600">I'm a freelancer seeking work opportunities</p>
                  </div>
                </div>
              </button>
            </div>

            {errors.intent && <p className="text-red-500 text-sm">{errors.intent}</p>}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What kind of service are you looking for?</h2>
              <p className="text-gray-600">Choose the category that best fits your project.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(categories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setProjectData(prev => ({ ...prev, category: key, subcategory: '' }))}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${projectData.category === key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{category.label}</p>
                    {projectData.category === key && <Check className="h-5 w-5 text-blue-500" />}
                  </div>
                </button>
              ))}
            </div>

            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
          </div>
        );

      case 4:
        const selectedCategory = categories[projectData.category as keyof typeof categories];
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What specific type of {selectedCategory?.label.toLowerCase()} do you need?</h2>
              <p className="text-gray-600">This helps us match you with the right freelancers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedCategory?.subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setProjectData(prev => ({ ...prev, subcategory: sub }))}
                  className={`p-3 border-2 rounded-lg text-left transition-colors ${projectData.subcategory === sub ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{sub}</p>
                    {projectData.subcategory === sub && <Check className="h-5 w-5 text-blue-500" />}
                  </div>
                </button>
              ))}
            </div>

            {errors.subcategory && <p className="text-red-500 text-sm">{errors.subcategory}</p>}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Details</h2>
              <p className="text-gray-600">Help freelancers understand your project scope and requirements.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Budget Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ key: 'fixed', label: 'Fixed Price' }, { key: 'hourly', label: 'Hourly Rate' }].map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setProjectData(prev => ({ ...prev, budgetType: type.key as 'fixed' | 'hourly' }))}
                      className={`p-3 border-2 rounded-lg transition-colors ${projectData.budgetType === type.key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <p className="font-medium text-gray-900">{type.label}</p>
                    </button>
                  ))}
                </div>
                {errors.budgetType && <p className="text-red-500 text-sm mt-1">{errors.budgetType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {projectData.budgetType === 'hourly' ? 'Hourly Rate' : 'Fixed Budget'} *
                </label>
                <TokenInput
                  value={projectData.budgetAmount}
                  onChange={(e) => setProjectData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                  availableBalance={walletUser?.balance}
                  error={errors.budgetAmount}
                  placeholder={projectData.budgetType === 'hourly' ? "e.g. 50.00" : "e.g. 500.00"}
                  helperText={
                    <span className="text-slate-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Tokens will be locked only when you accept a bid.
                    </span>
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Start Date *</label>
                  <input
                    type="date"
                    value={projectData.startDate ? new Date(projectData.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setProjectData(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                    min={new Date().toISOString().split('T')[0]}
                    className={cn(
                      "w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                      errors.startDate ? "border-red-500" : "border-gray-300"
                    )}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">End Date *</label>
                  <input
                    type="date"
                    value={projectData.endDate ? new Date(projectData.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setProjectData(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                    min={projectData.startDate ? new Date(projectData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    className={cn(
                      "w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                      errors.endDate ? "border-red-500" : "border-gray-300"
                    )}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Experience Level *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { key: 'beginner', label: 'Beginner', desc: 'New freelancers' },
                    { key: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
                    { key: 'expert', label: 'Expert', desc: 'Highly experienced' }
                  ].map((level) => (
                    <button
                      key={level.key}
                      onClick={() => setProjectData(prev => ({ ...prev, experienceLevel: level.key }))}
                      className={`p-3 border-2 rounded-lg transition-colors ${projectData.experienceLevel === level.key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <p className="font-medium text-gray-900">{level.label}</p>
                      <p className="text-sm text-gray-600">{level.desc}</p>
                    </button>
                  ))}
                </div>
                {errors.experienceLevel && <p className="text-red-500 text-sm mt-1">{errors.experienceLevel}</p>}
              </div>
            </div>
          </div>
        );

      case 6:
        const suggestedSkills = skillSuggestions[projectData.subcategory as keyof typeof skillSuggestions] || [];
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills & Technology</h2>
              <p className="text-gray-600">What skills should freelancers have? (Max 10 skills)</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Skills</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill(skillInput)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a skill and press Enter"
                  />
                  <Button onClick={() => addSkill(skillInput)} disabled={!skillInput || projectData.skills.length >= 10}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {suggestedSkills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Suggested Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        disabled={projectData.skills.includes(skill) || projectData.skills.length >= 10}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 disabled:opacity-50"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {projectData.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Skills ({projectData.skills.length}/10)</p>
                  <div className="flex flex-wrap gap-2">
                    {projectData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Location & Visibility</h2>
              <p className="text-gray-600">Set your preferences for freelancer location and project visibility.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Freelancer Location Preference</label>
                <div className="space-y-2">
                  {[
                    { key: 'anywhere', label: 'Anywhere in the world' },
                    { key: 'same-country', label: 'Same country as me' },
                    { key: 'specific', label: 'Specific country' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setProjectData(prev => ({ ...prev, location: option.key }))}
                      className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${projectData.location === option.key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${projectData.location === option.key ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                          {projectData.location === option.key && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <p className="font-medium text-gray-900">{option.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Project Visibility</label>
                <div className="space-y-2">
                  {[
                    { key: 'public', label: 'Public', desc: 'Anyone can see and bid on this project' },
                    { key: 'private', label: 'Private', desc: 'Only invited freelancers can see this project' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setProjectData(prev => ({ ...prev, visibility: option.key as 'public' | 'private' }))}
                      className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${projectData.visibility === option.key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${projectData.visibility === option.key ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                          {projectData.visibility === option.key && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Digital Service Agreement</h2>
              <p className="text-gray-600">Please review and digitally sign the service agreement to proceed.</p>
            </div>

            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              {!projectData.clientSignature ? (
                <div className="text-center py-12 space-y-4">
                  <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold">Agreement Pending Signature</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">You must sign the digital agreement before you can post this project.</p>
                  <Button
                    onClick={() => setShowAgreement(true)}
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    Open Agreement & Sign
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-bold text-green-800">Agreement Digitally Signed Successfully</span>
                    <Button variant="ghost" size="sm" onClick={() => setShowAgreement(true)} className="ml-auto text-xs text-green-700 underline">Update Signature</Button>
                  </div>
                  <div className="border rounded-xl p-4 bg-gray-50 flex items-center justify-center h-32">
                    <img src={projectData.clientSignature} alt="Signature" className="max-h-full object-contain mix-blend-multiply" />
                  </div>
                </div>
              )}
            </div>

            <AgreementModal
              isOpen={showAgreement}
              onClose={() => setShowAgreement(false)}
              onSign={(sig) => {
                setProjectData(prev => ({ ...prev, clientSignature: sig }));
                setShowAgreement(false);
              }}
              userRole="client"
              data={{
                clientName: user?.name || 'Authorized Client',
                clientWallet: (user as any)?.wallet_address || '0x00...000',
                freelancerName: 'TBD (Awarded Freelancer)',
                freelancerWallet: 'TBD',
                projectId: 'PROJ-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                projectTitle: projectData.title,
                projectDescription: projectData.description,
                milestones: [
                  { title: "Initial Project Phase", description: "Based on project requirements", tokens: 100 }
                ]
              }}
            />
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
              <p className="text-gray-600">Please review your project details before posting.</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Project Title</h3>
                  <p className="text-gray-700">{projectData.title}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Description</h3>
                  <p className="text-gray-700">{projectData.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Category</h3>
                    <p className="text-gray-700">{categories[projectData.category as keyof typeof categories]?.label} → {projectData.subcategory}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">Budget</h3>
                    <p className="text-gray-700">
                      {projectData.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly'} -{' '}
                      <span className="font-medium">{projectData.budgetAmount} SHM</span>
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">Project Timeline</h3>
                    <p className="text-gray-700">
                      {projectData.startDate && projectData.endDate
                        ? `${format(new Date(projectData.startDate), "PPP")} → ${format(new Date(projectData.endDate), "PPP")}`
                        : 'Not selected'}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">Experience Level</h3>
                    <p className="text-gray-700 capitalize">{projectData.experienceLevel}</p>
                  </div>
                </div>

                {projectData.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Skills Required</h3>
                    <div className="flex flex-wrap gap-2">
                      {projectData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Location Preference</h3>
                    <p className="text-gray-700 capitalize">{projectData.location.replace('-', ' ')}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">Visibility</h3>
                    <p className="text-gray-700 capitalize">{projectData.visibility}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Logo className="text-blue-600" asLink={false} />
              </Link>
              <div className="hidden md:block">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Step {currentStep} of {totalSteps}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  {renderStep()}

                  {/* Navigation */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>

                    {currentStep === totalSteps ? (
                      <div className="flex gap-3">
                        <Button variant="outline" disabled={loading}>Save as Draft</Button>
                        <Button
                          onClick={submitProject}
                          className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
                          disabled={loading}
                        >
                          {blockchainStep === 'locking' && 'Locking SHM...'}
                          {blockchainStep === 'success' && 'Project Live!'}
                          {loading && blockchainStep === 'idle' && 'Posting...'}
                          {!loading && 'Post Project'}
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Helper Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💡 Tips for Success</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p>• Be specific about your requirements</p>
                  <p>• Include examples or references</p>
                  <p>• Set a realistic budget and timeline</p>
                  <p>• List all necessary skills</p>
                  <p>• Respond quickly to freelancer questions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🚀 What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Get proposals</p>
                      <p>Freelancers will submit bids within hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Review & hire</p>
                      <p>Compare profiles and choose the best fit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Get work done</p>
                      <p>Collaborate and track progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
