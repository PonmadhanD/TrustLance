'use server';

/**
 * @fileOverview An AI agent that recommends relevant freelancers or projects to users.
 *
 * - getAIProjectRecommendations - A function that handles the project recommendation process.
 * - AIProjectRecommendationsInput - The input type for the getAIProjectRecommendations function.
 * - AIProjectRecommendationsOutput - The return type for the getAIProjectRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIProjectRecommendationsInputSchema = z.object({
  userProfile: z
    .string()
    .describe('The user profile, including skills, experience, and past activity.'),
  desiredRecommendationType: z
    .enum(['freelancers', 'projects'])
    .describe('The type of recommendation desired: either freelancers or projects.'),
  numberOfRecommendations: z
    .number()
    .int()
    .positive()
    .default(5)
    .describe('The number of recommendations to return.'),
});
export type AIProjectRecommendationsInput = z.infer<typeof AIProjectRecommendationsInputSchema>;

const AIProjectRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      id: z.string().describe('The ID of the recommended freelancer or project.'),
      name: z.string().describe('The name of the recommended freelancer or project.'),
      description: z.string().describe('A short description of the recommendation.'),
      matchScore: z
        .number()
        .min(0)
        .max(1)
        .describe('A score indicating how well the recommendation matches the user.'),
    })
  ).describe('A list of recommended freelancers or projects.'),
});
export type AIProjectRecommendationsOutput = z.infer<typeof AIProjectRecommendationsOutputSchema>;

export async function getAIProjectRecommendations(
  input: AIProjectRecommendationsInput
): Promise<AIProjectRecommendationsOutput> {
  return aiProjectRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiProjectRecommendationsPrompt',
  input: {schema: AIProjectRecommendationsInputSchema},
  output: {schema: AIProjectRecommendationsOutputSchema},
  prompt: `You are an AI assistant that recommends relevant freelancers or projects to users based on their profile and past activity.

  User Profile: {{{userProfile}}}
  Recommendation Type: {{{desiredRecommendationType}}}
  Number of Recommendations: {{{numberOfRecommendations}}}

  Based on this information, provide a list of recommendations that match the user's needs. Each recommendation should include an ID, name, description, and a match score between 0 and 1.

  Ensure the recommendations are tailored to the specified recommendation type (freelancers or projects).
  The output should be a JSON object with a "recommendations" array.
  Follow the schema Zod descriptions to return the object in the correct format.
  `,
});

const aiProjectRecommendationsFlow = ai.defineFlow(
  {
    name: 'aiProjectRecommendationsFlow',
    inputSchema: AIProjectRecommendationsInputSchema,
    outputSchema: AIProjectRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

 