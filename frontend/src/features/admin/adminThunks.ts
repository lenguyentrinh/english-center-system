import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";
import type {
  BusinessRoleResponse,
  BusinessRoleUpsertPayload,
  RoleResponse,
  RoleUpsertPayload,
  UserEffectiveRolesResponse,
  UserSummaryResponse,
} from "./types.ts";
import * as adminApi from "./adminApi.ts";

type RejectValue = { rejectValue: string };

export const fetchUsers = createAsyncThunk<ApiResponse<UserSummaryResponse[]>, void, RejectValue>(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.getUsers();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load users"));
    }
  }
);

export const fetchRoles = createAsyncThunk<ApiResponse<RoleResponse[]>, void, RejectValue>(
  "admin/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.getRoles();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load roles"));
    }
  }
);

export const fetchBusinessRoles = createAsyncThunk<ApiResponse<BusinessRoleResponse[]>, void, RejectValue>(
  "admin/fetchBusinessRoles",
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.getBusinessRoles();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load business roles"));
    }
  }
);

export const createRoleThunk = createAsyncThunk<ApiResponse<RoleResponse>, RoleUpsertPayload, RejectValue>(
  "admin/createRole",
  async (payload, { rejectWithValue }) => {
    try {
      return await adminApi.createRole(payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create role"));
    }
  }
);

export const updateRoleThunk = createAsyncThunk<ApiResponse<RoleResponse>, { id: number; payload: RoleUpsertPayload }, RejectValue>(
  "admin/updateRole",
  async (args, { rejectWithValue }) => {
    try {
      return await adminApi.updateRole(args.id, args.payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update role"));
    }
  }
);

export const deleteRoleThunk = createAsyncThunk<ApiResponse<null>, number, RejectValue>(
  "admin/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      return await adminApi.deleteRole(id);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to delete role"));
    }
  }
);

export const createBusinessRoleThunk = createAsyncThunk<ApiResponse<BusinessRoleResponse>, BusinessRoleUpsertPayload, RejectValue>(
  "admin/createBusinessRole",
  async (payload, { rejectWithValue }) => {
    try {
      return await adminApi.createBusinessRole(payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create business role"));
    }
  }
);

export const updateBusinessRoleThunk = createAsyncThunk<ApiResponse<BusinessRoleResponse>, { id: number; payload: BusinessRoleUpsertPayload }, RejectValue>(
  "admin/updateBusinessRole",
  async (args, { rejectWithValue }) => {
    try {
      return await adminApi.updateBusinessRole(args.id, args.payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update business role"));
    }
  }
);

export const deleteBusinessRoleThunk = createAsyncThunk<ApiResponse<null>, number, RejectValue>(
  "admin/deleteBusinessRole",
  async (id, { rejectWithValue }) => {
    try {
      return await adminApi.deleteBusinessRole(id);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to delete business role"));
    }
  }
);

export const fetchUserById = createAsyncThunk<ApiResponse<UserSummaryResponse>, number, RejectValue>(
  "admin/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      return await adminApi.getUserById(id);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load user"));
    }
  }
);

export const fetchUserEffectiveRoles = createAsyncThunk<ApiResponse<UserEffectiveRolesResponse>, number, RejectValue>(
  "admin/fetchUserEffectiveRoles",
  async (id, { rejectWithValue }) => {
    try {
      return await adminApi.getUserEffectiveRoles(id);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load user roles"));
    }
  }
);

export const assignRoleToUserThunk = createAsyncThunk<ApiResponse<null>, { userId: number; roleId: number }, RejectValue>(
  "admin/assignRoleToUser",
  async (args, { rejectWithValue }) => {
    try {
      return await adminApi.assignRoleToUser(args.userId, args.roleId);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to assign role"));
    }
  }
);

export const removeRoleFromUserThunk = createAsyncThunk<ApiResponse<null>, { userId: number; roleId: number }, RejectValue>(
  "admin/removeRoleFromUser",
  async (args, { rejectWithValue }) => {
    try {
      return await adminApi.removeRoleFromUser(args.userId, args.roleId);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to remove role"));
    }
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const assignBusinessRoleToUserThunk = createAsyncThunk<ApiResponse<any[]>, { userId: number; businessRoleId: number }, RejectValue>(
  "admin/assignBusinessRoleToUser",
  async (args, { rejectWithValue }) => {
    try {
      return await adminApi.assignBusinessRoleToUser(args.userId, args.businessRoleId);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to assign business role"));
    }
  }
);

export const removeBusinessRoleFromUserThunk = createAsyncThunk<ApiResponse<null>, { userId: number; businessRoleId: number }, RejectValue>(
  "admin/removeBusinessRoleFromUser",
  async (args, { rejectWithValue }) => {
    try {
      return await adminApi.removeBusinessRoleFromUser(args.userId, args.businessRoleId);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to remove business role"));
    }
  }
);
