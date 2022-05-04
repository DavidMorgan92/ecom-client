import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as addresses from '../services/ecom/addresses';

/**
 * Initial state of the addresses slice
 */
const initialState = {
	/** Is a get addresses request pending? */
	getAddressesPending: false,

	/** Did the last get addresses request fail? */
	getAddressesFailed: false,

	/** The list of addresses received from the API */
	addresses: [],

	/** Is a create address request pending? */
	createAddressPending: false,

	/** Did the last create address request fail? */
	createAddressFailed: false,
};

/**
 * Dispatch this thunk to get all addresses belonging to the authenticated user
 */
export const getAddresses = createAsyncThunk('addresses/get', async () => {
	// Request addresses through ECOM addresses service
	const addressesInfo = await addresses.getAddresses();

	// Return the addresses as the action payload
	return {
		addresses: addressesInfo,
	};
});

/**
 * Dispatch this thunk to create a new address belonging to the authenticated user
 */
export const createAddress = createAsyncThunk(
	'addresses/create',
	async ({ houseNameNumber, streetName, townCityName, postCode }) => {
		// Create an address through the ECOM addresses service
		const address = await addresses.createAddress(
			houseNameNumber,
			streetName,
			townCityName,
			postCode,
		);

		// Return the newly created address as the action payload
		return {
			address,
		};
	},
);

const addressesSlice = createSlice({
	name: 'addresses',
	initialState,
	extraReducers: {
		/** The get addresses request is pending a response */
		[getAddresses.pending]: state => {
			state.getAddressesPending = true;
			state.getAddressesFailed = false;
		},

		/** The get addresses request failed */
		[getAddresses.rejected]: state => {
			state.getAddressesPending = false;
			state.getAddressesFailed = true;
		},

		/** The get addresses request succeeded */
		[getAddresses.fulfilled]: (state, action) => {
			state.getAddressesPending = false;
			state.getAddressesFailed = false;
			state.addresses = action.payload.addresses;
		},

		/** The create address request is pending a response */
		[createAddress.pending]: state => {
			state.createAddressPending = true;
			state.createAddressFailed = false;
		},

		/** The create address request failed */
		[createAddress.rejected]: state => {
			state.createAddressPending = false;
			state.createAddressFailed = true;
		},

		/** The create address request succeeded */
		[createAddress.fulfilled]: (state, action) => {
			state.createAddressPending = false;
			state.createAddressFailed = false;
			state.addresses.push(action.payload.address);
		},
	},
});

/** Select get addresses pending state */
export const selectGetAddressesPending = state =>
	state.addresses.getAddressesPending;

/** Select get addresses failed state */
export const selectGetAddressesFailed = state =>
	state.addresses.getAddressesFailed;

/** Select addresses received from the API */
export const selectAddresses = state => state.addresses.addresses;

/** Select create address pending state */
export const selectCreateAddressPending = state =>
	state.addresses.createAddressPending;

/** Select create address failed state */
export const selectCreateAddressFailed = state =>
	state.addresses.createAddressFailed;

export default addressesSlice.reducer;
