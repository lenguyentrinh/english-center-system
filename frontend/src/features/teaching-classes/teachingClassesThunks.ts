import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  createTeachingClass,
  deleteTeachingClass,
  getTeachingClassById,
  getTeachingClasses,
  updateTeachingClass,
} from "./teachingClassesApi.ts";

import type {
  TeachingClass,
  UpsertTeachingClassPayload,
} from "./types.ts";

import { getApiErrorMessage } from "@/shared/api/error.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";

type RejectValue = { rejectValue: string };

export const fetchTeachingClasses = createAsyncThunk<
  ApiResponse<TeachingClass[]>,
  void,
  RejectValue
>(
  "teachingClasses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getTeachingClasses();
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load classes")
      );
    }
  }
);

export const fetchTeachingClassById = createAsyncThunk<
  ApiResponse<TeachingClass>,
  number,
  RejectValue
>(
  "teachingClasses/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getTeachingClassById(id);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load class detail")
      );
    }
  }
);

export const createTeachingClassThunk = createAsyncThunk<
  ApiResponse<TeachingClass>,
  UpsertTeachingClassPayload,
  RejectValue
>(
  "teachingClasses/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await createTeachingClass(payload);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to create class")
      );
    }
  }
);

export const updateTeachingClassThunk = createAsyncThunk<
  ApiResponse<TeachingClass>,
  { id: number; payload: UpsertTeachingClassPayload },
  RejectValue
>(
  "teachingClasses/update",
  async (args, { rejectWithValue }) => {
    try {
      return await updateTeachingClass(args.id, args.payload);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update class")
      );
    }
  }
);

export const deleteTeachingClassThunk = createAsyncThunk<
  ApiResponse<null>,
  number,
  RejectValue
>(
  "teachingClasses/delete",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteTeachingClass(id);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to delete class")
      );
    }
  }
);
