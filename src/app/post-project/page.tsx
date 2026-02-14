'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useWallet } from '@/contexts/wallet-context';
import { TokenInput } from '@/components/ui/token-input';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, ArrowRight, Check, Upload, X, Plus, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import Logo from '@/components/logo';
import Link from 'next/link';
import { AgreementModal } from '@/components/dashboard/agreement-modal';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ethers } from 'ethers';
import { CONFIG } from '@/lib/config';

// --- Types ---
interface ProjectData {
  title: string;
  description: string;
  files: File[];
  intent: 'hire' | 'job' | '';
  category: string;
  subcategory: string;
  budgetType: 'fixed' | 'hourly' | '';
  budgetAmount: string;
  startDate: string;
  endDate: string;
  experienceLevel: string;
  skills: string[];
  location: string;
  visibility: 'public' | 'private';
  clientSignature?: string;
}

// --- Static Data ---
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

// --- Memoized Step Components ---

const StepHeader = ({ title, description }: { title: string, description: string }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Step1TitleDesc = React.memo(({ data, errors, onChange, onFileUpload, onRemoveFile }: any) => (
  <div className="space-y-6">
    <StepHeader title="Tell us what you need done" description="We'll guide you to create the perfect brief. The more detail, the better." />
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="e.g., Build a modern e-commerce website"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project Description *</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Describe your project in detail. Include specific requirements, features, and any preferences you have."
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          <p className="text-gray-500 text-sm ml-auto">{data.description.length} characters</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">Upload files to help explain your project</p>
          <input type="file" multiple accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png" onChange={onFileUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">Choose files</label>
        </div>
        {data.files.length > 0 && (
          <div className="mt-3 space-y-2">
            {data.files.map((file: any, index: number) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-700">{file.name}</span>
                <button onClick={() => onRemoveFile(index)} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
));

const Step2Intent = React.memo(({ intent, onChange, error }: any) => (
  <div className="space-y-6">
    <StepHeader title="Are you trying to hire a freelancer?" description="Let us know your intent so we can guide you properly." />
    <div className="space-y-3">
      {['hire', 'job'].map((val) => (
        <button
          key={val}
          onClick={() => onChange({ intent: val })}
          className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${intent === val ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full border-2 mr-3 ${intent === val ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
              {intent === val && <Check className="h-3 w-3 text-white" />}
            </div>
            <div>
              <p className="font-medium text-gray-900">{val === 'hire' ? '✅ Yes, I want to hire a freelancer' : "❌ No, I'm looking for a job"}</p>
              <p className="text-sm text-gray-600">{val === 'hire' ? 'I have a project and need to find skilled freelancers' : "I'm a freelancer seeking work opportunities"}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
));

const Step3Category = React.memo(({ selected, onChange, error }: any) => (
  <div className="space-y-6">
    <StepHeader title="What kind of service are you looking for?" description="Choose the category that best fits your project." />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(categories).map(([key, category]) => (
        <button
          key={key}
          onClick={() => onChange({ category: key, subcategory: '' })}
          className={`p-4 border-2 rounded-lg text-left transition-colors ${selected === key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-900">{category.label}</p>
            {selected === key && <Check className="h-5 w-5 text-blue-500" />}
          </div>
        </button>
      ))}
    </div>
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
));

const Step4Subcategory = React.memo(({ category, selected, onChange, error }: any) => {
  const selectedCategory = categories[category as keyof typeof categories];
  return (
    <div className="space-y-6">
      <StepHeader title={`What specific type of ${selectedCategory?.label.toLowerCase()} do you need?`} description="This helps us match you with the right freelancers." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {selectedCategory?.subcategories.map((sub) => (
          <button
            key={sub}
            onClick={() => onChange({ subcategory: sub })}
            className={`p-3 border-2 rounded-lg text-left transition-colors ${selected === sub ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">{sub}</p>
              {selected === sub && <Check className="h-5 w-5 text-blue-500" />}
            </div>
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
});

const Step5Details = React.memo(({ data, onChange, balance, errors }: any) => (
  <div className="space-y-6">
    <StepHeader title="Project Details" description="Help freelancers understand your project scope and requirements." />
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Budget Type *</label>
        <div className="grid grid-cols-2 gap-3">
          {[{ key: 'fixed', label: 'Fixed Price' }, { key: 'hourly', label: 'Hourly Rate' }].map((type) => (
            <button
              key={type.key}
              onClick={() => onChange({ budgetType: type.key as any })}
              className={`p-3 border-2 rounded-lg transition-colors ${data.budgetType === type.key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <p className="font-medium text-gray-900">{type.label}</p>
            </button>
          ))}
        </div>
        {errors.budgetType && <p className="text-red-500 text-sm mt-1">{errors.budgetType}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">{data.budgetType === 'hourly' ? 'Hourly Rate' : 'Fixed Budget'} *</label>
        <TokenInput
          value={data.budgetAmount}
          onChange={(e) => onChange({ budgetAmount: e.target.value })}
          availableBalance={balance}
          error={errors.budgetAmount}
          placeholder={data.budgetType === 'hourly' ? "e.g. 50.00" : "e.g. 500.00"}
          helperText={<span className="text-slate-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />SHM will be locked in escrow.</span>}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Start Date *</label>
          <input type="date" value={data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : ''} onChange={(e) => onChange({ startDate: e.target.value ? new Date(e.target.value).toISOString() : '' })} min={new Date().toISOString().split('T')[0]} className={cn("w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", errors.startDate ? "border-red-500" : "border-gray-300")} />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">End Date *</label>
          <input type="date" value={data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : ''} onChange={(e) => onChange({ endDate: e.target.value ? new Date(e.target.value).toISOString() : '' })} min={data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className={cn("w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", errors.endDate ? "border-red-500" : "border-gray-300")} />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Experience Level *</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[{ key: 'beginner', label: 'Beginner', desc: 'New freelancers' }, { key: 'intermediate', label: 'Intermediate', desc: 'Some experience' }, { key: 'expert', label: 'Expert', desc: 'Highly experienced' }].map((level) => (
            <button key={level.key} onClick={() => onChange({ experienceLevel: level.key })} className={`p-3 border-2 rounded-lg transition-colors ${data.experienceLevel === level.key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <p className="font-medium text-gray-900">{level.label}</p>
              <p className="text-sm text-gray-600">{level.desc}</p>
            </button>
          ))}
        </div>
        {errors.experienceLevel && <p className="text-red-500 text-sm mt-1">{errors.experienceLevel}</p>}
      </div>
    </div>
  </div>
));

const Step6Skills = React.memo(({ subcategory, selectedSkills, onAddSkill, onRemoveSkill, skillInput, setSkillInput }: any) => {
  const suggestedSkills = skillSuggestions[subcategory as keyof typeof skillSuggestions] || [];
  return (
    <div className="space-y-6">
      <StepHeader title="Skills & Technology" description="What skills should freelancers have? (Max 10 skills)" />
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Add Skills</label>
        <div className="flex gap-2">
          <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && onAddSkill(skillInput)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type a skill and press Enter" />
          <Button onClick={() => onAddSkill(skillInput)} disabled={!skillInput || selectedSkills.length >= 10}><Plus className="h-4 w-4" /></Button>
        </div>
        {suggestedSkills.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Suggested Skills</p>
            <div className="flex flex-wrap gap-2">
              {suggestedSkills.map((skill: string) => (
                <button key={skill} onClick={() => onAddSkill(skill)} disabled={selectedSkills.includes(skill) || selectedSkills.length >= 10} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 disabled:opacity-50">{skill}</button>
              ))}
            </div>
          </div>
        )}
        {selectedSkills.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Selected Skills ({selectedSkills.length}/10)</p>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill: string) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">{skill}<button onClick={() => onRemoveSkill(skill)} className="ml-1 hover:text-red-500"><X className="h-3 w-3" /></button></Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const Step7Visibility = React.memo(({ data, onChange }: any) => (
  <div className="space-y-6">
    <StepHeader title="Location & Visibility" description="Set your preferences for freelancer location and project visibility." />
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Freelancer Location Preference</label>
        <div className="space-y-2">
          {[{ key: 'anywhere', label: 'Anywhere in the world' }, { key: 'same-country', label: 'Same country as me' }, { key: 'specific', label: 'Specific country' }].map((option) => (
            <button key={option.key} onClick={() => onChange({ location: option.key })} className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${data.location === option.key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${data.location === option.key ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>{data.location === option.key && <Check className="h-3 w-3 text-white" />}</div>
                <p className="font-medium text-gray-900">{option.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Project Visibility</label>
        <div className="space-y-2">
          {[{ key: 'public', label: 'Public', desc: 'Anyone can see and bid on this project' }, { key: 'private', label: 'Private', desc: 'Only invited freelancers can see this project' }].map((option) => (
            <button key={option.key} onClick={() => onChange({ visibility: option.key })} className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${data.visibility === option.key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${data.visibility === option.key ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>{data.visibility === option.key && <Check className="h-3 w-3 text-white" />}</div>
                <div><p className="font-medium text-gray-900">{option.label}</p><p className="text-sm text-gray-600">{option.desc}</p></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
));

const Step8Agreement = React.memo(({ signature, onShowAgreement }: any) => (
  <div className="space-y-6">
    <StepHeader title="Digital Service Agreement" description="Please review and digitally sign the service agreement to proceed." />
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      {!signature ? (
        <div className="text-center py-12 space-y-4">
          <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600"><FileText className="h-8 w-8" /></div>
          <h3 className="text-lg font-bold">Agreement Pending Signature</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">You must sign the digital agreement before you can post this project.</p>
          <Button onClick={onShowAgreement} className="bg-blue-600 hover:bg-blue-700 rounded-xl">Open Agreement & Sign</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100"><Check className="h-5 w-5 text-green-600" /><span className="text-sm font-bold text-green-800">Agreement Digitally Signed Successfully</span><Button variant="ghost" size="sm" onClick={onShowAgreement} className="ml-auto text-xs text-green-700 underline">Update Signature</Button></div>
          <div className="border rounded-xl p-4 bg-gray-50 flex items-center justify-center h-32"><img src={signature} alt="Signature" className="max-h-full object-contain mix-blend-multiply" /></div>
        </div>
      )}
    </div>
  </div>
));

const Step9Review = React.memo(({ projectData }: any) => (
  <div className="space-y-6">
    <StepHeader title="Review & Confirm" description="Please review your project details before posting." />
    <Card>
      <CardContent className="p-6 space-y-4">
        <div><h3 className="font-semibold text-gray-900">Project Title</h3><p className="text-gray-700">{projectData.title}</p></div>
        <div><h3 className="font-semibold text-gray-900">Description</h3><p className="text-gray-700">{projectData.description}</p></div>
        <div className="grid grid-cols-2 gap-4">
          <div><h3 className="font-semibold text-gray-900">Category</h3><p className="text-gray-700">{categories[projectData.category as keyof typeof categories]?.label} → {projectData.subcategory}</p></div>
          <div><h3 className="font-semibold text-gray-900">Budget</h3><p className="text-gray-700">{projectData.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly'} - <span className="font-medium">{projectData.budgetAmount} SHM</span></p></div>
          <div><h3 className="font-semibold text-gray-900">Project Timeline</h3><p className="text-gray-700">{projectData.startDate && projectData.endDate ? `${format(new Date(projectData.startDate), "PPP")} → ${format(new Date(projectData.endDate), "PPP")}` : 'Not selected'}</p></div>
          <div><h3 className="font-semibold text-gray-900">Experience Level</h3><p className="text-gray-700 capitalize">{projectData.experienceLevel}</p></div>
        </div>
        {projectData.skills.length > 0 && (
          <div><h3 className="font-semibold text-gray-900 mb-2">Skills Required</h3><div className="flex flex-wrap gap-2">{projectData.skills.map((skill: string) => (<Badge key={skill} variant="secondary">{skill}</Badge>))}</div></div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div><h3 className="font-semibold text-gray-900">Location Preference</h3><p className="text-gray-700 capitalize">{projectData.location.replace('-', ' ')}</p></div>
          <div><h3 className="font-semibold text-gray-900">Visibility</h3><p className="text-gray-700 capitalize">{projectData.visibility}</p></div>
        </div>
      </CardContent>
    </Card>
  </div>
));

// --- Main Page Component ---

export default function PostProjectPage() {
  const { user } = useAuth();
  const { user: walletUser } = useWallet();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '', description: '', files: [], intent: '', category: '', subcategory: '', budgetType: '', budgetAmount: '', startDate: '', endDate: '', experienceLevel: '', skills: [], location: 'anywhere', visibility: 'public', clientSignature: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [blockchainStep, setBlockchainStep] = useState<'idle' | 'approving' | 'locking' | 'success' | 'error'>('idle');

  const totalSteps = 9;

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!projectData.title.trim()) newErrors.title = 'Project title is required';
      else if (projectData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
      if (!projectData.description.trim()) newErrors.description = 'Project description is required';
      else if (projectData.description.length < 30) newErrors.description = 'Description must be at least 30 characters';
    } else if (step === 2 && !projectData.intent) newErrors.intent = 'Please select an option';
    else if (step === 3 && !projectData.category) newErrors.category = 'Please select a category';
    else if (step === 4 && !projectData.subcategory) newErrors.subcategory = 'Please select a subcategory';
    else if (step === 5) {
      if (!projectData.budgetType) newErrors.budgetType = 'Please select budget type';
      if (!projectData.budgetAmount) newErrors.budgetAmount = 'Please enter a budget amount';
      else if (isNaN(parseFloat(projectData.budgetAmount))) newErrors.budgetAmount = 'Please enter a valid amount';
      if (!projectData.startDate) newErrors.startDate = 'Please select a start date';
      if (!projectData.endDate) newErrors.endDate = 'Please select an end date';
      else if (projectData.startDate && projectData.endDate && new Date(projectData.startDate) >= new Date(projectData.endDate)) newErrors.endDate = 'End date must be after start date';
      if (!projectData.experienceLevel) newErrors.experienceLevel = 'Please select experience level';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [projectData]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep === 2 && projectData.intent === 'job') {
        router.push('/find-jobs');
        return;
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  }, [currentStep, projectData.intent, router, validateStep]);

  const prevStep = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 1)), []);

  const addSkill = useCallback((skill: string) => {
    if (skill && !projectData.skills.includes(skill) && projectData.skills.length < 10) {
      setProjectData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      setSkillInput('');
    }
  }, [projectData.skills]);

  const removeSkill = useCallback((skill: string) => {
    setProjectData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProjectData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  }, []);

  const removeFile = useCallback((index: number) => {
    setProjectData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  }, []);

  const updateData = useCallback((updates: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...updates }));
  }, []);

  const submitProject = async () => {
    try {
      setLoading(true);
      setBlockchainStep('idle');
      const budgetValue = parseFloat(projectData.budgetAmount);
      const budgetWei = ethers.parseUnits(projectData.budgetAmount, 18);
      const tempProjectId = `PROJ_${Math.random().toString(36).substring(7).toUpperCase()}`;

      if (typeof window === 'undefined' || !window.ethereum) throw new Error("MetaMask is not installed.");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      if (network.chainId.toString() !== CONFIG.NETWORK_ID) {
        alert(`Please switch to ${CONFIG.NETWORK_NAME}`);
        return;
      }

      const signer = await provider.getSigner();
      setBlockchainStep('locking');
      const escrowAbi = ["function lockFunds(string memory projectId) public payable"];
      const escrowContract = new ethers.Contract(CONFIG.ESCROW_CONTRACT_ADDRESS, escrowAbi, signer);

      const lockTx = await escrowContract.lockFunds(tempProjectId, { value: budgetWei });
      console.log("Wait for confirmation:", lockTx.hash);
      await lockTx.wait();
      setBlockchainStep('success');

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectData.title,
          description: projectData.description,
          category: projectData.category,
          subcategory: projectData.subcategory,
          budget_type: projectData.budgetType,
          budget_range: `${budgetValue}`,
          budget_amount: budgetValue,
          start_date: projectData.startDate,
          end_date: projectData.endDate,
          experience_level: projectData.experienceLevel,
          skills: projectData.skills,
          location_preference: projectData.location,
          visibility: projectData.visibility,
          client_signature: projectData.clientSignature,
          client_signed_at: new Date().toISOString(),
          blockchain_tx: lockTx.hash,
          escrow_locked: true,
          temp_id: tempProjectId
        }),
      });

      if (!response.ok) throw new Error('Failed to sync project to server.');
      router.push('/my-projects?posted=true');
    } catch (error: any) {
      console.error('Submission failed:', error);
      setBlockchainStep('error');
      alert(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1TitleDesc data={projectData} errors={errors} onChange={updateData} onFileUpload={handleFileUpload} onRemoveFile={removeFile} />;
      case 2: return <Step2Intent intent={projectData.intent} onChange={updateData} error={errors.intent} />;
      case 3: return <Step3Category selected={projectData.category} onChange={updateData} error={errors.category} />;
      case 4: return <Step4Subcategory category={projectData.category} selected={projectData.subcategory} onChange={updateData} error={errors.subcategory} />;
      case 5: return <Step5Details data={projectData} onChange={updateData} balance={walletUser?.balance} errors={errors} />;
      case 6: return <Step6Skills subcategory={projectData.subcategory} selectedSkills={projectData.skills} onAddSkill={addSkill} onRemoveSkill={removeSkill} skillInput={skillInput} setSkillInput={setSkillInput} />;
      case 7: return <Step7Visibility data={projectData} onChange={updateData} />;
      case 8: return <Step8Agreement signature={projectData.clientSignature} onShowAgreement={() => setShowAgreement(true)} />;
      case 9: return <Step9Review projectData={projectData} />;
      default: return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard"><Logo className="text-blue-600" asLink={false} /></Link>
            <div className="hidden md:block text-sm text-gray-600 flex items-center gap-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8"><AvatarFallback>{user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}</AvatarFallback></Avatar>
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                {renderStep()}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || loading}>
                    <ArrowLeft className="h-4 w-4 mr-2" />Back
                  </Button>
                  {currentStep === totalSteps ? (
                    <div className="flex gap-3">
                      <Button variant="outline" disabled={loading}>Save as Draft</Button>
                      <Button onClick={submitProject} className="bg-blue-600 hover:bg-blue-700 min-w-[140px]" disabled={loading}>
                        {blockchainStep === 'locking' ? (
                          <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Pending...</span>
                        ) : blockchainStep === 'success' ? 'Project Live!' : loading ? 'Posting...' : 'Post Project'}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">Next<ArrowRight className="h-4 w-4 ml-2" /></Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card><CardHeader><CardTitle className="text-lg">💡 Tips for Success</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-gray-600"><p>• Be specific</p><p>• Include examples</p><p>• Realistic budget</p></CardContent></Card>
          </div>
        </div>
      </div>

      <AgreementModal
        isOpen={showAgreement}
        onClose={() => setShowAgreement(false)}
        onSign={(sig) => { updateData({ clientSignature: sig }); setShowAgreement(false); }}
        userRole="client"
        data={{
          clientName: user?.name || '',
          clientWallet: (user as any)?.wallet_address || '',
          freelancerName: 'TBD',
          freelancerWallet: 'TBD',
          projectId: 'PROJ-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          projectTitle: projectData.title,
          projectDescription: projectData.description,
          milestones: [{ title: "Initial Project Phase", description: "Based on requirements", tokens: parseFloat(projectData.budgetAmount) || 0 }]
        }}
      />
    </div>
  );
}
