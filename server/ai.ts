import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error('GOOGLE_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey || '');
// Try gemini-1.5-flash-latest as it's the fast, free model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

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

  const prompt = `You are MindFlow, an AI study companion focused on mental wellness and personalized learning.

Create a detailed, compassionate study plan based on the following information:

Subject: ${subject}
Available Study Time: ${availableHours} hours
Tasks to Complete:
${rawTasks}

${challengesText}

Please create a personalized study plan that:
1. Breaks down the tasks into manageable chunks
2. Allocates time efficiently across the ${availableHours} hours
3. Takes into account the student's challenges (if mentioned)
4. Includes short breaks for mental wellness
5. Prioritizes tasks based on difficulty and importance
6. Provides encouraging, supportive guidance
7. Suggests specific study techniques for each task type

Format the plan as a clear, easy-to-follow schedule with time blocks and specific actions. Be warm, encouraging, and mindful of the student's mental health.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
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
  const prompt = `You are MindFlow, an AI study companion. A student is currently feeling ${emotion} (intensity: ${intensity}/5).

Their original study plan was:
${originalPlan}

Please adapt this plan to better suit their current emotional state. Consider:
- If they're stressed or overwhelmed: suggest shorter sessions, more breaks, easier tasks first
- If they're motivated or confident: encourage tackling harder tasks, longer focus sessions
- If they're anxious: provide reassurance, break tasks into smaller steps
- If they're calm: suggest this is a good time for challenging material

Provide an updated plan that respects their mental state while still being productive. Keep the same overall goals but adjust the approach. Be supportive and understanding.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from AI');
    }

    return text;
  } catch (error) {
    console.error('AI adaptation error:', error);
    throw new Error('Failed to adapt study plan. Please try again.');
  }
}
