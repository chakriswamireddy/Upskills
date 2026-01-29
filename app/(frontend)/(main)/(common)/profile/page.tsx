"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

type Profile = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  createdAt: string;

  studentId?: string;
  instructorId?: string;

  enrollmentsCount?: number;
  coursesCount?: number;
  bio?:string,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        toast.success('Fetched Your profile Sucessfully')
        setName(data.name);
      });
  }, []);

  if (!profile)
    return (
      <div className=" flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  async function save() {
    setLoading(true);

    await fetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio }),
    });

    setProfile((prev) => prev ? {...prev, name}:prev);
    toast.success('Updated Your profile Sucessfully')
      
    setEditing(false);
    setLoading(false);
  }

  return (
    <div className="   py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Profile</h1>

          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={save} disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setName(profile.name);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <Card className="shadow-xl">
          <CardHeader />

          <CardContent className="grid md:grid-cols-[240px_1fr] gap-8">

            <div className="flex flex-col items-center text-center space-y-4">

              <Avatar className="w-28 h-28 text-3xl">
                <AvatarFallback>
                  {profile.name[0]}
                </AvatarFallback>
              </Avatar>

              <Badge>{profile.role}</Badge>

              {profile.role === "STUDENT" && (
                <div className="text-sm text-muted-foreground">
                  {profile.enrollmentsCount} Enrollments
                </div>
              )}

              {profile.role === "INSTRUCTOR" && (
                <div className="text-sm text-muted-foreground">
                  {profile.coursesCount} Courses
                </div>
              )}
            </div>

            <div className="space-y-6">

              <div>
                <label className="text-sm text-muted-foreground">
                  Full Name
                </label>

                {editing ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-lg font-medium mt-1">
                    {profile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground">
                  Bio
                </label>

                {editing ? (
                  <Input
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-lg font-medium mt-1">
                    {profile?.bio}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground">
                  Email
                </label>

                <p className="text-lg mt-1">
                  {profile.email}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">
                  Joined
                </label>

                <p className="text-lg mt-1">
                  {new Date(profile.createdAt).toDateString()}
                </p>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
