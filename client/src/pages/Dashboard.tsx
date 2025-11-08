import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LogOut,
  BookOpen,
  CheckCircle2,
  Clock,
  Brain,
  TrendingUp,
  Plus,
  Lightbulb,
} from "lucide-react";
import type { Task, StudySession, StudyPlan } from "@shared/schema";

const EMOTION_OPTIONS = [
  { emoji: "😰", label: "Stressed", value: "stressed" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "💪", label: "Motivated", value: "motivated" },
  { emoji: "😵", label: "Overwhelmed", value: "overwhelmed" },
  { emoji: "😊", label: "Confident", value: "confident" },
  { emoji: "😟", label: "Anxious", value: "anxious" },
];

const WELLNESS_TIPS = [
  "Take a 5-minute break every hour to stretch and refresh your mind.",
  "Stay hydrated! Keep a water bottle nearby while studying.",
  "Break large tasks into smaller, manageable chunks.",
  "Use the Pomodoro technique: 25 minutes focus, 5 minutes rest.",
  "Create a dedicated study space free from distractions.",
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentTip, setCurrentTip] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState("");

  // Fetch user's tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Fetch study sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery<StudySession[]>({
    queryKey: ["/api/study-sessions"],
  });

  // Fetch latest study plan
  const { data: latestPlan, isLoading: planLoading } = useQuery<StudyPlan>({
    queryKey: ["/api/study-plans/latest"],
  });

  // Toggle task completion
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated",
        description: "Great progress!",
      });
    },
  });

  // Record emotion
  const emotionMutation = useMutation({
    mutationFn: async (emotion: string) => {
      return apiRequest("POST", "/api/emotions", {
        emotion,
        intensity: 3,
        context: "dashboard check-in",
      });
    },
    onSuccess: () => {
      toast({
        title: "Emotion recorded",
        description: "Thanks for sharing how you feel!",
      });
      setSelectedEmotion("");
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
      setLocation("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleEmotionClick = (emotion: string) => {
    setSelectedEmotion(emotion);
    emotionMutation.mutate(emotion);
  };

  const handleNextTip = () => {
    setCurrentTip((prev) => (prev + 1) % WELLNESS_TIPS.length);
  };

  // Calculate stats
  const completedTasks = tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalStudyTime = sessions?.reduce((sum, s) => sum + s.duration, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-semibold">MindFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold" data-testid="stat-total-tasks">
                  {totalTasks}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold" data-testid="stat-completed-tasks">
                  {completedTasks}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold" data-testid="stat-study-time">
                  {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold" data-testid="stat-progress">
                  {Math.round(completionRate)}%
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Bar */}
            {totalTasks > 0 && (
              <Card className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Overall Progress</h3>
                    <span className="text-sm text-muted-foreground">
                      {completedTasks} of {totalTasks} tasks
                    </span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                  {completionRate === 100 && (
                    <p className="text-sm text-primary font-medium">
                      🎉 Congratulations! All tasks completed!
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* AI Study Plan */}
            {planLoading ? (
              <Card className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ) : latestPlan ? (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">AI Study Plan</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {latestPlan.subject}
                  </Badge>
                </div>
                <div
                  className="prose prose-sm max-w-none text-sm text-foreground"
                  data-testid="ai-study-plan"
                >
                  <pre className="whitespace-pre-wrap font-sans">{latestPlan.aiGeneratedPlan}</pre>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No study plan yet</p>
                <Button onClick={() => setLocation("/brain-dump")} data-testid="button-create-plan">
                  Create Your First Plan
                </Button>
              </Card>
            )}

            {/* Tasks List */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Your Tasks</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/brain-dump")}
                  data-testid="button-add-task"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tasks
                </Button>
              </div>

              {tasksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-md hover-elevate border"
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
                        data-testid={`checkbox-task-${task.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium ${
                            task.completed ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No tasks yet. Create a study plan to get started!
                </p>
              )}
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Emotion Tracker */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">😊</span>
                <h3 className="font-semibold">How are you feeling?</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {EMOTION_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    className="h-auto flex-col py-3 hover-elevate"
                    onClick={() => handleEmotionClick(option.value)}
                    disabled={emotionMutation.isPending}
                    data-testid={`button-emotion-${option.value}`}
                  >
                    <span className="text-2xl mb-1">{option.emoji}</span>
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Wellness Tips */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Wellness Tip</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4" data-testid="wellness-tip">
                {WELLNESS_TIPS[currentTip]}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextTip}
                className="w-full"
                data-testid="button-next-tip"
              >
                Next Tip
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
