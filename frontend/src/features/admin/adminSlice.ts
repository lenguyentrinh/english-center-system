import { createSlice } from "@reduxjs/toolkit";
import type { BusinessRoleResponse, RoleResponse, UserEffectiveRolesResponse, UserSummaryResponse } from "./types.ts";
import {
  assignBusinessRoleToUserThunk,
  assignRoleToUserThunk,
  createBusinessRoleThunk,
  createRoleThunk,
  deleteBusinessRoleThunk,
  deleteRoleThunk,
  fetchBusinessRoles,
  fetchRoles,
  fetchUserById,
  fetchUserEffectiveRoles,
  fetchUsers,
  removeBusinessRoleFromUserThunk,
  removeRoleFromUserThunk,
  updateBusinessRoleThunk,
  updateRoleThunk,
} from "./adminThunks.ts";

type AdminState = {
  users: UserSummaryResponse[];
  roles: RoleResponse[];
  businessRoles: BusinessRoleResponse[];
  selectedUser: UserSummaryResponse | null;
  userEffectiveRoles: UserEffectiveRolesResponse | null;
  loadingUsers: boolean;
  loadingRoles: boolean;
  loadingBusinessRoles: boolean;
  loadingUserDetail: boolean;
  submitting: boolean;
  error: string | null;
};

const initialState: AdminState = {
  users: [],
  roles: [],
  businessRoles: [],
  selectedUser: null,
  userEffectiveRoles: null,
  loadingUsers: false,
  loadingRoles: false,
  loadingBusinessRoles: false,
  loadingUserDetail: false,
  submitting: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
    clearSelectedUser(state) {
      state.selectedUser = null;
      state.userEffectiveRoles = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loadingUsers = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.users = action.payload.data;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = action.payload ?? action.error.message ?? "Failed to load users";
      })
      .addCase(fetchRoles.pending, (state) => {
        state.loadingRoles = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loadingRoles = false;
        state.roles = action.payload.data;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loadingRoles = false;
        state.error = action.payload ?? action.error.message ?? "Failed to load roles";
      })
      .addCase(fetchBusinessRoles.pending, (state) => {
        state.loadingBusinessRoles = true;
        state.error = null;
      })
      .addCase(fetchBusinessRoles.fulfilled, (state, action) => {
        state.loadingBusinessRoles = false;
        state.businessRoles = action.payload.data;
      })
      .addCase(fetchBusinessRoles.rejected, (state, action) => {
        state.loadingBusinessRoles = false;
        state.error = action.payload ?? action.error.message ?? "Failed to load business roles";
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loadingUserDetail = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loadingUserDetail = false;
        state.selectedUser = action.payload.data;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loadingUserDetail = false;
        state.error = action.payload ?? action.error.message ?? "Failed to load user";
      })
      .addCase(fetchUserEffectiveRoles.pending, (state) => {
        state.loadingUserDetail = true;
      })
      .addCase(fetchUserEffectiveRoles.fulfilled, (state, action) => {
        state.loadingUserDetail = false;
        state.userEffectiveRoles = action.payload.data;
      })
      .addCase(fetchUserEffectiveRoles.rejected, (state, action) => {
        state.loadingUserDetail = false;
        state.error = action.payload ?? action.error.message ?? "Failed to load user roles";
      })
      .addCase(createRoleThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createRoleThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.roles = [...state.roles, action.payload.data];
      })
      .addCase(createRoleThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? action.error.message ?? "Failed to create role";
      })
      .addCase(updateRoleThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateRoleThunk.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data;
        state.roles = state.roles.map((r) => (r.id === updated.id ? updated : r));
      })
      .addCase(updateRoleThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? action.error.message ?? "Failed to update role";
      })
      .addCase(deleteRoleThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteRoleThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.roles = state.roles.filter((r) => r.id !== action.meta.arg);
      })
      .addCase(deleteRoleThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? action.error.message ?? "Failed to delete role";
      })
      .addCase(createBusinessRoleThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createBusinessRoleThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.businessRoles = [...state.businessRoles, action.payload.data];
      })
      .addCase(createBusinessRoleThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? action.error.message ?? "Failed to create business role";
      })
      .addCase(updateBusinessRoleThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateBusinessRoleThunk.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data;
        state.businessRoles = state.businessRoles.map((br) => (br.id === updated.id ? updated : br));
      })
      .addCase(updateBusinessRoleThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? action.error.message ?? "Failed to update business role";
      })
      .addCase(deleteBusinessRoleThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteBusinessRoleThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.businessRoles = state.businessRoles.filter((br) => br.id !== action.meta.arg);
      })
      .addCase(deleteBusinessRoleThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? action.error.message ?? "Failed to delete business role";
      })
      .addCase(assignRoleToUserThunk.pending, (state) => {
        state.submitting = true;
      })
      .addCase(assignRoleToUserThunk.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(assignRoleToUserThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? action.error.message ?? "Failed to assign role";
      })
      .addCase(removeRoleFromUserThunk.pending, (state) => {
        state.submitting = true;
      })
      .addCase(removeRoleFromUserThunk.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(removeRoleFromUserThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? action.error.message ?? "Failed to remove role";
      })
      .addCase(assignBusinessRoleToUserThunk.pending, (state) => {
        state.submitting = true;
      })
      .addCase(assignBusinessRoleToUserThunk.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(assignBusinessRoleToUserThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? action.error.message ?? "Failed to assign business role";
      })
      .addCase(removeBusinessRoleFromUserThunk.pending, (state) => {
        state.submitting = true;
      })
      .addCase(removeBusinessRoleFromUserThunk.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(removeBusinessRoleFromUserThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? action.error.message ?? "Failed to remove business role";
      });
  },
});

export const { clearAdminError, clearSelectedUser } = adminSlice.actions;
export default adminSlice.reducer;
