"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, GraduationCap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Education {
    id: string;
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: string;
    end_date: string | null;
}

export function EducationList({ userId }: { userId: string }) {
    const { toast } = useToast();
    const [education, setEducation] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // New Entry State
    const [newEdu, setNewEdu] = useState({
        institution: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchEducation();
    }, [userId]);

    async function fetchEducation() {
        if (!userId) return;
        const { data, error } = await supabase
            .from('user_education')
            .select('*')
            .eq('user_id', userId)
            .order('start_date', { ascending: false });

        if (!error && data) setEducation(data);
        setLoading(false);
    }

    async function handleAdd() {
        if (!newEdu.institution || !newEdu.degree) {
            toast({ title: "Validation Error", description: "Institution and Degree are required.", variant: "destructive" });
            return;
        }
        setAdding(true);
        const { data, error } = await supabase
            .from('user_education')
            .insert({
                user_id: userId,
                institution: newEdu.institution,
                degree: newEdu.degree,
                field_of_study: newEdu.field_of_study,
                start_date: newEdu.start_date || null,
                end_date: newEdu.end_date || null
            })
            .select()
            .single();

        if (error) {
            toast({ title: "Error", description: "Failed to add education.", variant: "destructive" });
        } else if (data) {
            setEducation([data, ...education]);
            setNewEdu({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '' });
            toast({ title: "Success", description: "Education added." });
        }
        setAdding(false);
    }

    async function handleDelete(id: string) {
        const { error } = await supabase.from('user_education').delete().eq('id', id);
        if (!error) {
            setEducation(education.filter(e => e.id !== id));
            toast({ title: "Deleted", description: "Entry removed." });
        }
    }

    if (loading) return <div className="text-center p-4">Loading education...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* List */}
                <div className="space-y-4">
                    {education.map(edu => (
                        <div key={edu.id} className="flex justify-between items-start p-4 border rounded-lg bg-slate-50">
                            <div className="flex gap-4">
                                <div className="mt-1 bg-white p-2 rounded-full border shadow-sm">
                                    <GraduationCap className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{edu.institution}</h4>
                                    <p className="text-sm text-gray-600">{edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {edu.start_date ? new Date(edu.start_date).getFullYear() : '?'} -
                                        {edu.end_date ? new Date(edu.end_date).getFullYear() : 'Present'}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(edu.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {education.length === 0 && <p className="text-center text-gray-500 py-4">No education entries yet.</p>}
                </div>

                {/* Add Form */}
                <div className="border-t pt-6 mt-6">
                    <h4 className="text-sm font-medium mb-4">Add New Education</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input placeholder="Institution / University" value={newEdu.institution} onChange={e => setNewEdu({ ...newEdu, institution: e.target.value })} />
                        <Input placeholder="Degree (e.g. BSc, Masters)" value={newEdu.degree} onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })} />
                        <Input placeholder="Field of Study" value={newEdu.field_of_study} onChange={e => setNewEdu({ ...newEdu, field_of_study: e.target.value })} />
                        <div className="grid grid-cols-2 gap-2">
                            <Input type="date" placeholder="Start Date" value={newEdu.start_date} onChange={e => setNewEdu({ ...newEdu, start_date: e.target.value })} />
                            <Input type="date" placeholder="End Date" value={newEdu.end_date} onChange={e => setNewEdu({ ...newEdu, end_date: e.target.value })} />
                        </div>
                    </div>
                    <Button onClick={handleAdd} disabled={adding} className="w-full">
                        {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        Add Education
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
 