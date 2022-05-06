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

	/** Is an edit address request pending? */
	editAddressPending: false,

	/** Did the last edit address request fail? */
	editAddressFailed: false,

	/** Is a delete address request pending? */
	deleteAddressPending: false,

	/** Did the last delete address request fail? */
	deleteAddressFailed: false,
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

/**
 * Dispatch this thunk to update an address belonging to the authenticated user
 */
export const editAddress = createAsyncThunk(
	'addresses/edit',
	async ({ id, houseNameNumber, streetName, townCityName, postCode }) => {
		// Update an address through the ECOM addresses service
		const address = await addresses.updateAddress(
			id,
			houseNameNumber,
			streetName,
			townCityName,
			postCode,
		);

		// Return the updated address as the action payload
		return {
			address,
		};
	},
);

/**
 * Dispatch this thunk to delete an address belonging to the authenticated user
 */
export const deleteAddress = createAsyncThunk(
	'addresses/delete',
	async ({ id }) => {
		await addresses.deleteAddress(id);
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

		/** The edit address request is pending a response */
		[editAddress.pending]: state => {
			state.editAddressPending = true;
			state.editAddressFailed = false;
		},

		/** The edit address request failed */
		[editAddress.rejected]: state => {
			state.editAddressPending = false;
			state.editAddressFailed = true;
		},

		/** The edit address request succeeded */
		[editAddress.fulfilled]: (state, action) => {
			state.editAddressPending = false;
			state.editAddressFailed = false;

			// See if there is an existing address with this ID in the addresses list
			const existingIndex = state.addresses.findIndex(
				existingAddress => existingAddress.id === action.payload.address.id,
			);

			// If an index of an existing address is found
			if (existingIndex >= 0) {
				// Update the existing address in the addresses list
				state.addresses[existingIndex] = action.payload.address;
			} else {
				// Add the updated address to the addresses list
				state.addresses.push(action.payload.address);
			}
		},

		/** The delete address request is pending a response */
		[deleteAddress.pending]: state => {
			state.deleteAddressPending = true;
			state.deleteAddressFailed = false;
		},

		/** The delete address request failed */
		[deleteAddress.rejected]: state => {
			state.deleteAddressPending = false;
			state.deleteAddressFailed = true;
		},

		/** The delete address request succeeded */
		[deleteAddress.fulfilled]: state => {
			state.deleteAddressPending = false;
			state.deleteAddressFailed = false;
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

/** Select edit address pending state */
export const selectEditAddressPending = state =>
	state.addresses.editAddressPending;

/** Select edit address failed state */
export const selectEditAddressFailed = state =>
	state.addresses.editAddressFailed;

/** Select delete address pending state */
export const selectDeleteAddressPending = state =>
	state.addresses.deleteAddressPending;

/** Select delete address failed state */
export const selectDeleteAddressFailed = state =>
	state.addresses.deleteAddressFailed;

export default addressesSlice.reducer;
