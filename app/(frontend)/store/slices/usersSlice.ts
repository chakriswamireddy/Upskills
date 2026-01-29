import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UsersState {
  students: User[];
  instructors: User[];
  loading: boolean;
}

const initialState: UsersState = {
  students: [],
  instructors: [],
  loading: false,
};

export const fetchStudents = createAsyncThunk(
  "users/students",
  async (page: number) => {
    const res = await fetch(`/api/students?page=${page}`);
    return res.json();
  }
);

export const fetchInstructors = createAsyncThunk(
  "users/instructors",
  async (page: number) => {
    const res = await fetch(`/api/instructors?page=${page}`);
    return res.json();
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.students = action.payload.items;
      })
      .addCase(fetchInstructors.fulfilled, (state, action) => {
        state.instructors = action.payload.items;
      });
  },
});

export default usersSlice.reducer;
