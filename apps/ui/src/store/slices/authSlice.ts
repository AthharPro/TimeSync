import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { sendPasswordResetEmail, resetPassword, verifyPasswordResetLink } from '../../api/auth';

interface AuthState {
  loading: boolean;
  error: string | null;
  message: string | null;
  resetPasswordData: {
    verificationCodeId: string | null;
    userId: string | null;
    email: string | null;
  };
}

const initialState: AuthState = {
  loading: false,
  error: null,
  message: null,
  resetPasswordData: {
    verificationCodeId: null,
    userId: null,
    email: null,
  },
};

// Async thunk for sending password reset email
export const sendPasswordResetEmailThunk = createAsyncThunk(
  'auth/sendPasswordResetEmail',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await sendPasswordResetEmail(email);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to send password reset email'
      );
    }
  }
);

// Async thunk for verifying password reset link
export const verifyPasswordResetLinkThunk = createAsyncThunk(
  'auth/verifyPasswordResetLink',
  async (params: { token: string; verificationCode: string }, { rejectWithValue }) => {
    try {
      const response = await verifyPasswordResetLink(params.token, params.verificationCode);
      return {
        verificationCodeId: response.data.verificationCodeId,
        userId: response.data.user.id,
        email: response.data.user.email,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to verify reset link'
      );
    }
  }
);

// Async thunk for resetting password
export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (
    params: {
      newPassword: string;
      verificationCodeId: string;
      confirmNewPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await resetPassword(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to reset password'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuthMessage: (state) => {
      state.message = null;
    },
    clearResetPasswordData: (state) => {
      state.resetPasswordData = {
        verificationCodeId: null,
        userId: null,
        email: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Send password reset email
      .addCase(sendPasswordResetEmailThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(sendPasswordResetEmailThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || 'Password reset email sent successfully';
        state.error = null;
      })
      .addCase(sendPasswordResetEmailThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.message = null;
      })
      // Verify password reset link
      .addCase(verifyPasswordResetLinkThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPasswordResetLinkThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.resetPasswordData = action.payload;
        state.error = null;
      })
      .addCase(verifyPasswordResetLinkThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset password
      .addCase(resetPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || 'Password reset successful';
        state.error = null;
        // Clear reset password data after successful reset
        state.resetPasswordData = {
          verificationCodeId: null,
          userId: null,
          email: null,
        };
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.message = null;
      });
  },
});

export const { clearAuthError, clearAuthMessage, clearResetPasswordData } = authSlice.actions;
export default authSlice.reducer;
