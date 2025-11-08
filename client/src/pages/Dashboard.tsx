import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import confetti from "canvas-confetti";
import {
  LogOut,
  Plus,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  Target,
  Brain,
  Star,
  CloudRain,
  Smile,
  TrendingUp,
  Frown,
  ThumbsUp,
  AlertCircle,
  BarChart3,
  Award,
} from "lucide-react";
import type { Task, StudyPlan, UserStats } from "@shared/schema";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const EMOTION_OPTIONS = [
  { icon: CloudRain, label: "Stressed", value: "stressed" },
  { icon: Smile, label: "Calm", value: "calm" },
  { icon: TrendingUp, label: "Motivated", value: "motivated" },
  { icon: Frown, label: "Overwhelmed", value: "overwhelmed" },
  { icon: ThumbsUp, label: "Confident", value: "confident" },
  { icon: AlertCircle, label: "Anxious", value: "anxious" },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const prevLevelRef = useRef(1);

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: latestPlan, isLoading: planLoading } = useQuery<StudyPlan>({
    queryKey: ["/api/study-plans/latest"],
  });

  const currentLevel = stats?.level || 1;
  const currentXP = stats?.xp || 0;

  useEffect(() => {
    if (currentLevel > prevLevelRef.current && prevLevelRef.current > 0) {
      celebrateLevelUp(currentLevel);
    }
    prevLevelRef.current = currentLevel;
  }, [currentLevel]);

  const celebrateLevelUp = (level: number) => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 2,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'],
      });
    }, 50);

    toast({
      title: `Level ${level} Achieved!`,
      description: "Amazing progress! Keep up the great work!",
    });
  };

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; priority: "low" | "medium" | "high" }) => {
      const payload: any = {
        title: data.title,
        priority: data.priority,
        completed: false,
      };
      
      if (data.description && data.description.trim()) {
        payload.description = data.description;
      }
      
      return apiRequest("POST", "/api/tasks", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setTaskDialogOpen(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("medium");
      toast({
        title: "Task created!",
        description: "Your new task has been added to the list",
      });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, { completed });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      if (variables.completed) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10B981', '#3B82F6'],
        });

        toast({
          title: "+15 XP Earned",
          description: "Great work completing that task!",
        });
      }
    },
  });

  const emotionMutation = useMutation({
    mutationFn: async (emotion: string) => {
      return apiRequest("POST", "/api/emotions", {
        emotion,
        intensity: 3,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "+5 XP Earned",
        description: "Thanks for checking in!",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
      setLocation("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Missing title",
        description: "Please enter a task title",
      });
      return;
    }
    createTaskMutation.mutate({
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority,
    });
  };

  const completedTasks = tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpProgress = currentXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const xpProgressPercent = (xpProgress / xpNeeded) * 100;

  const progressData = [
    { day: "Mon", xp: Math.max(0, currentXP - 60) },
    { day: "Tue", xp: Math.max(0, currentXP - 45) },
    { day: "Wed", xp: Math.max(0, currentXP - 30) },
    { day: "Thu", xp: Math.max(0, currentXP - 15) },
    { day: "Today", xp: currentXP },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      <header className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-purple-200/50 dark:border-purple-800/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" data-testid="icon-logo" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid="text-app-name">
                MindFlow
              </span>
            </div>
            <div className="flex items-center gap-2">
              {statsLoading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg" data-testid="badge-level">
                  <Trophy className="h-4 w-4 text-white" />
                  <span className="text-white font-bold">Lv {currentLevel}</span>
                </div>
              )}
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/achievements")}
                data-testid="button-achievements"
              >
                <Award className="h-4 w-4 mr-2" />
                Achievements
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/brain-dump")}
                data-testid="button-new-plan"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Plan
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {statsLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <div className="space-y-2" data-testid="xp-progress">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-purple-900 dark:text-purple-300">
                  {currentXP} XP
                </span>
                <span className="text-muted-foreground">
                  {xpNeeded - xpProgress} XP to Level {currentLevel + 1}
                </span>
              </div>
              <div className="relative h-4 rounded-full bg-white/50 dark:bg-slate-800/50 overflow-hidden border-2 border-purple-200 dark:border-purple-800">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-2xl shadow-blue-500/50 text-white" data-testid="card-stat-plans">
            {statsLoading ? (
              <Skeleton className="h-20 w-full bg-white/20" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Star className="h-8 w-8 opacity-80" />
                  <span className="text-5xl font-bold">{stats?.plansCreated || 0}</span>
                </div>
                <p className="text-blue-100 font-semibold">Study Plans</p>
              </>
            )}
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-2xl shadow-purple-500/50 text-white" data-testid="card-stat-completed">
            {tasksLoading ? (
              <Skeleton className="h-20 w-full bg-white/20" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-8 w-8 opacity-80" />
                  <span className="text-5xl font-bold">{stats?.tasksCompleted || 0}</span>
                </div>
                <p className="text-purple-100 font-semibold">Tasks Done</p>
              </>
            )}
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-2xl shadow-orange-500/50 text-white" data-testid="card-stat-streak">
            {statsLoading ? (
              <Skeleton className="h-20 w-full bg-white/20" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Flame className="h-8 w-8 opacity-80" />
                  <span className="text-5xl font-bold">{stats?.currentStreak || 0}</span>
                </div>
                <p className="text-orange-100 font-semibold">Day Streak</p>
              </>
            )}
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 shadow-2xl shadow-pink-500/50 text-white" data-testid="card-stat-xp">
            {statsLoading ? (
              <Skeleton className="h-20 w-full bg-white/20" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-8 w-8 opacity-80" />
                  <span className="text-5xl font-bold">{currentXP}</span>
                </div>
                <p className="text-pink-100 font-semibold">Total XP</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {!statsLoading && currentXP > 0 && (
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-bold text-lg">Progress This Week</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        border: '2px solid #8B5CF6',
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="xp" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            )}

            {planLoading ? (
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
              </Card>
            ) : latestPlan ? (
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-6 shadow-lg" data-testid="card-study-plan">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg" data-testid="heading-study-plan">AI Study Plan</h3>
                  <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white" data-testid="badge-subject">
                    {latestPlan.subject}
                  </Badge>
                </div>
                <div className="prose prose-sm max-w-none text-foreground" data-testid="ai-study-plan">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{latestPlan.aiGeneratedPlan}</pre>
                </div>
              </Card>
            ) : (
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-8 text-center" data-testid="card-no-plan">
                <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Ready to start studying?</p>
                <p className="text-muted-foreground mb-6" data-testid="text-no-plan">Create your first AI-powered study plan!</p>
                <Button 
                  onClick={() => setLocation("/brain-dump")} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  data-testid="button-create-plan"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Study Plan (+25 XP)
                </Button>
              </Card>
            )}

            <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-6 shadow-lg" data-testid="card-tasks-list">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg" data-testid="heading-tasks">My Tasks</h3>
                <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-purple-200 dark:border-purple-800"
                      data-testid="button-add-task"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Input
                          placeholder="Task title"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          data-testid="input-task-title"
                        />
                      </div>
                      <div>
                        <Textarea
                          placeholder="Description (optional)"
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                          rows={3}
                          data-testid="input-task-description"
                        />
                      </div>
                      <div>
                        <Select value={newTaskPriority} onValueChange={(v: any) => setNewTaskPriority(v)}>
                          <SelectTrigger data-testid="select-task-priority">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleCreateTask}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                        disabled={createTaskMutation.isPending}
                        data-testid="button-create-task"
                      >
                        {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {tasksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                      data-testid={`task-${task.id}`}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) =>
                          toggleTaskMutation.mutate({
                            taskId: task.id,
                            completed: checked as boolean,
                          })
                        }
                        className="mt-1"
                        data-testid={`checkbox-task-${task.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold ${
                            task.completed ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                          data-testid={`text-task-title-${task.id}`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1" data-testid={`text-task-description-${task.id}`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={
                          task.priority === "high"
                            ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                            : task.priority === "medium"
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                            : "bg-gradient-to-r from-green-500 to-teal-500 text-white"
                        }
                        data-testid={`badge-task-priority-${task.id}`}
                      >
                        {task.priority}
                      </Badge>
                      {!task.completed && (
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">+15 XP</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground mb-4" data-testid="text-no-tasks">
                    No tasks yet. Add your first task!
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setTaskDialogOpen(true)}
                    data-testid="button-add-first-task"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-6 shadow-lg" data-testid="card-emotion-tracker">
              <h3 className="font-bold mb-4" data-testid="heading-emotions">How are you feeling?</h3>
              <div className="grid grid-cols-3 gap-2">
                {EMOTION_OPTIONS.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant="outline"
                      className="h-auto flex-col py-4 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950"
                      onClick={() => emotionMutation.mutate(option.value)}
                      disabled={emotionMutation.isPending}
                      data-testid={`button-emotion-${option.value}`}
                    >
                      <IconComponent className="h-6 w-6 mb-1" />
                      <span className="text-xs font-semibold">{option.label}</span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400">+5 XP</span>
                    </Button>
                  );
                })}
              </div>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 shadow-2xl shadow-purple-500/50 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Your Progress
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tasks Complete</span>
                    <span className="font-bold">{completedTasks}/{totalTasks}</span>
                  </div>
                  <Progress 
                    value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} 
                    className="h-2 bg-white/30"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Next Level</span>
                    <span className="font-bold">{xpProgress}/{xpNeeded} XP</span>
                  </div>
                  <Progress 
                    value={xpProgressPercent} 
                    className="h-2 bg-white/30"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
