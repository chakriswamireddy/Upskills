"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, X } from "lucide-react";
import { createCourse, updateCourse } from "../store/slices/coursesSlice";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../store/hooks";
import { toast } from "sonner";
// import { createCourse } from "../../store/slices/coursesSlice";

// Course form schema
const courseSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must not exceed 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must not exceed 500 characters"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  // lessonsCount: z.number().optional(),
  // .min(1, "Must have at least 1 lesson")
  // .max(200, "Cannot exceed 200 lessons"),
  duration: z
    .string()
    .min(1, "Duration is required")
    .regex(
      /^\d+\s+(week|weeks|month|months)$/,
      "Format: '8 weeks' or '3 months'"
    ),
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(99999, "Price too high"),
  category: z.string().optional(),
  //   .min(1, "Category is required"),
  prerequisites: z.string().optional(),
  outcomes: z.string().optional(),
  thumbnail: z.string().url().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface Course extends CourseFormData {
  id: string;
  instructorId: string;
  instructorName: string;
  thumbnail?: string;
}

interface CourseFormProps {
  mode: "create" | "update";
  course?: Course;
}

const categories = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "UI/UX Design",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "Blockchain",
  "Game Development",
];

export default function CourseForm({ mode, course }: CourseFormProps) {
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    course?.thumbnail || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: course || {
      title: "",
      description: "",
        // level: "",
      // lessonsCount: 1,
      duration: "",
      price: 0,
      category: "",
      prerequisites: "",
      outcomes: "",
    },
  });

  const selectedLevel = watch("level");
  const selectedCategory = watch("category");

  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (course) {
      setValue("level", course.level);
      setValue("category", course.category);
    }
  }, [course]);

  const onFormSubmit = async (data: CourseFormData) => {
    console.log("submittinnhg");
    setLoading(true);
    try {
      if (mode == "create") {
        await dispatch(createCourse(data));
      } else {
        if (course?.id) {
          await dispatch(updateCourse({ id: course.id, ...data }));
          //   // .log("Course found", course);
        }
      }
      toast(`${mode.toUpperCase() + " Success"}`, {
        description: `${
          mode == "create"
            ? "Course Created Successfully"
            : "Course Updated Successfully"
        },`,
      });
      router.push("/all-courses");
    } catch (error) {
      // .error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    router.push("/all-courses");
  };

  return (
    <div className=" py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-purple-200  py-0 shadow-2xl">
          <CardHeader className="  bg-gradient-to-r py-4 from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold">
              {mode === "create" ? "Create New Course" : "Update Course"}
            </CardTitle>
            <CardDescription className="text-indigo-100">
              {mode === "create"
                ? "Fill in the details to create a new course"
                : "Update the course information below"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">
                  Course Thumbnail URL
                </Label>

                <div className="flex items-start gap-6">
                  {thumbnailPreview ? (
                    <div className="relative group">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-48 h-32 object-cover rounded-lg border-2 border-purple-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailPreview(null);
                          setValue("thumbnail", "");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-48 h-32 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center text-sm text-slate-500">
                      Preview
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      className="h-11 border-purple-200 focus-visible:ring-purple-400"
                      {...register("thumbnail")}
                      onChange={(e) => setThumbnailPreview(e.target.value)}
                    />

                    <div className="text-xs text-slate-500">
                      Paste a public image URL (JPG, PNG, WebP)
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Basic Information
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-slate-700"
                  >
                    Course Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Full Stack MERN Bootcamp"
                    className="h-12 border-purple-200 focus-visible:ring-purple-400"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-slate-700"
                  >
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn in this course..."
                    rows={4}
                    className="border-purple-200 focus-visible:ring-purple-400 resize-none"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Level *
                    </Label>
                    <Select
                      value={selectedLevel}
                      onValueChange={(value) =>
                        setValue(
                          "level",
                          value as "Beginner" | "Intermediate" | "Advanced"
                        )
                      }
                    >
                      <SelectTrigger className="h-12 border-purple-200 focus:ring-purple-400">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.level && (
                      <p className="text-sm text-red-600">
                        {errors.level.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Category *
                    </Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(value) => setValue("category", value)}
                    >
                      <SelectTrigger className="h-12 border-purple-200 focus:ring-purple-400">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-600">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="lessonsCount" className="text-sm font-medium text-slate-700">
                      Lessons *
                    </Label>
                    <Input
                      id="lessonsCount"
                      type="number"
                      min="1"
                      placeholder="30"
                      className="h-12 border-purple-200 focus-visible:ring-purple-400"
                      {...register("lessonsCount", { valueAsNumber: true })}
                    />
                    {errors.lessonsCount && (
                      <p className="text-sm text-red-600">{errors.lessonsCount.message}</p>
                    )}
                  </div> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="duration"
                      className="text-sm font-medium text-slate-700"
                    >
                      Duration *
                    </Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 12 weeks or 3 months"
                      className="h-12 border-purple-200 focus-visible:ring-purple-400"
                      {...register("duration")}
                    />
                    {errors.duration && (
                      <p className="text-sm text-red-600">
                        {errors.duration.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="price"
                      className="text-sm font-medium text-slate-700"
                    >
                      Price (₹) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="4999"
                      className="h-12 border-purple-200 focus-visible:ring-purple-400"
                      {...register("price", { valueAsNumber: true })}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Additional Information
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="prerequisites"
                    className="text-sm font-medium text-slate-700"
                  >
                    Prerequisites{" "}
                    <span className="text-slate-500">(Optional)</span>
                  </Label>
                  <Textarea
                    id="prerequisites"
                    placeholder="Basic JavaScript knowledge, HTML & CSS fundamentals..."
                    rows={3}
                    className="border-purple-200 focus-visible:ring-purple-400 resize-none"
                    {...register("prerequisites")}
                  />
                  <p className="text-xs text-slate-500">
                    List any required knowledge or skills
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="outcomes"
                    className="text-sm font-medium text-slate-700"
                  >
                    Learning Outcomes{" "}
                    <span className="text-slate-500">(Optional)</span>
                  </Label>
                  <Textarea
                    id="outcomes"
                    placeholder="Build full-stack applications, Deploy to cloud, Master React hooks..."
                    rows={4}
                    className="border-purple-200 focus-visible:ring-purple-400 resize-none"
                    {...register("outcomes")}
                  />
                  <p className="text-xs text-slate-500">
                    What will students be able to do after completing this
                    course?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-purple-200">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-8 h-12 border-purple-300 text-slate-700 hover:bg-purple-50"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {mode === "create" ? "Creating..." : "Updating..."}
                    </>
                  ) : mode === "create" ? (
                    "Create Course"
                  ) : (
                    "Update Course"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// // Example usage
// export default function CourseFormExample() {
//   const handleCreate = async (data: CourseFormData, thumbnail?: File) => {
//     // .log("Creating course:", data);
//     // .log("Thumbnail:", thumbnail);

//     // Simulate API call
//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     alert("Course created successfully!");
//   };

//   const handleUpdate = async (data: CourseFormData, thumbnail?: File) => {
//     // .log("Updating course:", data);
//     // .log("Thumbnail:", thumbnail);

//     // Simulate API call
//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     alert("Course updated successfully!");
//   };

//   // Example for create mode
//   const CreateMode = () => (
//     <CourseForm
//       mode="create"
//       onSubmit={handleCreate}
//       onCancel={() => // .log("Cancelled")}
//     />
//   );

//   // Example for update mode
//   const UpdateMode = () => {
//     const existingCourse: Course = {
//       id: "c1a2b3",
//       title: "Full Stack MERN Bootcamp",
//       description: "Learn MERN from scratch with real projects",
//       instructorId: "inst_123",
//       instructorName: "Shruthi Rao",
//       lessonsCount: 30,
//     //   level: "Intermediate",
//       duration: "12 weeks",
//       price: 4999,
//       category: "Web Development",
//       prerequisites: "Basic JavaScript knowledge",
//       outcomes: "Build full-stack applications",
//     };

//     return (
//       <CourseForm
//         mode="update"
//         course={existingCourse}
//         onSubmit={handleUpdate}
//         onCancel={() => // .log("Cancelled")}
//       />
//     );
//   };

//   return <CreateMode />;
// }
