"use client";

import { useEffect, useRef, useState } from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, User, Clock, Edit, PlusCircle, Gauge } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/(frontend)/store/hooks";
import { fetchCourses } from "@/app/(frontend)/store/slices/coursesSlice";
import {
  enrollCourse,
  unenrollCourse,
} from "@/app/(frontend)/store/slices/enrollsSlices";
import { RootState } from "../store";
import { getSessionUser } from "@/app/lib/auth";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";

const selectors = {
  courses: (s: RootState) => s.courses,
  enrolls: (s: RootState) => s.enrolls,
} as const;

export default function CoursesDB({
  storeKey,
  loginRole,
  roleTypeId,
}: {
  storeKey: keyof typeof selectors;
  loginRole: string;
  roleTypeId: string;
}) {
  const dispatch = useAppDispatch();

  const { items, total, loading } = useAppSelector((s) => s[storeKey]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>();
  const [level, setLevel] = useState<string>();
  const [sort, setSort] = useState<"popular" | "recent">("recent");

  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPage(1);
    dispatch(
      fetchCourses({
        page: 1,
        search,
        category,
        level,
        sort,
        ...(pathname.includes("my") &&
          loginRole == "INSTRUCTOR" && { instructorBased: true }),
      })
    );
  }, [search, category, level, sort]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && items.length < total && !loading) {
        const next = page + 1;
        setPage(next);
        dispatch(
          fetchCourses({
            page: next,
            search,
            category,
            level,
            sort,
          })
        );
      }
    });

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [items, total, loading, page]);

  const handleEnroll = (id: string, isEnrolled: boolean) => {
    isEnrolled ? dispatch(unenrollCourse(id)) : dispatch(enrollCourse(id));

    setTimeout(() => {
      dispatch(fetchCourses());
    });
  };

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const cookies = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    setToken(cookies ?? null);
  }, []);

  const pathname = usePathname();

  const heading = pathname.includes("teachings")
    ? "My Teachings"
    : pathname.includes("my")
    ? "My Courses"
    : "Explore All Courses";

  return (
    <div className=" bg-background">
      <div className="sticky top-0 z-10 bg-background ">
        <div className="max-w-7xl mx-auto p-6 space-y-4">
          <h1 className="text-3xl font-bold"> {heading}</h1>

          <div className="flex justify-between" >

          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search courses ${pathname.includes('teach') ? "":"or instructors"} `}
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Link className="border rounded-xl flex items-center  gap-2 text-sm text-primary p-2 hover:bg-primary transition-all hover:text-background border-primary  "
           href={`/instructor/new-course`} > <span></span>  New  Course <PlusCircle />
          </Link>

          </div>

          <div className="flex flex-wrap gap-3">
            <Select onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Web">Web</SelectItem>
                <SelectItem value="AI">AI</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(v) => setSort(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="secondary">
              {items.length}/{total}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[calc(100vh-390px)]">
        {items.map((course) => (
          <Card
            key={course.id}
            className="group overflow-hidden rounded-2xl border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={
                  course.thumbnail ||
                  "https://www.convergencetraining.com/videos/newvids/large-placeholder-course.jpg"
                }
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                ₹{course.price}
              </div>
              {/* {roleTypeId} { loginRole} {course.instructorId} */}
              {loginRole == "INSTRUCTOR" && course.instructorId === roleTypeId  && (
                <Link
                  href={`/instructor/update-course/${course.id}`}
                  className="  flex items-center gap-1 absolute right-3 bottom-3 rounded-full bg-primary border-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur"
                >
                  Edit <Edit className="size-4" />
                </Link>
              )}
            </div>

            <CardHeader className="space-y-1 pb-2">
              <h3 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary transition">
                {course.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>{course.instructorName}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {course.lessonsCount} lessons
                </span>

                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </span>

                <span className="flex items-center gap-1.5">
                  👥 {course.enrollmentsCount}
                </span>
                <span className="flex items-center gap-1.5">
                <Gauge className="size-4" /> {course.level}
                </span>
              </div>

              {(course.prequisites || course.outcomes) && (
                <div className="space-y-1 text-xs">
                  {course.prequisites && (
                    <p className="line-clamp-1 text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Prerequisites:
                      </span>{" "}
                      {course.prequisites}
                    </p>
                  )}

                  {course.outcomes && (
                    <p className="line-clamp-1 text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Outcomes:
                      </span>{" "}
                      {course.outcomes}
                    </p>
                  )}
                </div>
              )}
            </CardContent>

            {loginRole === "STUDENT" && (
              <CardFooter className="pt-2">
                <Button
                  onClick={() =>
                    handleEnroll(course.id, course.amIEnrolled || false)
                  }
                  variant={course.amIEnrolled ? "outline" : "default"}
                  className="w-full rounded-xl transition"
                >
                  {course.amIEnrolled ? "Unenroll" : "Enroll"}
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <div ref={loaderRef} className="h-10" />

      {loading && (
        <div className="text-center py-6 text-muted-foreground">
          Loading more courses...
        </div>
      )}
    </div>
  );
}
