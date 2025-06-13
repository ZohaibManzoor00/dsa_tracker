export function getTopicColor(topic: string) {
  const colors = {
    Array: "bg-blue-100 text-blue-800",
    String: "bg-purple-100 text-purple-800",
    "Linked List": "bg-indigo-100 text-indigo-800",
    Tree: "bg-green-100 text-green-800",
    Stack: "bg-cyan-100 text-cyan-800",
    Graph: "bg-red-100 text-red-800",
    "Binary Search": "bg-violet-100 text-violet-800",
  };
  return colors[topic as keyof typeof colors] || "bg-gray-100 text-gray-800";
}

export function getDifficultyColor(difficulty: string) {
  const colors = {
    Easy: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Hard: "bg-red-100 text-red-800",
  };
  return (
    colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-800"
  );
}

export function getStatusColor(status: string) {
  const colors = {
    Solved: "bg-green-500 text-white",
    Attempted: "bg-orange-100 text-orange-800",
    "Not Started": "bg-gray-100 text-gray-600",
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
}
