import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as auth from '../services/ecom/auth';

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

	/** Is a registration request pending? */
	registrationPending: false,

	/** Did the last registration request fail? */
	registrationFailed: false,
};

/**
 * Dispatch this thunk with email and password parameters to request login
 */
export const login = createAsyncThunk(
	'auth/login',
	async ({ email, password }) => {
		// Login through ECOM auth service
		await auth.login(email, password);

		// Return the success status and the email address as the action payload
		return {
			email,
		};
	},
);

/**
 * Dispatch this thunk to request logout
 */
export const logout = createAsyncThunk('auth/logout', async () => {
	// Logout through ECOM auth service
	await auth.logout();
});

/**
 * Dispatch this thunk to request registration of a new account
 */
export const register = createAsyncThunk(
	'auth/register',
	async ({ firstName, lastName, email, password }) => {
		// Send registration request through ECOM auth service
		const accountInfo = await auth.register(
			firstName,
			lastName,
			email,
			password,
		);

		// Return the account info as the action payload
		return {
			accountInfo,
		};
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
			state.authenticated = true;
			state.authPending = false;
			state.authFailed = false;
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

		/** Register request is pending a response */
		[register.pending]: state => {
			state.registrationPending = true;
			state.registrationFailed = false;
		},

		/** Register request failed */
		[register.rejected]: state => {
			state.registrationPending = false;
			state.registrationFailed = true;
		},

		/** Register request succeeded */
		[register.fulfilled]: state => {
			state.registrationPending = false;
			state.registrationFailed = false;
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

/** Select registration pending state */
export const selectRegistrationPending = state =>
	state.auth.registrationPending;

/** Select registration failed state */
export const selectRegistrationFailed = state => state.auth.registrationFailed;

export default authSlice.reducer;
