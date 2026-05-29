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
  courses: Course[];
  selectedCourse: Course | null;
  loadingList: boolean;
  loadingDetail: boolean;
  submitting: boolean;
  listError: string | null;
  detailError: string | null;
  mutationError: string | null;
};

const initialState: CoursesState = {
  courses: [],
  selectedCourse: null,
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
      state.selectedCourse = null;
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
        state.courses = action.payload.data;
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
        state.selectedCourse = action.payload.data;
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
        state.courses = [action.payload.data, ...state.courses];
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
        state.courses = state.courses.map((item) => (item.id === updated.id ? updated : item));
        if (state.selectedCourse?.id === updated.id) {
          state.selectedCourse = updated;
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
        state.courses = state.courses.filter((item) => item.id !== deletedId);
        if (state.selectedCourse?.id === deletedId) {
          state.selectedCourse = null;
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