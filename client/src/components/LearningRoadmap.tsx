import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  estimatedHours: number;
  prerequisites: string[];
}

export function LearningRoadmap() {
  const { data, isLoading } = useQuery<{ roadmap: RoadmapNode[]; message?: string }>({
    queryKey: ["/api/roadmap"],
  });

  if (isLoading) {
    return (
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    );
  }

  if (!data || data.roadmap.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-6 text-center">
        <div className="py-8">
          <Circle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold mb-2">No Learning Path Yet</h3>
          <p className="text-sm text-muted-foreground">
            Create some tasks to see your AI-generated learning roadmap
          </p>
        </div>
      </Card>
    );
  }

  const roadmap = data.roadmap;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'current':
        return <Circle className="h-6 w-6 text-blue-500 fill-blue-500" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-950';
      case 'current':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      default:
        return 'border-gray-300 dark:border-gray-700';
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-purple-200/50 dark:border-purple-800/50 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI-Generated Learning Roadmap
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your personalized path to success
        </p>
      </div>

      <div className="space-y-4 relative">
        {roadmap.map((node, index) => (
          <div key={node.id} className="relative">
            {index < roadmap.length - 1 && (
              <div className="absolute left-[23px] top-[60px] w-0.5 h-12 bg-gradient-to-b from-purple-400 to-transparent z-0" />
            )}
            
            <div
              className={`relative flex gap-4 p-4 rounded-lg border-2 transition-all ${
                getStatusColor(node.status)
              } ${node.status === 'current' ? 'shadow-lg shadow-blue-200 dark:shadow-blue-900' : ''}`}
              data-testid={`roadmap-node-${node.id}`}
            >
              <div className="flex-shrink-0 mt-1 z-10 bg-white dark:bg-slate-900 rounded-full">
                {getStatusIcon(node.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-base" data-testid={`text-roadmap-title-${node.id}`}>
                    {node.title}
                  </h4>
                  {node.status === 'current' && (
                    <Badge variant="default" className="flex-shrink-0">
                      In Progress
                    </Badge>
                  )}
                  {node.status === 'completed' && (
                    <Badge variant="secondary" className="bg-green-500 text-white flex-shrink-0">
                      Done
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {node.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{node.estimatedHours}h</span>
                  </div>
                  
                  {node.prerequisites.length > 0 && (
                    <div className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      <span>Requires {node.prerequisites.length} prerequisite(s)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
