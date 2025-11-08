import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error('GROQ_API_KEY is not set in environment variables');
}

const groq = new Groq({
  apiKey: apiKey || '',
});

interface StudyPlanRequest {
  rawTasks: string;
  availableHours: number;
  subject: string;
  challenges: string[];
}

export async function generateStudyPlan(request: StudyPlanRequest): Promise<string> {
  const { rawTasks, availableHours, subject, challenges } = request;

  const challengesText = challenges.length > 0
    ? `The student is facing these challenges: ${challenges.join(", ")}.`
    : "";

  const prompt = `You're a smart study buddy helping with ${subject}. Create a personalized ${availableHours}-hour plan.

Tasks to cover:
${rawTasks}

${challengesText}

Make it:
- Friendly and motivating
- Start with easiest task (build confidence!)
- Include strategic breaks
- Add 1 unique study hack for ${subject}
- End with an encouraging message

Format: Simple time blocks with clear actions`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are MindFlow AI. Create SHORT, actionable study plans. Use bullet points. Be concise. Max 500 characters. Focus on what matters."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 400,
    });

    const text = chatCompletion.choices[0]?.message?.content;
    
    if (!text) {
      throw new Error('Empty response from AI');
    }

    return text;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate study plan. Please try again.');
  }
}

export async function adaptPlanToEmotion(
  originalPlan: string,
  emotion: string,
  intensity: number
): Promise<string> {
  const prompt = `Student feeling: ${emotion} (${intensity}/5)
Original plan:
${originalPlan}

Adapt this plan BRIEFLY for their mood. Max 5 bullet points. Be encouraging.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are MindFlow AI. Adapt study plans to emotions. Be brief, supportive, actionable. Max 400 characters."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 400,
    });

    const text = chatCompletion.choices[0]?.message?.content;
    
    if (!text) {
      throw new Error('Empty response from AI');
    }

    return text;
  } catch (error) {
    console.error('AI adaptation error:', error);
    throw new Error('Failed to adapt study plan. Please try again.');
  }
}
