import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Task, StudyPlan, UserStats } from "@shared/schema";

import {
  LogOut,
  Plus,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  Target,
  Clock,
  Brain,
  Star,
  X,
  CloudRain,
  Smile,
  TrendingUp,
  Frown,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";

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

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  // Fetch user's tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "+15 XP Earned",
        description: "Great work completing that task!",
      });
    },
  });

  // Record emotion
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

  // Calculate progress
  const completedTasks = tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const currentXP = stats?.xp || 0;
  const currentLevel = stats?.level || 1;
  const xpForCurrentLevel = (currentLevel - 1) * 100; // XP needed to reach current level
  const xpForNextLevel = currentLevel * 100; // XP needed to reach next level
  const xpProgress = currentXP - xpForCurrentLevel; // Progress within current level
  const xpNeeded = xpForNextLevel - xpForCurrentLevel; // Total XP needed for this level
  const xpProgressPercent = (xpProgress / xpNeeded) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-purple-200/50 dark:border-purple-800/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" data-testid="icon-logo" />
                <Sparkles className="h-4 w-4 text-pink-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid="text-app-name">
                MindFlow
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Level Badge */}
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

          {/* XP Progress Bar */}
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Colorful Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Plans Created */}
          <div
            className="backdrop-blur-xl bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-2xl shadow-blue-500/50 text-white"
            data-testid="card-stat-plans"
          >
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

          {/* Tasks Completed */}
          <div
            className="backdrop-blur-xl bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-2xl shadow-purple-500/50 text-white"
            data-testid="card-stat-completed"
          >
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

          {/* Current Streak */}
          <div
            className="backdrop-blur-xl bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-2xl shadow-orange-500/50 text-white"
            data-testid="card-stat-streak"
          >
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

          {/* Total XP */}
          <div
            className="backdrop-blur-xl bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 shadow-2xl shadow-pink-500/50 text-white"
            data-testid="card-stat-xp"
          >
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Study Plan */}
            {planLoading ? (
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ) : latestPlan ? (
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-6 shadow-lg" data-testid="card-study-plan">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg" data-testid="heading-study-plan">Your Study Plan</h3>
                  <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white" data-testid="badge-subject">
                    {latestPlan.subject}
                  </Badge>
                </div>
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  data-testid="ai-study-plan"
                >
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

            {/* Tasks List */}
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-6 shadow-lg" data-testid="card-tasks-list">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg" data-testid="heading-tasks">Active Tasks</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/brain-dump")}
                  className="border-2 border-purple-200 dark:border-purple-800"
                  data-testid="button-add-task"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tasks
                </Button>
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
                  <p className="text-muted-foreground" data-testid="text-no-tasks">
                    No tasks yet. Create a study plan to get started!
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Emotion Check-in */}
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

            {/* Quick Stats */}
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
