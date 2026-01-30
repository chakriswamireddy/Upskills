import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  lessonsCount: number;
  thumbnail?:string,
  category?:string,
  price?:number,
  level?:string,
  enrollmentsCount?:number,
  prequisites?:string,
  outcomes?:string,
  duration?:string,
  amIEnrolled ?:boolean,
  instructorId :string,
}

interface CoursesState {
  items: Course[];
  loading: boolean;
  page: number;
  total: number;
}

const initialState: CoursesState = {
  items: [],
  loading: false,
  page: 1,
  total: 0,
};

export interface FetchCoursesParams {
  page?: number;
  search?: string;
  category?: string;
  level?: string;
  sort?: "popular" | "recent";
  instructorBased?: boolean,
  
}

export const fetchCourses = createAsyncThunk(
  "courses/all",
  async (params?: FetchCoursesParams) => {
    const {
      page = 1,
      search,
      category,
      level,
      sort,
      instructorBased
    } = params || {};

    const qs = new URLSearchParams();

    qs.set("page", page.toString());

    if (search) qs.set("search", search);
    if (category) qs.set("category", category);
    if (level) qs.set("level", level);
    if (sort) qs.set("sort", sort);
    if (instructorBased) qs.set("instructorBased", "true");


    const res = await fetch(`/api/courses?${qs.toString()}`);

    const items = await res.json();
    const total = Number(res.headers.get("X-Total") || 0);

    return { items, total };
  }
);


export const fetchInstructorCourses = createAsyncThunk(
  "courses/instructor",
  async ({ instructorId, page }: { instructorId: string; page: number }) => {
    const res = await fetch(`/api/courses?instructorId=${instructorId}&page=${page}`);
    return res.json();
  }
);

export const createCourse = createAsyncThunk(
  "courses/create",
  async (payload: { title: string; description: string }) => {
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Create failed");

    return res.json();
  }
);

export const updateCourse = createAsyncThunk(
  "courses/update",
  async ({ id, ...data }: { id: string; title?: string; description?: string }) => {
    const res = await fetch(`/api/courses?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // .log("res",res)

    if (!res.ok) throw new Error("Update failed");

    return res.json();
  }
);

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    resetCourses: (state) => {
      state.items = [];
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
 
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        // .log(action.payload.items)
        state.items = action.payload.items;
        state.total = action.payload.total;
      })

      .addCase(fetchInstructorCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })

      // create
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })

      // update
      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (c) => c.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload,
          };
        }
      });
  },
});

export const { resetCourses } = coursesSlice.actions;
export default coursesSlice.reducer;
