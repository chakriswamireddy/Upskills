import { configureStore } from "@reduxjs/toolkit";
import coursesReducer from "./slices/coursesSlice";
import usersReducer from "./slices/usersSlice";
import enrollsReducer from "./slices/enrollsSlices";


export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    // users: usersReducer,
    enrolls: enrollsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
