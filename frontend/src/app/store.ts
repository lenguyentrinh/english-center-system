import { configureStore } from "@reduxjs/toolkit";
import teachingClassesReducer from "@/features/teaching-classes/teachingClassesSlice.ts";

export const store = configureStore({
  reducer: {
    teachingClasses: teachingClassesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;