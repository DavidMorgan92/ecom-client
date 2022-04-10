import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as account from '../services/ecom/account';

/**
 * Initial state of the account slice
 */
const initialState = {
	/** Is an account information update pending? */
	updatePending: false,

	/** Did the last account information update request fail? */
	updateFailed: false,
};

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
		[updateAccountInfo.fulfilled]: state => {
			state.updatePending = false;
			state.updateFailed = false;
		},
	},
});

/** Select account info update request pending state */
export const selectUpdatePending = state => state.account.updatePending;

/** Select account info update request failed state */
export const selectUpdateFailed = state => state.account.updateFailed;

export default accountSlice.reducer;
