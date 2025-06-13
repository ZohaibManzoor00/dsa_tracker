import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Target } from "lucide-react";

const topicStrengths = [
  { topic: "Array", solved: 12, total: 15, strength: 80 },
  { topic: "String", solved: 8, total: 12, strength: 67 },
  { topic: "Linked List", solved: 6, total: 8, strength: 75 },
  { topic: "Tree", solved: 10, total: 18, strength: 56 },
  { topic: "Graph", solved: 4, total: 10, strength: 40 },
  { topic: "Dynamic Programming", solved: 3, total: 12, strength: 25 },
  { topic: "Stack", solved: 7, total: 9, strength: 78 },
  { topic: "Queue", solved: 5, total: 7, strength: 71 },
  { topic: "Hash Table", solved: 9, total: 11, strength: 82 },
  { topic: "Binary Search", solved: 6, total: 10, strength: 60 },
];

export function HeatMap() {
  const getColorIntensity = (strength: number) => {
    if (strength >= 80) return "bg-green-600";
    if (strength >= 60) return "bg-green-400";
    if (strength >= 40) return "bg-yellow-400";
    if (strength >= 20) return "bg-orange-400";
    return "bg-red-400";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Topic Strength Heat Map
        </CardTitle>
        <CardDescription>
          Your performance across different DSA topics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {topicStrengths.map((item) => (
            <div key={item.topic} className="text-center">
              <div
                className={`w-full h-16 rounded-lg ${getColorIntensity(
                  item.strength
                )} flex items-center justify-center text-white font-semibold text-sm mb-2`}
              >
                <span className="text-xl">{item.strength}%</span>
              </div>
              <div className="text-xs font-medium">{item.topic}</div>
              <div className="text-xs text-muted-foreground">
                {item.solved}/{item.total}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>{"<20%"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span>20-39%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span>40-59%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>60-79%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>{"≥80%"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
