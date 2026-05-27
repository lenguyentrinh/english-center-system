import { createSlice } from "@reduxjs/toolkit";
import {
  createCourseThunk,
  deleteCourseThunk,
  fetchCourseById,
  fetchCourses,
  updateCourseThunk,
} from "./courseThunks.ts";
import type { Course } from "./types.ts";

type CoursesState = {
  classes: Course[];
  selectedClass: Course | null;
  loadingList: boolean;
  loadingDetail: boolean;
  submitting: boolean;
  listError: string | null;
  detailError: string | null;
  mutationError: string | null;
};

const initialState: CoursesState = {
  classes: [],
  selectedClass: null,
  loadingList: false,
  loadingDetail: false,
  submitting: false,
  listError: null,
  detailError: null,
  mutationError: null,
};

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearCoursesError(state) {
      state.listError = null;
      state.detailError = null;
      state.mutationError = null;
    },
    clearSelectedCourse(state) {
      state.selectedClass = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loadingList = true;
        state.listError = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loadingList = false;
        state.classes = action.payload.data;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loadingList = false;
        state.listError = action.payload ?? action.error.message ?? "Failed to load courses";
      })
      .addCase(fetchCourseById.pending, (state) => {
        state.loadingDetail = true;
        state.detailError = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selectedClass = action.payload.data;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.detailError = action.payload ?? action.error.message ?? "Failed to load course detail";
      })
      .addCase(createCourseThunk.pending, (state) => {
        state.submitting = true;
        state.mutationError = null;
      })
      .addCase(createCourseThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.classes = [action.payload.data, ...state.classes];
      })
      .addCase(createCourseThunk.rejected, (state, action) => {
        state.submitting = false;
        state.mutationError = action.payload ?? action.error.message ?? "Failed to create course";
      })
      .addCase(updateCourseThunk.pending, (state) => {
        state.submitting = true;
        state.mutationError = null;
      })
      .addCase(updateCourseThunk.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data;
        state.classes = state.classes.map((item) => (item.id === updated.id ? updated : item));
        if (state.selectedClass?.id === updated.id) {
          state.selectedClass = updated;
        }
      })
      .addCase(updateCourseThunk.rejected, (state, action) => {
        state.submitting = false;
        state.mutationError = action.payload ?? action.error.message ?? "Failed to update course";
      })
      .addCase(deleteCourseThunk.pending, (state) => {
        state.submitting = true;
        state.mutationError = null;
      })
      .addCase(deleteCourseThunk.fulfilled, (state, action) => {
        state.submitting = false;
        const deletedId = action.meta.arg;
        state.classes = state.classes.filter((item) => item.id !== deletedId);
        if (state.selectedClass?.id === deletedId) {
          state.selectedClass = null;
        }
      })
      .addCase(deleteCourseThunk.rejected, (state, action) => {
        state.submitting = false;
        state.mutationError = action.payload ?? action.error.message ?? "Failed to delete course";
      });
  },
});

export const { clearCoursesError, clearSelectedCourse } = courseSlice.actions;
export default courseSlice.reducer;