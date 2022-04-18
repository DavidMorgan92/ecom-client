import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as products from '../services/ecom/products';

/**
 * Initial state of the products slice
 */
const initialState = {
	/** Is a get request pending? */
	getPending: false,

	/** Did the last get request fail? */
	getFailed: false,

	/** The list of products received from the API */
	products: [],
};

/**
 * Dispatch this thunk with category and name search parameters to get products
 */
export const getProducts = createAsyncThunk(
	'products/get',
	async ({ category, name }) => {
		// Request products through ECOM products service
		const productsInfo = await products.getProducts(category, name);

		// Return the products info as the action payload
		return {
			products: productsInfo,
		};
	},
);

const productsSlice = createSlice({
	name: 'products',
	initialState,
	extraReducers: {
		/** The products info request is pending a response */
		[getProducts.pending]: state => {
			state.getPending = true;
			state.getFailed = false;
		},

		/** The products info request failed */
		[getProducts.rejected]: state => {
			state.getPending = false;
			state.getFailed = true;
		},

		/** The products info request succeeded */
		[getProducts.fulfilled]: (state, action) => {
			state.getPending = false;
			state.getFailed = false;
			state.products = action.payload.products;
		},
	},
});

/** Select products get request pending state */
export const selectGetPending = state => state.products.getPending;

/** Select products get request failed state */
export const selectGetFailed = state => state.products.getFailed;

/** Select products */
export const selectProducts = state => state.products.products;

export default productsSlice.reducer;
