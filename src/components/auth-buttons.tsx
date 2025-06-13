"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

export function AuthButtons() {
  const { userId } = useAuth();

  return (
    <div className="space-x-4">
      {userId ? (
        <Link href="/dashboard">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <>
          <Link href="/sign-in">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Sign Up
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
