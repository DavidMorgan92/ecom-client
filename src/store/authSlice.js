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

	/** The email address of the authenticated user */
	email: null,
};

/**
 * Dispatch this thunk with email and password parameters to request login
 */
export const login = createAsyncThunk(
	'auth/login',
	async ({ email, password }) => {
		const success = await ecom.login(email, password);

		// Return the success status and the email address as the action payload
		return {
			success,
			email,
		};
	},
);

/**
 * Dispatch this thunk to request logout
 */
export const logout = createAsyncThunk('auth/logout', async () => {
	const success = await ecom.logout();

	return {
		success,
	};
});

const authSlice = createSlice({
	name: 'auth',
	initialState,
	extraReducers: {
		/** The login request is pending a response */
		[login.pending]: state => {
			state.authenticated = false;
			state.authPending = true;
			state.authFailed = false;
			state.email = null;
		},

		/** The login request failed */
		[login.rejected]: state => {
			state.authenticated = false;
			state.authPending = false;
			state.authFailed = true;
			state.email = null;
		},

		/** The login request succeeded */
		[login.fulfilled]: (state, action) => {
			// action.payload is a boolean indicating the success of the login request
			state.authenticated = action.payload.success;
			state.authPending = false;
			state.authFailed = !state.authenticated;
			state.email = action.payload.email;
		},

		/** User has clicked logout; set unauthenticated immediately, don't wait for response */
		[logout.pending]: state => {
			state.authenticated = false;
			state.authPending = false;
			state.authFailed = false;
			state.email = null;
		},

		/** Logout request rejected, still logout locally */
		[logout.rejected]: state => {
			state.authenticated = false;
			state.authPending = false;
			state.authFailed = false;
			state.email = null;
		},

		/** Logout request succeeded */
		[logout.fulfilled]: state => {
			state.authenticated = false;
			state.authPending = false;
			state.authFailed = false;
			state.email = null;
		},
	},
});

/** Select authenticated state */
export const selectAuthenticated = state => state.auth.authenticated;

/** Select authentication request pending state */
export const selectAuthPending = state => state.auth.authPending;

/** Select authentication request failed state */
export const selectAuthFailed = state => state.auth.authFailed;

/** Select the authenticated user's email */
export const selectEmail = state => state.auth.email;

export default authSlice.reducer;
