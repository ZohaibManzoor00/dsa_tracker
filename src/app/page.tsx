"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Target,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs";
import { AuthButtons } from "@/components/auth-buttons";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-center">
        <div className="w-full max-w-6xl flex items-center">
          <Link className="flex items-center justify-center" href="/">
            <Brain className="h-6 w-6 text-blue-600" />
            <span className="ml-2 text-lg font-bold">DSA Tracker</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
              href="/dashboard"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  DSA Tracker
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Track your Data Structures and Algorithms progress
                </p>
              </div>
              <AuthButtons />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="container px-4 md:px-6 max-w-6xl">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 items-center justify-items-center text-center">
              <div className="grid gap-1 place-items-center max-w-sm">
                <Target className="w-12 h-12 text-blue-600" />
                <h3 className="text-lg font-bold">Track Your Progress</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Easily log your solved problems, add notes, and track your
                  success rate across different topics.
                </p>
              </div>
              <div className="grid gap-1 place-items-center max-w-sm">
                <TrendingUp className="w-12 h-12 text-blue-600" />
                <h3 className="text-lg font-bold">Get Insights</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Visualize your strengths and areas for improvement with
                  detailed analytics and progress tracking.
                </p>
              </div>
              <div className="grid gap-1 place-items-center max-w-sm">
                <CheckCircle className="w-12 h-12 text-blue-600" />
                <h3 className="text-lg font-bold">Stay Organized</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Keep your practice sessions organized with custom study plans
                  and problem categories.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center">
          <div className="container px-4 md:px-6 max-w-6xl">
            <div className="grid gap-10 md:gap-16 lg:grid-cols-2 items-center">
              <div className="space-y-4 text-center lg:text-left">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  Simple Process
                </div>
                <h2 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Start Tracking in Seconds
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  1. Paste your LeetCode problem URL
                  <br />
                  2. Add your notes and insights
                  <br />
                  3. Track your progress over time
                </p>
                <div className="flex justify-center lg:justify-start">
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Try It Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="rounded-xl border bg-white p-8 dark:bg-gray-950">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Example Problem
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold">Two Sum</div>
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-600">
                          Easy
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Your notes and progress will be automatically tracked and
                      organized.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center justify-center px-4 md:px-6 border-t">
        <div className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 DSA Tracker. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link
              className="text-xs hover:underline underline-offset-4"
              href="#"
            >
              Terms of Service
            </Link>
            <Link
              className="text-xs hover:underline underline-offset-4"
              href="#"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
