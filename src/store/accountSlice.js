import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as account from '../services/ecom/account';
import { logout } from './authSlice';

/**
 * Initial state of the account slice
 */
const initialState = {
	/** Is an account information request pending? */
	getPending: false,

	/** Did the last account information request fail? */
	getFailed: false,

	/** Is an account information update pending? */
	updatePending: false,

	/** Did the last account information update request fail? */
	updateFailed: false,

	/** The up-to-date account info */
	accountInfo: null,
};

/**
 * Dispatch this thunk to request account info
 */
export const getAccountInfo = createAsyncThunk('account/get', async () => {
	// Request account info through ECOM account service
	const accountInfo = await account.getAccountInfo();

	// Return the account info as the action payload
	return {
		accountInfo,
	};
});

/**
 * Dispatch this thunk with firstName and lastName parameters to request account info update
 */
export const updateAccountInfo = createAsyncThunk(
	'account/update',
	async ({ firstName, lastName }) => {
		// Update through ECOM account service
		const accountInfo = await account.updateAccountInfo(firstName, lastName);

		// Return the updated account info as the action payload
		return {
			accountInfo,
		};
	},
);

const accountSlice = createSlice({
	name: 'account',
	initialState,
	extraReducers: {
		/** The account info request is pending a response */
		[getAccountInfo.pending]: state => {
			state.getPending = true;
			state.getFailed = false;
		},

		/** The account info request failed */
		[getAccountInfo.rejected]: state => {
			state.getPending = false;
			state.getFailed = true;
		},

		/** The account info request succeeded */
		[getAccountInfo.fulfilled]: (state, action) => {
			state.getPending = false;
			state.getFailed = false;
			state.accountInfo = action.payload.accountInfo;
		},

		/** The account info update request is pending a response */
		[updateAccountInfo.pending]: state => {
			state.updatePending = true;
			state.updateFailed = false;
		},

		/** The account info update request failed */
		[updateAccountInfo.rejected]: state => {
			state.updatePending = false;
			state.updateFailed = true;
		},

		/** The account info update request succeeded */
		[updateAccountInfo.fulfilled]: (state, action) => {
			state.updatePending = false;
			state.updateFailed = false;
			state.accountInfo = action.payload.accountInfo;
		},

		/** A logout request from the auth slice is pending */
		[logout.pending]: state => {
			// Null out the stored account information
			state.accountInfo = null;
		},
	},
});

/** Select account info request pending state */
export const selectGetPending = state => state.account.getPending;

/** Select account info request failed state */
export const selectGetFailed = state => state.account.getFailed;

/** Select account info update request pending state */
export const selectUpdatePending = state => state.account.updatePending;

/** Select account info update request failed state */
export const selectUpdateFailed = state => state.account.updateFailed;

/** Select account info */
export const selectAccountInfo = state => state.account.accountInfo;

export default accountSlice.reducer;
