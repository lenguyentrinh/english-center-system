import { configureStore } from "@reduxjs/toolkit";
import coursesReducer from "@/features/courses/courseSlice.ts";
import adminReducer from "@/features/admin/adminSlice.ts";
import teachersReducer from "@/features/teachers/teachersSlice.ts";

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    admin: adminReducer,
    teachers: teachersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;