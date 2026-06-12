import { createSlice } from "@reduxjs/toolkit";
import { fetchTeachers, type TeacherItem } from "./teachersThunks.ts";

type TeachersState = {
  teachers: TeacherItem[];
  loading: boolean;
  error: string | null;
};

const initialState: TeachersState = {
  teachers: [],
  loading: false,
  error: null,
};

const teachersSlice = createSlice({
  name: "teachers",
  initialState,
  reducers: {
    clearTeachersError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload.data;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message ?? "Failed to load teachers";
      });
  },
});

export const { clearTeachersError } = teachersSlice.actions;
export default teachersSlice.reducer;
