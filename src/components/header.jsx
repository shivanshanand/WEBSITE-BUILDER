"use client";
import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Spinner,
  GitFork,
  Triangle,
  User,
  SignOut,
  SignIn,
} from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [optimisticSession, setOptimisticSession] = useState(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("next-auth.session-token");
    if (savedSession && !session && status === "loading") {
      setOptimisticSession({ user: { name: "Loading..." } });
    } else if (session) {
      setOptimisticSession(null);
    }
  }, [session, status]);

  const handleSignOut = () => {
    setOptimisticSession(null);
    localStorage.removeItem("next-auth.session-token");
    signOut({ callbackUrl: "/" });
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn("google");
    } finally {
      setIsSigningIn(false);
    }
  };

  const displaySession = session || optimisticSession;
  const isLoading = status === "loading" && !optimisticSession;

  return (
    <header className="fixed top-4 left-4 z-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Spinner
          size={28}
          className="text-neutral-300 animate-spin"
          style={{ animationDuration: "4s" }}
        />
        <h1 className="text-xl font-bold text-neutral-300 cursor-default">
          Bloomsite
        </h1>

        <TooltipProvider>
          <div className="flex items-center gap-2 ml-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="h-10 w-10 rounded-lg flex items-center justify-center bg-transparent text-neutral-400 hover:text-neutral-100 transition-colors duration-200 cursor-pointer">
                  <GitFork size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Connect GitHub</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button className="h-10 w-10 rounded-lg flex items-center justify-center bg-transparent text-neutral-400 hover:text-neutral-100 transition-colors duration-200 cursor-pointer">
                  <Triangle size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Connect Vercel</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button className="h-10 w-10 rounded-lg flex items-center justify-center bg-transparent text-neutral-400 hover:text-neutral-100 transition-colors duration-200 cursor-pointer">
                  <User size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Your Account</p>
              </TooltipContent>
            </Tooltip>

            {displaySession ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleSignOut}
                    className="h-10 w-10 rounded-lg flex items-center justify-center bg-transparent text-neutral-400 hover:text-neutral-100 transition-colors duration-200 cursor-pointer"
                  >
                    <SignOut size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign Out</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleSignIn}
                    disabled={isSigningIn || isLoading}
                    className="h-10 w-10 rounded-lg flex items-center justify-center bg-transparent text-neutral-400 hover:text-neutral-100 transition-colors duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {isSigningIn ? (
                      <Spinner size={20} className="animate-spin" />
                    ) : (
                      <SignIn size={20} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSigningIn ? "Signing in..." : "Sign In"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>
    </header>
  );
}
