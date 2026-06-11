import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";
import { getTeachers } from "./teachersApi.ts";
import type { TeacherItem } from "./teachersApi.ts";
export type { TeacherItem };

type RejectValue = { rejectValue: string };

export const fetchTeachers = createAsyncThunk<ApiResponse<TeacherItem[]>, string | undefined, RejectValue>(
  "teachers/fetchAll",
  async (role, { rejectWithValue }) => {
    try {
      return await getTeachers(role);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load teachers"));
    }
  }
);
