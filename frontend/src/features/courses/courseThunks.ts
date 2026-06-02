import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";
import type { Course, UpsertCoursePayload } from "./types.ts";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
} from "./courseApi.ts";

type RejectValue = { rejectValue: string };

export const fetchCourses = createAsyncThunk<ApiResponse<Course[]>, void, RejectValue>(
  "courses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getCourses();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load courses"));
    }
  }
);

export const fetchCourseById = createAsyncThunk<ApiResponse<Course>, number, RejectValue>(
  "courses/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getCourseById(id);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load course detail"));
    }
  }
);

export const createCourseThunk = createAsyncThunk<ApiResponse<Course>, UpsertCoursePayload, RejectValue>(
  "courses/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await createCourse(payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create course"));
    }
  }
);

export const updateCourseThunk = createAsyncThunk<ApiResponse<Course>, { id: number; payload: UpsertCoursePayload }, RejectValue>(
  "courses/update",
  async (args, { rejectWithValue }) => {
    try {
      return await updateCourse(args.id, args.payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update course"));
    }
  }
);

export const deleteCourseThunk = createAsyncThunk<ApiResponse<null>, number, RejectValue>(
  "courses/delete",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteCourse(id);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to delete course"));
    }
  }
);