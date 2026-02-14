const { ChatOpenAI } = require("@langchain/openai");
const { Ollama } = require("@langchain/community/llms/ollama");
const { createClient } = require('@supabase/supabase-js');
const { StructuredOutputParser } = require("langchain/output_parsers");
const { PromptTemplate } = require("@langchain/core/prompts");
const { z } = require("zod");

// Decision schema
const DisputeDecisionSchema = z.object({
    outcome: z.enum(['FREELANCER', 'CLIENT', 'PARTIAL']),
    freelancer_percentage: z.number().min(0).max(100),
    confidence_score: z.number().min(0).max(100),
    reasoning: z.string(),
    key_factors: z.array(z.string()),
    evidence_summary: z.string()
});

class DisputeResolutionAgent {
    constructor() {
        // Initialize LLM based on AI_PROVIDER
        const provider = process.env.AI_PROVIDER || 'ollama';

        if (provider === 'openai') {
            this.llm = new ChatOpenAI({
                modelName: process.env.MODEL_NAME || "gpt-3.5-turbo",
                temperature: 0.3,
                openAIApiKey: process.env.OPENAI_API_KEY
            });
        } else if (provider === 'ollama') {
            this.llm = new Ollama({
                baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
                model: "llama3:8b",
                temperature: 0.3
            });
        } else if (provider === 'mock') {
            this.llm = null; // Use mock logic
        }

        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        this.parser = StructuredOutputParser.fromZodSchema(DisputeDecisionSchema);
    }

    /**
     * Analyze dispute and generate recommendation
     */
    async analyzeDispute(disputeId) {
        // Gather dispute data
        const disputeData = await this.gatherDisputeData(disputeId);

        // Check if using mock AI
        if (process.env.AI_PROVIDER === 'mock') {
            return this.mockDecision(disputeData);
        }

        // Make AI decision
        const decision = await this.makeDecision(disputeData);

        // Store recommendation
        await this.storeRecommendation(disputeId, decision);

        return decision;
    }

    /**
     * Mock decision (rule-based) for testing without AI
     */
    mockDecision(data) {
        const milestones = data.project.milestones || [];
        const totalMilestones = milestones.length;
        const approved = milestones.filter(m => m.status === 'approved' || m.status === 'paid').length;
        const completedPct = totalMilestones > 0 ? approved / totalMilestones : 0;

        if (completedPct > 0.8) {
            return {
                outcome: 'FREELANCER',
                freelancer_percentage: 100,
                confidence_score: 95,
                reasoning: `${approved} out of ${totalMilestones} milestones completed successfully. Freelancer delivered most of the work.`,
                key_factors: [
                    'High milestone completion rate',
                    'Majority of work delivered',
                    'Client approved most milestones'
                ],
                evidence_summary: 'Based on milestone approval history'
            };
        } else if (completedPct < 0.3) {
            return {
                outcome: 'CLIENT',
                freelancer_percentage: 0,
                confidence_score: 90,
                reasoning: `Only ${approved} out of ${totalMilestones} milestones completed. Insufficient work delivered.`,
                key_factors: [
                    'Low milestone completion rate',
                    'Minimal work delivered',
                    'Most milestones not approved'
                ],
                evidence_summary: 'Based on milestone approval history'
            };
        } else {
            const percentage = Math.round(completedPct * 100);
            return {
                outcome: 'PARTIAL',
                freelancer_percentage: percentage,
                confidence_score: 75,
                reasoning: `${approved} out of ${totalMilestones} milestones completed (${percentage}%). Partial work delivered.`,
                key_factors: [
                    'Partial milestone completion',
                    'Some value delivered',
                    'Mixed approval history'
                ],
                evidence_summary: 'Fair split based on completed work'
            };
        }
    }

    /**
     * Gather all dispute data
     */
    async gatherDisputeData(disputeId) {
        // Get dispute
        const { data: dispute } = await this.supabase
            .from('disputes')
            .select('*')
            .eq('id', disputeId)
            .single();

        // Get project with relations
        const { data: project } = await this.supabase
            .from('projects')
            .select(`
        *,
        client:users!client_id(*),
        freelancer:users!hired_freelancer_id(*),
        milestones(*)
      `)
            .eq('id', dispute.project_id)
            .single();

        // Get messages
        const { data: messages } = await this.supabase
            .from('messages')
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', { ascending: true });

        // Get evidence
        const { data: evidence } = await this.supabase
            .from('dispute_evidence')
            .select('*')
            .eq('dispute_id', disputeId);

        return {
            dispute,
            project,
            messages: messages || [],
            evidence: evidence || []
        };
    }

    /**
     * Make AI decision
     */
    async makeDecision(data) {
        const formatInstructions = this.parser.getFormatInstructions();

        const prompt = PromptTemplate.fromTemplate(`
You are a dispute resolution analyst. Analyze this freelance project dispute and provide a fair recommendation.

DISPUTE DETAILS:
- ID: {disputeId}
- Raised By: {raisedBy}
- Reason: {reason}
- Amount: ${data.dispute.amount}

PROJECT DETAILS:
- Title: {projectTitle}
- Status: {projectStatus}
- Total Milestones: {totalMilestones}
- Approved Milestones: {approvedMilestones}

ANALYSIS: Consider milestone completion, evidence quality, and fair outcomes.

{formatInstructions}
`);

        const milestones = data.project.milestones || [];
        const approved = milestones.filter(m => m.status === 'approved' || m.status === 'paid').length;

        const input = await prompt.format({
            disputeId: data.dispute.id,
            raisedBy: data.dispute.role,
            reason: data.dispute.reason,
            projectTitle: data.project.title,
            projectStatus: data.project.status,
            totalMilestones: milestones.length,
            approvedMilestones: approved,
            formatInstructions
        });

        const result = await this.llm.invoke(input);
        const content = typeof result === 'string' ? result : result.content;
        const decision = await this.parser.parse(content);

        return decision;
    }

    /**
     * Store recommendation
     */
    async storeRecommendation(disputeId, decision) {
        await this.supabase.from('ai_dispute_recommendations').insert({
            dispute_id: disputeId,
            recommended_outcome: decision.outcome,
            freelancer_percentage: decision.freelancer_percentage,
            confidence_score: decision.confidence_score,
            reasoning: decision.reasoning,
            key_factors: decision.key_factors,
            evidence_summary: decision.evidence_summary
        });
    }
}

module.exports = { DisputeResolutionAgent };
 