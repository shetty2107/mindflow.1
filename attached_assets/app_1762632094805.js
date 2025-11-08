// Sample Data
let sessionId = null
const emotionResponses = {
  happy: {
    message: "Awesome! Your energy is high. I've kept challenging tasks in your plan. You've got this! 💪",
    adjustment: "Keep plan as is, add celebration milestones",
  },
  normal: {
    message: "You're doing great! Steady focus wins the race. Let's make progress together! 🎯",
    adjustment: "Standard plan, balanced difficulty",
  },
  anxious: {
    message:
      "I see you're feeling anxious. I've reduced your workload by 20% and added calming break activities. Take it one small step at a time. 💙",
    adjustment: "Reduce task count, shorten durations, add calming breaks",
  },
  tired: {
    message:
      "You seem tired. Let's focus on easier, passive learning today - reading and review tasks. Your brain needs rest too. 😴",
    adjustment: "Switch to easy tasks, shorter durations, more breaks",
  },
  frustrated: {
    message: "Frustration is normal! I've reordered tasks to start with quick wins. Small victories build momentum. 🌟",
    adjustment: "Start with easiest tasks, build confidence",
  },
}

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
  "Your brain works better when you're kind to yourself. Self-compassion matters.",
]

// Application State
const appState = {
  currentPage: "homepage",
  studyPlan: [],
  userStats: {
    currentStreak: 7,
    totalHours: 42,
    subjectsCovered: 8,
    tasksCompletedToday: 3,
    tasksTotalToday: 8,
    weekHours: 12,
  },
  currentEmotion: null,
  energyTime: "morning",
  formData: {},
  pageHistory: [], // Track page history for proper back navigation
  detectedSubject: null, // Track detected subject
  customSubjects: {}, // Store custom subjects with their time estimates
}

// Comprehensive Subject Database with realistic time estimates per topic
const SUBJECT_DATABASE = {
  math: {
    name: "Mathematics",
    topics: ["algebra", "geometry", "calculus", "statistics", "probability", "trigonometry"],
    baseTimePerTopic: 45,
    difficulty: { beginner: 1.8, intermediate: 1.2, advanced: 0.8 },
  },
  science: {
    name: "Science",
    topics: ["biology", "chemistry", "physics", "earth science", "environmental science"],
    baseTimePerTopic: 50,
    difficulty: { beginner: 1.7, intermediate: 1.1, advanced: 0.75 },
  },
  history: {
    name: "History",
    topics: ["ancient history", "medieval", "modern history", "world events", "timelines"],
    baseTimePerTopic: 35,
    difficulty: { beginner: 1.4, intermediate: 1, advanced: 0.7 },
  },
  language: {
    name: "Language",
    topics: ["vocabulary", "grammar", "writing", "reading comprehension", "speaking"],
    baseTimePerTopic: 40,
    difficulty: { beginner: 1.6, intermediate: 1, advanced: 0.6 },
  },
  literature: {
    name: "Literature",
    topics: ["novel analysis", "poetry", "themes", "character study", "essays"],
    baseTimePerTopic: 40,
    difficulty: { beginner: 1.5, intermediate: 1, advanced: 0.7 },
  },
  economics: {
    name: "Economics",
    topics: ["microeconomics", "macroeconomics", "supply demand", "market trends"],
    baseTimePerTopic: 48,
    difficulty: { beginner: 1.7, intermediate: 1.1, advanced: 0.8 },
  },
  programming: {
    name: "Programming",
    topics: ["python", "javascript", "java", "algorithms", "data structures", "debugging"],
    baseTimePerTopic: 55,
    difficulty: { beginner: 2, intermediate: 1.3, advanced: 0.9 },
  },
  art: {
    name: "Art",
    topics: ["drawing", "color theory", "composition", "art history", "techniques"],
    baseTimePerTopic: 50,
    difficulty: { beginner: 1.3, intermediate: 1, advanced: 0.7 },
  },
  music: {
    name: "Music",
    topics: ["theory", "ear training", "instruments", "composition", "history"],
    baseTimePerTopic: 45,
    difficulty: { beginner: 1.5, intermediate: 1, advanced: 0.7 },
  },
  psychology: {
    name: "Psychology",
    topics: ["behavior", "cognition", "development", "disorders", "therapies"],
    baseTimePerTopic: 42,
    difficulty: { beginner: 1.4, intermediate: 1, advanced: 0.7 },
  },
}

function detectSubject(taskDescription) {
  const lowerTask = taskDescription.toLowerCase()
  const keywords = {
    math: ["math", "algebra", "calculus", "geometry", "equation", "number", "formula", "statistics"],
    science: ["science", "biology", "chemistry", "physics", "experiment", "atom", "molecule", "element"],
    history: ["history", "war", "revolution", "ancient", "medieval", "era", "century", "historical"],
    language: ["english", "spanish", "french", "german", "language", "grammar", "vocabulary", "translate"],
    literature: ["literature", "novel", "book", "poem", "poetry", "author", "essay", "story"],
    economics: ["economics", "economy", "market", "trade", "business", "finance", "money", "stock"],
    programming: ["coding", "code", "programming", "python", "javascript", "java", "debug", "algorithm"],
    art: ["art", "drawing", "painting", "sketch", "color", "design", "visual"],
    music: ["music", "song", "instrument", "melody", "rhythm", "note", "compose"],
    psychology: ["psychology", "behavior", "mind", "mental", "cognitive", "therapy", "emotion"],
  }

  for (const [subject, keywordList] of Object.entries(keywords)) {
    for (const keyword of keywordList) {
      if (lowerTask.includes(keyword)) {
        return subject
      }
    }
  }
  return null
}

// Page Navigation
function showPage(pageId) {
  if (appState.currentPage === pageId) return // Prevent duplicate navigation

  // Add current page to history
  if (appState.currentPage !== pageId && appState.currentPage !== "homepage") {
    appState.pageHistory.push(appState.currentPage)
  }

  const pages = document.querySelectorAll(".page")
  pages.forEach((page) => page.classList.remove("active"))

  const targetPage = document.getElementById(pageId)
  if (targetPage) {
    targetPage.classList.add("active")
    appState.currentPage = pageId

    // Initialize page-specific content
    if (pageId === "dashboard") {
      renderDashboard()
    } else if (pageId === "results") {
      renderResults()
    } else if (pageId === "braindump") {
      restoreFormData()
    }
  }
}

function goBack() {
  if (appState.pageHistory.length > 0) {
    const previousPage = appState.pageHistory.pop()
    const pages = document.querySelectorAll(".page")
    pages.forEach((page) => page.classList.remove("active"))

    const targetPage = document.getElementById(previousPage)
    if (targetPage) {
      targetPage.classList.add("active")
      appState.currentPage = previousPage

      if (previousPage === "dashboard") {
        renderDashboard()
      } else if (previousPage === "results") {
        renderResults()
      }
    }
  }
}

function restoreFormData() {
  if (Object.keys(appState.formData).length > 0) {
    document.getElementById("tasks").value = appState.formData.tasks || ""
    document.getElementById("deadline").value = appState.formData.deadline || ""
    document.getElementById("knowledge").value = appState.formData.knowledge || ""
    document.getElementById("energyTime").value = appState.formData.energyTime || ""
    document.getElementById("subject").value = appState.formData.subject || ""
    document.getElementById("customSubject").value = appState.formData.customSubject || ""

    const hoursValue = String(appState.formData.hours)
    const hoursRadio = document.querySelector(`input[name="hours"][value="${hoursValue}"]`)
    if (hoursRadio) hoursRadio.checked = true

    const challenges = appState.formData.challenges || []
    document.querySelectorAll('input[name="challenges"]').forEach((checkbox) => {
      checkbox.checked = challenges.includes(checkbox.value)
    })
  }
}

function getTimeEstimateForSubject(subject, knowledge) {
  let baseTime = 25

  if (SUBJECT_DATABASE[subject]) {
    const subjectData = SUBJECT_DATABASE[subject]
    baseTime = subjectData.baseTimePerTopic * (subjectData.difficulty[knowledge] || 1)
  } else if (appState.customSubjects[subject]) {
    baseTime = appState.customSubjects[subject] * (knowledge === "beginner" ? 1.5 : knowledge === "advanced" ? 0.7 : 1)
  }

  return Math.round(baseTime)
}

function generateStudyPlan(formData) {
  const tasksList = formData.tasks.split("\n").filter((t) => t.trim())
  const hours = formData.hours
  const totalMinutes = hours * 60
  const breakFrequency = 25

  const plan = []
  let taskId = 1

  const estimatedBreaks = Math.floor(totalMinutes / (breakFrequency + 5))
  const breakTime = estimatedBreaks * 5
  const studyTime = totalMinutes - breakTime

  const difficulties = ["easy", "medium", "hard"]
  const focuses = [
    "Understanding core concepts",
    "Practice problems",
    "Review and memorization",
    "Application and synthesis",
    "Deep practice",
    "Testing knowledge",
  ]

  tasksList.forEach((task, index) => {
    const cleanTask = task.trim()
    if (!cleanTask) return

    const timeEstimate = getTimeEstimateForSubject(formData.subject, formData.knowledge)
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
    const focus = focuses[index % focuses.length]

    const steps = Math.ceil(timeEstimate / 25)
    for (let step = 0; step < steps; step++) {
      const stepDuration = Math.min(25, timeEstimate - step * 25)

      plan.push({
        id: taskId++,
        name: `${cleanTask}${steps > 1 ? ` - Part ${step + 1}/${steps}` : ""}`,
        duration: stepDuration,
        difficulty: difficulty,
        focus: focus,
        tip: generateTip(difficulty, formData.challenges),
        progress: 0,
        completed: false,
        type: "task",
        subject: formData.subject,
      })
    }

    if (taskId % 2 === 0) {
      plan.push({
        id: taskId++,
        name: "Brain Break",
        duration: 5,
        activity: getBreakActivity(),
        type: "break",
      })
    }
  })

  if (formData.energyTime === "night") {
    plan.reverse()
  } else if (formData.energyTime === "afternoon") {
    const rotateIndex = Math.floor(plan.length / 3)
    const rotated = plan.slice(rotateIndex).concat(plan.slice(0, rotateIndex))
    plan.splice(0, plan.length, ...rotated)
  }

  return plan
}

function generateTip(difficulty, challenges) {
  const tips = {
    easy: "Start simple and build momentum 💪",
    medium: "Stay focused - you're getting stronger 🎯",
    hard: "Break it down into smaller pieces 🧩",
  }

  const challengeTips = {
    concentration: "Use the Pomodoro technique (25 min focus, 5 min break) 🍅",
    procrastination: "Start with just 5 minutes - momentum builds! 🚀",
    anxiety: "Take deep breaths and go slow. You got this. 💙",
    memory: "Teach someone else what you learn - it sticks better! 👥",
    time: "Multitask: listen to notes while exercising ⏰",
  }

  const hasChallenges = challenges && challenges.length > 0
  if (hasChallenges) {
    return challengeTips[challenges[0]] || tips[difficulty]
  }
  return tips[difficulty]
}

function getBreakActivity() {
  const activities = [
    "Stretch and breathe deeply 🧘",
    "Get a glass of water 💧",
    "Take a quick walk 🚶",
    "Do some jumping jacks ⚡",
    "Look away from screen, rest eyes 👀",
  ]
  return activities[Math.floor(Math.random() * activities.length)]
}

async function handleFormSubmit(event) {
  event.preventDefault()

  const selectedSubject = document.getElementById("subject").value
  const customSubjectInput = document.getElementById("customSubject").value.trim()

  let finalSubject = selectedSubject

  if (selectedSubject === "other" && customSubjectInput) {
    finalSubject = customSubjectInput.toLowerCase()
    if (!appState.customSubjects[finalSubject]) {
      const estimatedMinutes = prompt(
        `How many minutes on average for a ${customSubjectInput} topic? (default: 40)`,
        "40",
      )
      appState.customSubjects[finalSubject] = Math.max(20, Math.min(120, Number.parseInt(estimatedMinutes) || 40))
    }
  } else if (!finalSubject) {
    alert("Please select a subject or enter a custom one")
    return
  }

  const formData = {
    tasks: document.getElementById("tasks").value,
    deadline: document.getElementById("deadline").value,
    knowledge: document.getElementById("knowledge").value,
    hours: Number.parseInt(document.querySelector('input[name="hours"]:checked').value),
    challenges: Array.from(document.querySelectorAll('input[name="challenges"]:checked')).map((cb) => cb.value),
    energyTime: document.getElementById("energyTime").value,
    subject: finalSubject,
    customSubject: customSubjectInput,
  }

  if (!formData.tasks.trim()) {
    alert("Please describe what you need to study")
    return
  }

  appState.formData = formData
  appState.energyTime = formData.energyTime
  appState.detectedSubject = finalSubject

  document.getElementById("brainDumpForm").style.display = "none"
  const loadingState = document.getElementById("loadingState")
  loadingState.style.display = "block"

  const messages = [
    `Analyzing your ${finalSubject} tasks and optimizing your schedule...`,
    "Finding the perfect schedule for you...",
    "Breaking tasks into bite-sized pieces...",
    "Optimizing for your peak energy hours...",
  ]

  let messageIndex = 0
  const loadingMessage = document.getElementById("loadingMessage")

  const messageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length
    loadingMessage.textContent = messages[messageIndex]
  }, 1500)

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    appState.studyPlan = generateStudyPlan(formData)

    clearInterval(messageInterval)
    showPage("results")
  } catch (error) {
    console.error("[v0] Error generating study plan:", error)
    clearInterval(messageInterval)
    alert("Error generating study plan: " + error.message)

    document.getElementById("brainDumpForm").style.display = "block"
    loadingState.style.display = "none"
  }
}

function renderResults() {
  createConfetti()

  const tasks = appState.studyPlan.filter((task) => task.type !== "break")
  const breaks = appState.studyPlan.filter((task) => task.type === "break")

  const totalTasks = tasks.length
  const totalMinutes = tasks.reduce((sum, task) => sum + task.duration, 0)
  const breakMinutes = breaks.reduce((sum, task) => sum + task.duration, 0)

  document.getElementById("totalTasks").textContent = totalTasks
  document.getElementById("estimatedTime").textContent = (totalMinutes / 60).toFixed(1)
  document.getElementById("breakTime").textContent = breakMinutes

  const energyTimeText =
    appState.energyTime === "morning"
      ? "morning person"
      : appState.energyTime === "afternoon"
        ? "afternoon person"
        : appState.energyTime === "night"
          ? "night owl"
          : "your schedule"

  const subjectText = appState.detectedSubject ? ` for ${appState.detectedSubject}` : ""
  document.getElementById("resultsMessage").textContent = `Optimal schedule created for ${energyTimeText}${subjectText}`
}

function createConfetti() {
  const confettiContainer = document.getElementById("confetti")
  confettiContainer.innerHTML = ""

  const colors = ["#3B82F6", "#A78BFA", "#F59E0B", "#10B981", "#EF4444"]
  const confettiCount = 25

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div")
    confetti.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}%;
      top: -10px;
      opacity: ${Math.random()};
      pointer-events: none;
    `
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`

    confettiContainer.appendChild(confetti)

    const duration = 1500 + Math.random() * 1000
    const delay = Math.random() * 500

    setTimeout(() => {
      confetti.style.transition = `top ${duration}ms linear, transform ${duration}ms linear`
      confetti.style.top = "100%"
      confetti.style.transform = `rotate(${Math.random() * 720}deg)`
    }, delay)
  }
}

function renderDashboard() {
  renderTaskList()
  updateProgressStats()
  updateWellnessTip()
  updateEnergyOptimized()
}

function renderTaskList() {
  const taskList = document.getElementById("taskList")

  const fragment = document.createDocumentFragment()

  appState.studyPlan.forEach((task) => {
    if (task.type === "break") {
      fragment.appendChild(createBreakCard(task))
    } else {
      fragment.appendChild(createTaskCard(task))
    }
  })

  taskList.innerHTML = ""
  taskList.appendChild(fragment)
}

function createTaskCard(task) {
  const card = document.createElement("div")
  card.className = `task-card ${task.completed ? "completed" : ""}`
  card.innerHTML = `
        <div class="task-header">
            <div class="task-info">
                <h3>${task.name}</h3>
                <div class="task-meta">
                    <span class="task-duration">⏱️ ${task.duration} min</span>
                    <span class="difficulty-badge difficulty-${task.difficulty}">${task.difficulty}</span>
                    ${task.subject ? `<span class="subject-badge">${task.subject}</span>` : ""}
                </div>
            </div>
        </div>
        <p class="task-focus"><strong>Focus:</strong> ${task.focus}</p>
        <p class="task-tip">💡 ${task.tip}</p>
        <div class="task-progress">
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${task.progress}%"></div>
            </div>
        </div>
        <div class="task-actions">
            ${
              task.completed
                ? '<button class="btn-complete" disabled>✓ Completed</button>'
                : task.progress > 0
                  ? `<button class="btn-complete" onclick="completeTask(${task.id})">Mark Complete</button>`
                  : `<button class="btn-start" onclick="startTask(${task.id})">Start</button>`
            }
        </div>
    `
  return card
}

function createBreakCard(task) {
  const card = document.createElement("div")
  card.className = "break-card"
  card.innerHTML = `
        <h3>${task.name} ☕</h3>
        <p class="break-duration">${task.duration} minutes</p>
        <p class="break-activity">${task.activity}</p>
    `
  return card
}

function startTask(taskId) {
  const task = appState.studyPlan.find((t) => t.id === taskId)
  if (task) {
    task.progress = 50
    renderTaskList()
  }
}

function completeTask(taskId) {
  const task = appState.studyPlan.find((t) => t.id === taskId)
  if (task) {
    task.completed = true
    task.progress = 100

    showCelebration()
    renderTaskList()
    updateProgressStats()
  }
}

function showCelebration() {
  const celebration = document.createElement("div")
  celebration.className = "celebration"
  celebration.textContent = "🎉"
  document.body.appendChild(celebration)

  setTimeout(() => {
    celebration.remove()
  }, 1000)
}

function updateProgressStats() {
  const tasks = appState.studyPlan.filter((t) => t.type !== "break")
  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length
  const percentage = Math.round((completedTasks / totalTasks) * 100)

  const circle = document.getElementById("progressCircle")
  const circumference = 2 * Math.PI * 52
  const offset = circumference - (percentage / 100) * circumference
  circle.style.strokeDashoffset = offset

  if (!document.getElementById("progressGradient")) {
    const svg = circle.closest("svg")
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
    defs.innerHTML = `
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#A78BFA;stop-opacity:1" />
            </linearGradient>
        `
    svg.insertBefore(defs, svg.firstChild)
  }

  document.getElementById("progressPercent").textContent = `${percentage}%`
  document.getElementById("progressLabel").textContent = `${completedTasks} of ${totalTasks} tasks done`

  appState.userStats.tasksCompletedToday = completedTasks
  appState.userStats.tasksTotalToday = totalTasks

  document.getElementById("streakNumber").textContent = appState.userStats.currentStreak
  document.getElementById("weekHours").textContent = appState.userStats.weekHours
  document.getElementById("subjectsCovered").textContent = appState.userStats.subjectsCovered
}

function updateWellnessTip() {
  const tip = wellnessTips[Math.floor(Math.random() * wellnessTips.length)]
  document.getElementById("wellnessTip").textContent = tip
}

function updateEnergyOptimized() {
  const energyTimeText =
    appState.energyTime === "morning"
      ? "morning"
      : appState.energyTime === "afternoon"
        ? "afternoon"
        : appState.energyTime === "night"
          ? "night"
          : "peak"
  document.getElementById("energyOptimized").textContent = `Optimized for your ${energyTimeText} energy`
}

function selectEmotion(emotion) {
  appState.currentEmotion = emotion

  document.querySelectorAll(".emotion-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector(`[data-emotion="${emotion}"]`).classList.add("active")

  const feedback = emotionResponses[emotion]

  const feedbackEl = document.getElementById("emotionFeedback")
  feedbackEl.className = "emotion-feedback show"
  feedbackEl.innerHTML = `<p>${feedback.message}</p>`

  adaptPlanToEmotion(emotion)
}

function adaptPlanToEmotion(emotion) {
  if (emotion === "anxious" || emotion === "tired") {
    const tasks = appState.studyPlan.filter((t) => t.type !== "break")
    tasks.sort((a, b) => {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
    })
  } else if (emotion === "frustrated") {
    const tasks = appState.studyPlan.filter((t) => t.type !== "break")
    tasks.sort((a, b) => {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
    })
  }

  renderTaskList()
}

function regeneratePlan() {
  try {
    appState.studyPlan = generateStudyPlan(appState.formData)

    appState.studyPlan.forEach((task) => {
      if (task.type !== "break") {
        task.completed = false
        task.progress = 0
      }
    })

    appState.currentEmotion = null
    document.querySelectorAll(".emotion-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.getElementById("emotionFeedback").className = "emotion-feedback"
    document.getElementById("emotionFeedback").innerHTML = ""

    renderDashboard()
    alert("Plan regenerated! Fresh start with optimized schedule. 🔄")
  } catch (error) {
    console.error("[v0] Error regenerating plan:", error)
    alert("Error regenerating plan: " + error.message)
  }
}

window.addEventListener("DOMContentLoaded", () => {
  sessionId = "session_" + Math.random().toString(36).substr(2, 9)

  showPage("homepage")

  const today = new Date().toISOString().split("T")[0]
  const deadlineInput = document.getElementById("deadline")
  if (deadlineInput) {
    deadlineInput.min = today
  }
})
