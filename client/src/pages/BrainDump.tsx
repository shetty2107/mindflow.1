import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, LogOut, Brain, Sparkles, X, BookOpen, Clock, Target, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "History",
  "Literature",
  "Computer Science",
  "Foreign Language",
  "Other",
];

const CHALLENGES = [
  "Procrastination",
  "Lack of motivation",
  "Too many distractions",
  "Difficulty focusing",
  "Time management",
  "Overwhelming workload",
];

const HOURS_OPTIONS = [1, 2, 3, 4, 5, 6, 8];

export default function BrainDump() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [tasks, setTasks] = useState("");
  const [availableHours, setAvailableHours] = useState(4);
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);

  const handleChallengeToggle = (challenge: string) => {
    setSelectedChallenges(prev =>
      prev.includes(challenge)
        ? prev.filter(c => c !== challenge)
        : [...prev, challenge]
    );
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tasks.trim()) {
      toast({
        variant: "destructive",
        title: "Tell us what to study",
        description: "Please describe what you need to work on",
      });
      return;
    }

    if (!subject) {
      toast({
        variant: "destructive",
        title: "Pick a subject",
        description: "Please select your study subject",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/study-plans", {
        rawTasks: tasks,
        availableHours,
        subject: subject === "Other" && customSubject ? customSubject : subject,
        customSubject: subject === "Other" ? customSubject : null,
        challenges: selectedChallenges,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "+25 XP Earned",
          description: "Your personalized plan is ready!",
        });
        setLocation(`/dashboard?planId=${data.id}`);
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Oops!",
          description: data.message || "Try again with more details",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-purple-200/50 dark:border-purple-800/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid="heading-brain-dump">
            What's on your mind?
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-description">
            Tell me what you need to study, and I'll create your perfect plan
          </p>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 shadow-2xl shadow-purple-500/20 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tasks Input */}
            <div className="space-y-3">
              <Label htmlFor="tasks" className="text-lg font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2" data-testid="label-tasks">
                <BookOpen className="h-5 w-5" />
                What do you need to study?
              </Label>
              <Textarea
                id="tasks"
                placeholder="Example: math exam, spanish vocabulary, history essay..."
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                rows={6}
                disabled={isLoading}
                data-testid="input-tasks"
                className="text-base bg-white/50 dark:bg-slate-800/50 border-2 border-purple-200 dark:border-purple-800 focus:border-purple-500 dark:focus:border-purple-500 transition-all"
              />
            </div>

            {/* Available Hours */}
            <div className="space-y-3">
              <Label className="text-lg font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2" data-testid="label-hours">
                <Clock className="h-5 w-5" />
                How many hours can you study?
              </Label>
              <div className="flex flex-wrap gap-2">
                {HOURS_OPTIONS.map((hours) => (
                  <Button
                    key={hours}
                    type="button"
                    variant={availableHours === hours ? "default" : "outline"}
                    size="lg"
                    onClick={() => setAvailableHours(hours)}
                    disabled={isLoading}
                    data-testid={`button-hours-${hours}`}
                    className={availableHours === hours 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/50" 
                      : "border-2 border-purple-200 dark:border-purple-800 hover:border-purple-500"
                    }
                  >
                    {hours}h
                  </Button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            <div className="space-y-3">
              <Label htmlFor="subject" className="text-lg font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2" data-testid="label-subject">
                <Target className="h-5 w-5" />
                Primary subject
              </Label>
              <Select value={subject} onValueChange={setSubject} disabled={isLoading}>
                <SelectTrigger 
                  id="subject" 
                  data-testid="select-subject"
                  className="text-base border-2 border-purple-200 dark:border-purple-800 focus:border-purple-500 bg-white/50 dark:bg-slate-800/50"
                >
                  <SelectValue placeholder="Choose your subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subj) => (
                    <SelectItem key={subj} value={subj} data-testid={`option-subject-${subj.toLowerCase().replace(/\s+/g, "-")}`}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Subject Input */}
            {subject === "Other" && (
              <div className="space-y-3">
                <Label htmlFor="customSubject" className="text-lg font-bold text-purple-900 dark:text-purple-300" data-testid="label-custom-subject">
                  Specify your subject
                </Label>
                <Input
                  id="customSubject"
                  placeholder="e.g., Music Theory, Photography"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  disabled={isLoading}
                  data-testid="input-custom-subject"
                  className="text-base border-2 border-purple-200 dark:border-purple-800 focus:border-purple-500 bg-white/50 dark:bg-slate-800/50"
                />
              </div>
            )}

            {/* Challenges - Now with Chips */}
            <div className="space-y-3">
              <Label className="text-lg font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2" data-testid="label-challenges">
                <Zap className="h-5 w-5" />
                Any challenges? (optional)
              </Label>
              <div className="flex flex-wrap gap-2">
                {CHALLENGES.map((challenge) => {
                  const isSelected = selectedChallenges.includes(challenge);
                  return (
                    <Badge
                      key={challenge}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg shadow-orange-500/50"
                          : "border-2 border-orange-200 dark:border-orange-800 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950"
                      }`}
                      onClick={() => !isLoading && handleChallengeToggle(challenge)}
                      data-testid={`badge-${challenge.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {challenge}
                      {isSelected && <X className="ml-2 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl shadow-purple-500/50 h-14"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Creating your perfect plan...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate My Study Plan (+25 XP)
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
