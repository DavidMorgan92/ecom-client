import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as ecom from '../services/ecom';

/**
 * Initial state of the auth slice
 */
const initialState = {
	/** Is the user authenticated? */
	authenticated: false,

	/** Is an authentication request pending a response? */
	authPending: false,

	/** Did the last authentication request fail? */
	authFailed: false,
};

/**
 * Dispatch this thunk with email and password parameters to request login
 */
export const login = createAsyncThunk(
	'auth/login',
	async ({ email, password }) => {
		return await ecom.login(email, password);
	},
);

const authSlice = createSlice({
	name: 'auth',
	initialState,
	extraReducers: {
		/** The login request is pending a response */
		[login.pending]: state => {
			state.authenticated = false;
			state.authPending = true;
			state.authFailed = false;
		},

		/** The login request failed */
		[login.rejected]: state => {
			state.authenticated = false;
			state.authPending = false;
			state.authFailed = true;
		},

		/** The login request succeeded */
		[login.fulfilled]: (state, action) => {
			// action.payload is a boolean indicating the success of the login request
			state.authenticated = action.payload;
			state.authPending = false;
			state.authFailed = !state.authenticated;
		},
	},
});

/** Select authenticated state */
export const selectAuthenticated = state => state.auth.authenticated;

/** Select authentication request pending state */
export const selectAuthPending = state => state.auth.authPending;

/** Select authentication request failed state */
export const selectAuthFailed = state => state.auth.authFailed;

export default authSlice.reducer;
