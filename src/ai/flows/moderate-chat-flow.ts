
'use server';
/**
 * @fileOverview A chat message moderation AI agent.
 *
 * - moderateChat - A function that handles the chat moderation process.
 * - ModerateChatInput - The input type for the moderateChat function.
 * - ModerateChatOutput - The return type for the moderateChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateChatInputSchema = z.object({
  message: z.string().describe('The chat message to moderate.'),
});
export type ModerateChatInput = z.infer<typeof ModerateChatInputSchema>;

const ModerateChatOutputSchema = z.object({
  isAppropriate: z
    .boolean()
    .describe('Whether or not the message is appropriate.'),
  reason: z
    .string()
    .optional()
    .describe(
      'A brief reason why the message was flagged as inappropriate. This will be shown to the user.'
    ),
});
export type ModerateChatOutput = z.infer<typeof ModerateChatOutputSchema>;

export async function moderateChat(
  input: ModerateChatInput
): Promise<ModerateChatOutput> {
  return moderateChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateChatPrompt',
  input: {schema: ModerateChatInputSchema},
  output: {schema: ModerateChatOutputSchema},
  prompt: `You are a chat message moderator for a professional community. Your task is to determine if a message is appropriate for a public chat. The message should be respectful and not contain any violence, hate speech, bullying, harassment, or other harmful content.

Analyze the following message and determine if it is appropriate.

Message: {{{message}}}

If the message is appropriate, set isAppropriate to true. If it is inappropriate, set isAppropriate to false and provide a brief, user-friendly reason why it was flagged.`,
});

const moderateChatFlow = ai.defineFlow(
  {
    name: 'moderateChatFlow',
    inputSchema: ModerateChatInputSchema,
    outputSchema: ModerateChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
