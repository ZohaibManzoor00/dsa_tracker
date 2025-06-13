import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddProblemDialog() {
  const [problemUrl, setProblemUrl] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Problem
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add LeetCode Problem</DialogTitle>
          <DialogDescription>
            Add a new problem by pasting the LeetCode URL
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="problem-url">LeetCode URL</Label>
            <Input
              id="problem-url"
              placeholder="https://leetcode.com/problems/two-sum/"
              value={problemUrl}
              onChange={(e) => setProblemUrl(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">Add Problem</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
