"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RoleType } from "@/lib/types";
import { toast } from "sonner";

type Mode = "login" | "register";

interface AuthFormProps {
  mode: Mode;
  role: RoleType;
  onModeToggle?: () => void;
}

const baseSchema = {
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
};

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  ...baseSchema,
});

const loginSchema = z.object(baseSchema);

export function AuthForm({ role }: AuthFormProps) {
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<Mode>("login");

  const schema = mode === "register" ? registerSchema : loginSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    reset();
  }, [mode]);

  const router = useRouter()

  async function onSubmit(values: any) {
    setLoading(true);

    try {
      const response = await fetch(`/api/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          role,
        }),
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }
      // .log("response", response);

      toast(`${mode.toUpperCase() + " Success"}`, {
        description: `${
          mode == "login" ? "Welcome Back" : "Cheers to new Journey"
        },`,
        // action: {
        //   label: "Undo",
        //   onClick: () => // .log("Undo"),
        // },
      });
      router.push('/all-courses')
    } catch (error) {
      // .error("Auth error:", error);
      toast.warning('Got Trouble',{
        description:`${error }`
      })
    } finally {
      setLoading(false);
    }
  }

  const handleTestLogin = () => {
    onSubmit({
      email: `test${role?.toLowerCase()}@gmail.com`,
      password: "123456",
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardContent className="p-10">
          <div className="space-y-3 text-center mb-8">
            <Badge
              variant="secondary"
              className="mx-auto px-4 py-1 text-xs font-medium tracking-wide uppercase bg-slate-100 text-slate-700 hover:bg-slate-100"
            >
              {role}
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>

            <p className="text-sm text-slate-600">
              {mode === "login"
                ? "Sign in to continue learning"
                : "Start your learning journey today"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {mode === "register" && (
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Full name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  className="h-11 border-slate-300 focus-visible:ring-slate-400"
                  {...register("name")}
                />
                {errors.name?.message && (
                  <p className="text-xs text-red-600 mt-1.5">
                    {String(errors.name.message)}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email address
              </Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                className="h-11 border-slate-300 focus-visible:ring-slate-400"
                {...register("email")}
              />
              {errors.email?.message && (
                <p className="text-xs text-red-600 mt-1.5">
                  {String(errors.email.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </Label>
              <Input
                id="password"
                placeholder="Enter your password"
                type="password"
                className="h-11 border-slate-300 focus-visible:ring-slate-400"
                {...register("password")}
              />
              {errors.password?.message && (
                <p className="text-xs text-red-600 mt-1.5">
                  {String(errors.password.message)}
                </p>
              )}
            </div>

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-sm font-semibold bg-slate-900 hover:bg-slate-800 transition-colors mt-6"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign in"
                : "Create account"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              {mode === "login" ? "New here? " : "Already have an account? "}
              <button
                type="button"
                onClick={() =>
                  setMode((prev) => (prev == "login" ? "register" : "login"))
                }
                className="font-semibold text-slate-900 hover:underline transition-all"
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
          <div className="flex justify-between">
            {["student", "instructor"]
              .filter((rol) => rol !== role.toLocaleLowerCase())
              .map((r) => (
                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-600">
                    <Link
                      href={`/auth/${r}`}
                      type="button"
                      className="font-semibold text-slate-600 hover:underline transition-all"
                    >
                      Login as {r}
                    </Link>
                  </p>
                </div>
              ))}

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                <button
                  onClick={handleTestLogin}
                  type="button"
                  className="font-semibold text-slate-600 hover:underline transition-all"
                >
                  Login as Test {role.toLowerCase()}
                </button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
