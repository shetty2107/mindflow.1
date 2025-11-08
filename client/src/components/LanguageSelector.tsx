import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Español" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Italian", label: "Italiano" },
  { value: "Portuguese", label: "Português" },
  { value: "Chinese", label: "中文" },
  { value: "Japanese", label: "日本語" },
  { value: "Korean", label: "한국어" },
  { value: "Arabic", label: "العربية" },
  { value: "Hindi", label: "हिन्दी" },
  { value: "Russian", label: "Русский" },
];

export function LanguageSelector() {
  const { toast } = useToast();

  const { data: profile } = useQuery<{ id: string; username: string; language: string }>({
    queryKey: ["/api/user/profile"],
  });

  const updateLanguageMutation = useMutation({
    mutationFn: async (language: string) => {
      return await apiRequest("PATCH", "/api/user/language", { language });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Language Updated",
        description: "Your language preference has been saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update language",
        variant: "destructive",
      });
    },
  });

  const handleLanguageChange = (value: string) => {
    updateLanguageMutation.mutate(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" data-testid="icon-language" />
      <Select
        value={profile?.language || "English"}
        onValueChange={handleLanguageChange}
        disabled={updateLanguageMutation.isPending}
      >
        <SelectTrigger className="w-[140px]" data-testid="select-language">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.value} value={lang.value} data-testid={`option-language-${lang.value.toLowerCase()}`}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
