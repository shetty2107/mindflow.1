import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  LogOut,
  Plus,
  Brain,
  Trophy,
  Star,
  Zap,
  Target,
  Flame,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Lock,
} from "lucide-react";
import type { UserStats } from "@shared/schema";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  requirement: number;
  unlocked: boolean;
  progress: number;
  xpReward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export default function Achievements() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const currentXP = stats?.xp || 0;
  const currentLevel = stats?.level || 1;
  const tasksCompleted = stats?.tasksCompleted || 0;
  const plansCreated = stats?.plansCreated || 0;
  const currentStreak = stats?.currentStreak || 0;

  const achievements: Achievement[] = [
    {
      id: "first_steps",
      title: "First Steps",
      description: "Create your first study plan",
      icon: Sparkles,
      requirement: 1,
      unlocked: plansCreated >= 1,
      progress: Math.min(plansCreated, 1),
      xpReward: 10,
      rarity: "common",
    },
    {
      id: "task_master",
      title: "Task Master",
      description: "Complete 10 tasks",
      icon: CheckCircle2,
      requirement: 10,
      unlocked: tasksCompleted >= 10,
      progress: Math.min(tasksCompleted, 10),
      xpReward: 50,
      rarity: "rare",
    },
    {
      id: "level_up",
      title: "Rising Star",
      description: "Reach Level 5",
      icon: Star,
      requirement: 5,
      unlocked: currentLevel >= 5,
      progress: Math.min(currentLevel, 5),
      xpReward: 100,
      rarity: "rare",
    },
    {
      id: "streak_3",
      title: "On Fire",
      description: "Maintain a 3-day streak",
      icon: Flame,
      requirement: 3,
      unlocked: currentStreak >= 3,
      progress: Math.min(currentStreak, 3),
      xpReward: 30,
      rarity: "common",
    },
    {
      id: "streak_7",
      title: "Dedication",
      description: "Maintain a 7-day streak",
      icon: Trophy,
      requirement: 7,
      unlocked: currentStreak >= 7,
      progress: Math.min(currentStreak, 7),
      xpReward: 75,
      rarity: "epic",
    },
    {
      id: "xp_500",
      title: "XP Hunter",
      description: "Earn 500 total XP",
      icon: Zap,
      requirement: 500,
      unlocked: currentXP >= 500,
      progress: Math.min(currentXP, 500),
      xpReward: 50,
      rarity: "rare",
    },
    {
      id: "task_50",
      title: "Productivity King",
      description: "Complete 50 tasks",
      icon: Crown,
      requirement: 50,
      unlocked: tasksCompleted >= 50,
      progress: Math.min(tasksCompleted, 50),
      xpReward: 200,
      rarity: "epic",
    },
    {
      id: "level_10",
      title: "Elite Scholar",
      description: "Reach Level 10",
      icon: Award,
      requirement: 10,
      unlocked: currentLevel >= 10,
      progress: Math.min(currentLevel, 10),
      xpReward: 250,
      rarity: "legendary",
    },
    {
      id: "plans_10",
      title: "Strategic Planner",
      description: "Create 10 study plans",
      icon: Target,
      requirement: 10,
      unlocked: plansCreated >= 10,
      progress: Math.min(plansCreated, 10),
      xpReward: 150,
      rarity: "epic",
    },
  ];

  const rarityColors = {
    common: "from-gray-400 to-gray-500",
    rare: "from-blue-400 to-blue-600",
    epic: "from-purple-400 to-purple-600",
    legendary: "from-yellow-400 to-orange-500",
  };

  const rarityBorderColors = {
    common: "border-gray-400",
    rare: "border-blue-500",
    epic: "border-purple-500",
    legendary: "border-yellow-500",
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;
  const completionPercentage = (unlockedCount / totalAchievements) * 100;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setLocation("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      <header className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-purple-200/50 dark:border-purple-800/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" data-testid="icon-logo" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid="text-app-name">
                MindFlow
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-dashboard"
              >
                <Target className="h-4 w-4 mr-2" />
                Dashboard
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
              <LanguageSelector />
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid="heading-achievements">
              Achievements
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Unlock achievements by completing tasks and maintaining streaks
            </p>

            <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold" data-testid="text-unlocked-count">
                    {unlockedCount} / {totalAchievements}
                  </h3>
                  <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
                </div>
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
              <Progress value={completionPercentage} className="h-3" data-testid="progress-achievements" />
              <p className="text-sm text-muted-foreground mt-2">
                {completionPercentage.toFixed(0)}% Complete
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              const progressPercentage = (achievement.progress / achievement.requirement) * 100;

              return (
                <Card
                  key={achievement.id}
                  className={`backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 ${
                    achievement.unlocked
                      ? rarityBorderColors[achievement.rarity]
                      : "border-gray-300 dark:border-gray-700"
                  } p-6 transition-all ${
                    achievement.unlocked ? "shadow-lg hover-elevate" : "opacity-60"
                  }`}
                  data-testid={`achievement-${achievement.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl ${
                        achievement.unlocked
                          ? `bg-gradient-to-br ${rarityColors[achievement.rarity]}`
                          : "bg-gray-300 dark:bg-gray-700"
                      } shadow-lg`}
                    >
                      {achievement.unlocked ? (
                        <Icon className="h-8 w-8 text-white" />
                      ) : (
                        <Lock className="h-8 w-8 text-gray-500" />
                      )}
                    </div>
                    <Badge
                      variant={achievement.unlocked ? "default" : "secondary"}
                      className={
                        achievement.unlocked
                          ? `bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white border-0`
                          : ""
                      }
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold mb-2" data-testid={`text-achievement-title-${achievement.id}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {achievement.description}
                  </p>

                  {!achievement.unlocked && (
                    <>
                      <Progress value={progressPercentage} className="h-2 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {achievement.progress} / {achievement.requirement}
                      </p>
                    </>
                  )}

                  {achievement.unlocked && (
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                        +{achievement.xpReward} XP
                      </span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
