import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Course, FetchCoursesParams } from "./coursesSlice";
 

interface EnrollmentsState {
  items: Course[];
  loading: boolean;
  error: string | null;
  total:number;
}

const initialState: EnrollmentsState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

// ================= Thunks =================

// Fetch my enrollments
export const fetchEnrollments = createAsyncThunk(
  "courses/all",
  async (params?: FetchCoursesParams) => {
    const {
      page = 1,
      search,
      category,
      level,
      sort,
      
    } = params || {};

    const qs = new URLSearchParams();

    qs.set("page", page.toString());
    qs.set("enrolled", "true"); 


    if (search) qs.set("search", search);
    if (category) qs.set("category", category);
    if (level) qs.set("level", level);
    if (sort) qs.set("sort", sort);

    const res = await fetch(`/api/courses?${qs.toString()}`);

    const items = await res.json();
    const total = Number(res.headers.get("X-Total") || 0);

    return { items, total };
  }
);


// Enroll
export const enrollCourse = createAsyncThunk(
  "enrollments/enroll",
  async (courseId: string) => {
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    if (!res.ok) throw new Error("Enrollment failed");

    return res.json();
  }
);

// Unenroll
export const unenrollCourse = createAsyncThunk(
  "enrollments/unenroll",
  async (courseId: string) => {
    const res = await fetch(`/api/enrollments?courseId=${courseId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Unenroll failed");

    return courseId;
  }
);



const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // fetch
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error";
      })
  },
});

export default enrollmentsSlice.reducer;
