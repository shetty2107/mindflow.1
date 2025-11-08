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

const SUBJECT_CONTEXTS: Record<string, string> = {
  "Mathematics": "You are a Mathematics tutor. Focus on problem-solving strategies, formulas, practice problems, and step-by-step solutions. Suggest techniques like working backwards, pattern recognition, and proof writing.",
  "Science": "You are a Science educator. Focus on experiments, scientific method, concept understanding, diagrams, and real-world applications. Suggest lab techniques, observation skills, and hypothesis testing.",
  "Literature": "You are a Literature professor. Focus on reading comprehension, literary analysis, themes, character development, and writing skills. Suggest close reading techniques, annotation methods, and critical thinking about texts.",
  "History": "You are a History teacher. Focus on timelines, cause-and-effect relationships, primary sources, and contextual understanding. Suggest memorization techniques for dates, connecting events, and analyzing historical perspectives.",
  "Computer Science & Engineering": "You are a Computer Science instructor. Focus on coding practice, algorithms, debugging, system design, and project building. Suggest hands-on programming, pseudocode writing, and breaking down complex problems.",
  "Other": "You are an educational mentor. Provide general study strategies and time management techniques tailored to the subject matter."
};

const SUBJECT_TIPS: Record<string, string> = {
  "Mathematics": "Pro tip: Always write out your work step-by-step, even for 'easy' problems. It builds muscle memory and catches errors!",
  "Science": "Pro tip: Draw diagrams and visual models as you study. Science concepts stick better when you can see them!",
  "Literature": "Pro tip: Keep a reading journal with your reactions and questions. Your first impressions are valuable for analysis!",
  "History": "Pro tip: Create mental 'story chains' connecting events. History is easier to remember as a narrative, not isolated facts!",
  "Computer Science & Engineering": "Pro tip: Code along with examples and break them on purpose. Learning what fails teaches you what works!",
  "Other": "Pro tip: Teach someone else what you're learning. If you can explain it simply, you truly understand it!"
};

export async function generateStudyPlan(request: StudyPlanRequest): Promise<string> {
  const { rawTasks, availableHours, subject, challenges } = request;

  const challengesText = challenges.length > 0
    ? `The student is facing these challenges: ${challenges.join(", ")}.`
    : "";

  const systemContext = SUBJECT_CONTEXTS[subject] || SUBJECT_CONTEXTS["Other"];
  const subjectTip = SUBJECT_TIPS[subject] || SUBJECT_TIPS["Other"];

  const prompt = `Create a ${availableHours}-hour study plan for ${subject}.

Tasks to cover:
${rawTasks}

${challengesText}

Requirements:
- Break down into time blocks appropriate for ${subject}
- Start with easier/foundational concepts
- Include ${subject}-specific study strategies
- Add short breaks (5-10 min every hour)
- Keep it concise and actionable

${subjectTip}

Format as a simple schedule with time blocks and clear actions.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${systemContext} Create SHORT, actionable study plans specific to this subject. Use bullet points. Be concise. Max 500 characters. Focus on subject-appropriate techniques.`
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

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  completed: boolean;
}

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  estimatedHours: number;
  prerequisites: string[];
}

export async function generateLearningRoadmap(
  tasks: Task[],
  subject: string,
  language: string = 'English'
): Promise<RoadmapNode[]> {
  if (tasks.length === 0) {
    return [];
  }

  const tasksList = tasks.map((t, i) => 
    `${i + 1}. ${t.title}${t.description ? ` - ${t.description}` : ''} [${t.priority} priority, ${t.completed ? 'done' : 'pending'}]`
  ).join('\n');

  const prompt = `Analyze these ${subject} learning tasks and create a structured learning roadmap in ${language}.

Tasks:
${tasksList}

Create a JSON array of learning milestones with this EXACT structure:
[
  {
    "id": "step-1",
    "title": "Milestone title",
    "description": "What to learn/accomplish",
    "status": "completed|current|upcoming",
    "estimatedHours": 2,
    "prerequisites": []
  }
]

Rules:
- Create 4-6 logical learning milestones
- Order from foundational to advanced
- Mark completed tasks as "completed", first pending as "current", rest as "upcoming"
- Estimate realistic hours for each milestone
- List prerequisite milestone IDs where applicable
- Use ${language} for all text
- Return ONLY valid JSON array, no markdown or explanation`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an educational curriculum designer. Respond ONLY with valid JSON array. No markdown, no code blocks, just pure JSON starting with [ and ending with ].`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 1000,
    });

    const text = chatCompletion.choices[0]?.message?.content?.trim();
    
    if (!text) {
      throw new Error('Empty response from AI');
    }

    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const roadmap = JSON.parse(cleanedText);

    if (!Array.isArray(roadmap)) {
      throw new Error('Invalid roadmap format');
    }

    return roadmap;
  } catch (error) {
    console.error('AI roadmap generation error:', error);
    return tasks.slice(0, 5).map((task, index) => ({
      id: `step-${index + 1}`,
      title: task.title,
      description: task.description || 'Complete this task',
      status: task.completed ? 'completed' : (index === 0 ? 'current' : 'upcoming'),
      estimatedHours: 2,
      prerequisites: index > 0 ? [`step-${index}`] : []
    }));
  }
}
