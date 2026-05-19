import { createSlice } from "@reduxjs/toolkit";

import {
  createTeachingClassThunk,
  deleteTeachingClassThunk,
  fetchTeachingClassById,
  fetchTeachingClasses,
  updateTeachingClassThunk,
} from "./teachingClassesThunks.ts";

import type { TeachingClass } from "./types.ts";

type TeachingClassesState = {
  classes: TeachingClass[];
  selectedClass: TeachingClass | null;

  loadingList: boolean;
  loadingDetail: boolean;
  submitting: boolean;
  listError: string | null;
  detailError: string | null;
  mutationError: string | null;
};

const initialState: TeachingClassesState = {
  classes: [],
  selectedClass: null,

  loadingList: false,
  loadingDetail: false,
  submitting: false,

  listError: null,
  detailError: null,
  mutationError: null,
};

const teachingClassesSlice = createSlice({
  name: "teachingClasses",
  initialState,
  reducers: {
    clearTeachingClassesError(state) {
      state.listError = null;
      state.detailError = null;
      state.mutationError = null;
    },
    clearSelectedTeachingClass(state) {
      state.selectedClass = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= FETCH ALL ================= */
      .addCase(fetchTeachingClasses.pending, (state) => {
        state.loadingList = true;
        state.listError = null;
      })
      .addCase(fetchTeachingClasses.fulfilled, (state, action) => {
        state.loadingList = false;
        state.classes = action.payload.data;
      })
      .addCase(fetchTeachingClasses.rejected, (state, action) => {
        state.loadingList = false;
        state.listError =
          action.payload ?? action.error.message ?? "Failed to load classes";
      })

      /* ================= FETCH DETAIL ================= */
      .addCase(fetchTeachingClassById.pending, (state) => {
        state.loadingDetail = true;
        state.detailError = null;
      })
      .addCase(fetchTeachingClassById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selectedClass = action.payload.data;
      })
      .addCase(fetchTeachingClassById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.detailError =
          action.payload ??
          action.error.message ??
          "Failed to load class detail";
      })

      /* ================= CREATE ================= */
      .addCase(createTeachingClassThunk.pending, (state) => {
        state.submitting = true;
        state.mutationError = null;
      })
      .addCase(createTeachingClassThunk.fulfilled, (state, action) => {
        state.submitting = false;

        state.classes = [
          action.payload.data,
          ...state.classes,
        ];
      })
      .addCase(createTeachingClassThunk.rejected, (state, action) => {
        state.submitting = false;
        state.mutationError =
          action.payload ?? action.error.message ?? "Failed to create class";
      })

      /* ================= UPDATE ================= */
      .addCase(updateTeachingClassThunk.pending, (state) => {
        state.submitting = true;
        state.mutationError = null;
      })
      .addCase(updateTeachingClassThunk.fulfilled, (state, action) => {
        state.submitting = false;

        const updated = action.payload.data;

        state.classes = state.classes.map((item) =>
          item.id === updated.id ? updated : item
        );

        if (state.selectedClass?.id === updated.id) {
          state.selectedClass = updated;
        }
      })
      .addCase(updateTeachingClassThunk.rejected, (state, action) => {
        state.submitting = false;
        state.mutationError =
          action.payload ?? action.error.message ?? "Failed to update class";
      })

      /* ================= DELETE ================= */
      .addCase(deleteTeachingClassThunk.pending, (state) => {
        state.submitting = true;
        state.mutationError = null;
      })
      .addCase(deleteTeachingClassThunk.fulfilled, (state, action) => {
        state.submitting = false;

        const deletedId = action.meta.arg;

        state.classes = state.classes.filter(
          (item) => item.id !== deletedId
        );

        if (state.selectedClass?.id === deletedId) {
          state.selectedClass = null;
        }
      })
      .addCase(deleteTeachingClassThunk.rejected, (state, action) => {
        state.submitting = false;
        state.mutationError =
          action.payload ?? action.error.message ?? "Failed to delete class";
      });
  },
});

export const {
  clearTeachingClassesError,
  clearSelectedTeachingClass,
} = teachingClassesSlice.actions;

export default teachingClassesSlice.reducer;