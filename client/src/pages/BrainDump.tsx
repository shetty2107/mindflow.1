import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, LogOut, Brain, BookOpen } from "lucide-react";
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

export default function BrainDump() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [tasks, setTasks] = useState("");
  const [availableHours, setAvailableHours] = useState("4");
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
      setLocation("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tasks.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please describe your tasks",
      });
      return;
    }

    if (!subject) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a subject",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/study-plans", {
        rawTasks: tasks,
        availableHours: parseInt(availableHours),
        subject: subject === "Other" && customSubject ? customSubject : subject,
        customSubject: subject === "Other" ? customSubject : null,
        challenges: selectedChallenges,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Study plan created!",
          description: "Your personalized plan is ready.",
        });
        setLocation(`/dashboard?planId=${data.id}`);
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to create study plan",
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" data-testid="icon-logo" />
            <span className="text-xl font-semibold" data-testid="text-app-name">MindFlow</span>
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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold" data-testid="heading-brain-dump">Brain Dump</h1>
          </div>
          <p className="text-muted-foreground" data-testid="text-description">
            Tell us what's on your mind, and we'll create a personalized study plan
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tasks Input */}
            <div className="space-y-2">
              <Label htmlFor="tasks" className="text-base font-semibold" data-testid="label-tasks">
                What do you need to study?
              </Label>
              <Textarea
                id="tasks"
                placeholder="Example: Finish Chapter 5 of calculus textbook, review Spanish vocabulary, complete history essay draft..."
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                rows={8}
                disabled={isLoading}
                data-testid="input-tasks"
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground" data-testid="text-tasks-hint">
                Be as detailed as you'd like - this helps us create a better plan
              </p>
            </div>

            {/* Available Hours */}
            <div className="space-y-3">
              <Label className="text-base font-semibold" data-testid="label-hours">
                How many hours can you study today?
              </Label>
              <RadioGroup
                value={availableHours}
                onValueChange={setAvailableHours}
                disabled={isLoading}
                className="flex flex-wrap gap-3"
                data-testid="radiogroup-hours"
              >
                {["1", "2", "3", "4", "5", "6", "8"].map((hours) => (
                  <div key={hours} className="flex items-center">
                    <RadioGroupItem
                      value={hours}
                      id={`hours-${hours}`}
                      data-testid={`radio-hours-${hours}`}
                    />
                    <Label
                      htmlFor={`hours-${hours}`}
                      className="ml-2 cursor-pointer font-normal"
                    >
                      {hours} {hours === "1" ? "hour" : "hours"}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-base font-semibold" data-testid="label-subject">
                Primary subject
              </Label>
              <Select value={subject} onValueChange={setSubject} disabled={isLoading}>
                <SelectTrigger id="subject" data-testid="select-subject">
                  <SelectValue placeholder="Select a subject" />
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
              <div className="space-y-2">
                <Label htmlFor="customSubject" className="text-base font-semibold" data-testid="label-custom-subject">
                  Specify your subject
                </Label>
                <Input
                  id="customSubject"
                  placeholder="e.g., Music Theory, Photography, etc."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  disabled={isLoading}
                  data-testid="input-custom-subject"
                />
              </div>
            )}

            {/* Challenges */}
            <div className="space-y-3">
              <Label className="text-base font-semibold" data-testid="label-challenges">
                What challenges are you facing? (optional)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CHALLENGES.map((challenge) => (
                  <div key={challenge} className="flex items-center space-x-2">
                    <Checkbox
                      id={challenge}
                      checked={selectedChallenges.includes(challenge)}
                      onCheckedChange={() => handleChallengeToggle(challenge)}
                      disabled={isLoading}
                      data-testid={`checkbox-${challenge.toLowerCase().replace(/\s+/g, "-")}`}
                    />
                    <Label
                      htmlFor={challenge}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {challenge}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full text-base"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating your plan...
                </>
              ) : (
                "Generate My Study Plan"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
