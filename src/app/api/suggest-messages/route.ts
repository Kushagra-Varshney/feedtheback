import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

  try {
    const text = await generateText({
      model: openai('gpt-4o-2024-05-13'),
      prompt,
    });
  
    return Response.json(
        {
            success: true,
            message: text,
        },
        { status: 200 }
    );

  } catch (error) {
    console.error('Failed to suggest messages');
    return Response.json(
      {
        success: false,
        message: 'Failed to suggest messages',
      },
      { status: 500 }
    );
  }
}