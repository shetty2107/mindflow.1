import express from "express"
import cors from "cors"
import Anthropic from "@anthropic-ai/sdk"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const client = new Anthropic()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// Data file path for persistence
const dataDir = path.join(__dirname, "data")
const usersFile = path.join(dataDir, "users.json")
const sessionFile = path.join(dataDir, "sessions.json")

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (err) {
    console.error("Error creating data directory:", err)
  }
}

// Load users database
async function loadUsers() {
  try {
    const data = await fs.readFile(usersFile, "utf-8")
    return JSON.parse(data)
  } catch (err) {
    return {}
  }
}

// Save users database
async function saveUsers(users) {
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2))
}

// Load sessions
async function loadSessions() {
  try {
    const data = await fs.readFile(sessionFile, "utf-8")
    return JSON.parse(data)
  } catch (err) {
    return {}
  }
}

// Save sessions
async function saveSessions(sessions) {
  await fs.writeFile(sessionFile, JSON.stringify(sessions, null, 2))
}

// Generate unique session ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function generateStudyPlan(userInput) {
  const prompt = `You are an expert educational AI that creates personalized study plans adapted to individual student needs.

User Input:
- Tasks to study: ${userInput.tasks}
- Knowledge level: ${userInput.knowledge}
- Available hours today: ${userInput.hours}
- Main deadline: ${userInput.deadline}
- Challenges faced: ${userInput.challenges.join(", ")}
- Peak energy time: ${userInput.energyTime}

Generate a detailed, personalized study plan in JSON format with the following structure:
{
  "plan": [
    {
      "id": 1,
      "name": "Task name",
      "subject": "Subject",
      "duration": 45,
      "difficulty": "easy|medium|hard",
      "focus": "Specific focus area",
      "tip": "Study tip",
      "order": 1,
      "type": "task"
    },
    {
      "id": 2,
      "type": "break",
      "name": "Break name",
      "duration": 10,
      "activity": "Break activity"
    }
  ],
  "totalTasks": 8,
  "totalStudyTime": 240,
  "totalBreakTime": 40,
  "adaptations": ["adaptation 1", "adaptation 2"],
  "personalizedMessage": "Motivational message for the student"
}

Requirements:
1. Order tasks to match ${userInput.energyTime} energy patterns (morning tasks first for morning people, etc)
2. Include breaks every 45-50 minutes of study
3. Adapt difficulty based on ${userInput.knowledge} level
4. Consider ${userInput.challenges.join(", ")} when creating the plan
5. Ensure total study time fits within ${userInput.hours} hours
6. Include specific, actionable study tips for each task
7. Break complex topics into manageable subtasks
8. Add variety to prevent monotony

Return ONLY valid JSON, no additional text.`

  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === "text" ? message.content[0].text : ""
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error("No JSON found in response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Error generating study plan:", error)
    throw error
  }
}

async function generateEmotionFeedback(emotion, currentPlan) {
  const prompt = `Based on a student's current emotional state and their study plan, provide adaptive feedback.

Student's emotion: ${emotion}
Current plan summary: ${JSON.stringify(currentPlan.adaptations || [])}

Provide a JSON response with:
{
  "message": "Empathetic, encouraging message specific to their emotion",
  "adjustments": ["specific adjustment 1", "specific adjustment 2"],
  "newDifficulty": "easy|medium|hard",
  "recommendedBreakLength": 5|10|15,
  "motivationalTip": "A specific tip to help with their current emotion"
}

For ${emotion} emotion:
- If happy/focused: Keep challenge level, add celebration milestones
- If normal: Maintain balanced pace
- If anxious: Reduce difficulty by one level, increase break time, add calming activities
- If tired: Switch to passive learning, increase breaks, reduce duration
- If frustrated: Start with easy wins, build momentum gradually

Return ONLY valid JSON.`

  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === "text" ? message.content[0].text : ""
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error("No JSON found in response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Error generating emotion feedback:", error)
    throw error
  }
}

app.post("/api/session/start", async (req, res) => {
  try {
    const sessionId = generateSessionId()
    const sessions = await loadSessions()

    sessions[sessionId] = {
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      formData: null,
      studyPlan: null,
      currentEmotion: null,
      tasksCompleted: [],
      stats: {
        currentStreak: 0,
        totalHours: 0,
        tasksCompletedToday: 0,
      },
    }

    await saveSessions(sessions)
    res.json({ sessionId, message: "Session created successfully" })
  } catch (error) {
    console.error("Error creating session:", error)
    res.status(500).json({ error: "Failed to create session" })
  }
})

app.post("/api/study-plan/generate", async (req, res) => {
  try {
    const { sessionId, formData } = req.body

    if (!sessionId || !formData) {
      return res.status(400).json({ error: "Missing sessionId or formData" })
    }

    // Validate form data
    if (!formData.tasks || !formData.deadline || !formData.knowledge || !formData.energyTime) {
      return res.status(400).json({ error: "Missing required form fields" })
    }

    console.log(`[v0] Generating study plan for session ${sessionId}`)

    // Generate study plan using AI
    const studyPlan = await generateStudyPlan(formData)

    // Save to session
    const sessions = await loadSessions()
    if (sessions[sessionId]) {
      sessions[sessionId].formData = formData
      sessions[sessionId].studyPlan = studyPlan
      sessions[sessionId].lastActivity = new Date().toISOString()
      await saveSessions(sessions)
    }

    console.log(`[v0] Study plan generated successfully with ${studyPlan.plan.length} items`)

    res.json({
      success: true,
      plan: studyPlan,
      sessionId,
    })
  } catch (error) {
    console.error("Error generating study plan:", error)
    res.status(500).json({ error: "Failed to generate study plan", details: error.message })
  }
})

app.post("/api/study-plan/adapt-emotion", async (req, res) => {
  try {
    const { sessionId, emotion } = req.body

    if (!sessionId || !emotion) {
      return res.status(400).json({ error: "Missing sessionId or emotion" })
    }

    const sessions = await loadSessions()
    const session = sessions[sessionId]

    if (!session || !session.studyPlan) {
      return res.status(404).json({ error: "Session or study plan not found" })
    }

    console.log(`[v0] Adapting plan for emotion: ${emotion}`)

    const feedback = await generateEmotionFeedback(emotion, session.studyPlan)

    // Update session
    sessions[sessionId].currentEmotion = emotion
    sessions[sessionId].lastActivity = new Date().toISOString()
    await saveSessions(sessions)

    console.log(`[v0] Plan adapted with ${feedback.adjustments.length} adjustments`)

    res.json({
      success: true,
      feedback,
      emotion,
    })
  } catch (error) {
    console.error("Error adapting study plan:", error)
    res.status(500).json({ error: "Failed to adapt study plan", details: error.message })
  }
})

app.post("/api/task/complete", async (req, res) => {
  try {
    const { sessionId, taskId } = req.body

    if (!sessionId || taskId === undefined) {
      return res.status(400).json({ error: "Missing sessionId or taskId" })
    }

    const sessions = await loadSessions()
    if (!sessions[sessionId]) {
      return res.status(404).json({ error: "Session not found" })
    }

    const session = sessions[sessionId]
    const task = session.studyPlan.plan.find((t) => t.id === taskId)

    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    // Record completion
    if (!session.tasksCompleted.includes(taskId)) {
      session.tasksCompleted.push(taskId)

      // Calculate study time if it's an actual task
      if (task.type !== "break") {
        session.stats.tasksCompletedToday += 1
      }
    }

    session.lastActivity = new Date().toISOString()
    await saveSessions(sessions)

    console.log(`[v0] Task ${taskId} marked complete for session ${sessionId}`)

    res.json({
      success: true,
      stats: session.stats,
      completedTasksCount: session.tasksCompleted.length,
    })
  } catch (error) {
    console.error("Error completing task:", error)
    res.status(500).json({ error: "Failed to complete task" })
  }
})

app.get("/api/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params

    const sessions = await loadSessions()
    const session = sessions[sessionId]

    if (!session) {
      return res.status(404).json({ error: "Session not found" })
    }

    res.json({
      success: true,
      session: {
        sessionId,
        ...session,
      },
    })
  } catch (error) {
    console.error("Error fetching session:", error)
    res.status(500).json({ error: "Failed to fetch session" })
  }
})

app.post("/api/study-plan/regenerate", async (req, res) => {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" })
    }

    const sessions = await loadSessions()
    const session = sessions[sessionId]

    if (!session || !session.formData) {
      return res.status(404).json({ error: "Session or form data not found" })
    }

    console.log(`[v0] Regenerating study plan for session ${sessionId}`)

    // Generate new study plan with same form data
    const newStudyPlan = await generateStudyPlan(session.formData)

    // Update session
    session.studyPlan = newStudyPlan
    session.tasksCompleted = []
    session.lastActivity = new Date().toISOString()
    await saveSessions(sessions)

    res.json({
      success: true,
      plan: newStudyPlan,
    })
  } catch (error) {
    console.error("Error regenerating study plan:", error)
    res.status(500).json({ error: "Failed to regenerate study plan", details: error.message })
  }
})

app.get("/api/wellness-tips", (req, res) => {
  const wellnessTips = [
    "The Pomodoro Technique: Study for 25 minutes, break for 5. It works!",
    "Hydration helps focus. Drink water every hour.",
    "Natural light improves mood and concentration. Study near a window if possible.",
    "Movement is medicine. A 10-minute walk boosts cognitive function.",
    "Sleep > Cramming. Your brain consolidates learning during sleep.",
    "Deep breathing for 2 minutes reduces anxiety and improves focus.",
    "Background music without lyrics can enhance concentration for some people.",
    "Teach what you learn to solidify understanding.",
    "Take breaks BEFORE you feel exhausted, not after.",
    "Your brain works better when you are kind to yourself. Self-compassion matters.",
    "Spaced repetition is key to long-term retention.",
    "Eliminate distractions: silence notifications during study sessions.",
    "Study in the same location each day to build habit cues.",
    "Active recall is more effective than passive reading.",
    "Interleave different topics to improve learning transfer.",
  ]

  res.json({
    tips: wellnessTips,
    randomTip: wellnessTips[Math.floor(Math.random() * wellnessTips.length)],
  })
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MindFlow backend is running" })
})

// Initialize data directory and start server
async function startServer() {
  await ensureDataDir()

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`MindFlow backend server running on http://localhost:${PORT}`)
    console.log("Ready to accept requests for study plan generation and session management")
  })
}

startServer().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})
