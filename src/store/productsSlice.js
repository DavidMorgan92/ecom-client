import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as products from '../services/ecom/products';

/**
 * Initial state of the products slice
 */
const initialState = {
	/** Is a get products request pending? */
	getProductsPending: false,

	/** Did the last get products request fail? */
	getProductsFailed: false,

	/** The list of products received from the API */
	products: [],

	/** Is a get categories request pending? */
	getCategoriesPending: false,

	/** Did the last get categories request fail? */
	getCategoriesFailed: false,

	/** The list of product categories received from the API */
	categories: [],

	/** Is a get product by ID request pending? */
	getProductByIdPending: false,

	/** Did the last get product by ID request fail? */
	getProductByIdFailed: false,
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

/**
 * Dispatch this thunk to get product categories
 */
export const getCategories = createAsyncThunk(
	'products/getCategories',
	async () => {
		// Request categories through ECOM products service
		const categories = await products.getCategories();

		// Return the categories as the action payload
		return {
			categories,
		};
	},
);

/**
 * Dispatch this thunk to get a product by its ID
 */
export const getProductById = createAsyncThunk(
	'products/getProductById',
	async ({ id }) => {
		// Request product through ECOM products service
		const product = await products.getProductById(id);

		// Return the product as the action payload
		return {
			product,
		};
	},
);

const productsSlice = createSlice({
	name: 'products',
	initialState,
	extraReducers: {
		/** The products info request is pending a response */
		[getProducts.pending]: state => {
			state.getProductsPending = true;
			state.getProductsFailed = false;
		},

		/** The products info request failed */
		[getProducts.rejected]: state => {
			state.getProductsPending = false;
			state.getProductsFailed = true;
		},

		/** The products info request succeeded */
		[getProducts.fulfilled]: (state, action) => {
			state.getProductsPending = false;
			state.getProductsFailed = false;
			state.products = action.payload.products;
		},

		/** The categories request is pending a response */
		[getCategories.pending]: state => {
			state.getCategoriesPending = true;
			state.getCategoriesFailed = false;
		},

		/** The categories request failed */
		[getCategories.rejected]: state => {
			state.getCategoriesPending = false;
			state.getCategoriesFailed = true;
		},

		/** The categories request succeeded */
		[getCategories.fulfilled]: (state, action) => {
			state.getCategoriesPending = false;
			state.getCategoriesFailed = false;
			state.categories = action.payload.categories;
		},

		/** A request for a single product is pending */
		[getProductById.pending]: state => {
			state.getProductByIdPending = true;
			state.getProductByIdFailed = false;
		},

		/** A request for a single product failed */
		[getProductById.rejected]: state => {
			state.getProductByIdPending = false;
			state.getProductByIdFailed = true;
		},

		/** A request for a single product succeeded */
		[getProductById.fulfilled]: (state, action) => {
			state.getProductByIdPending = false;
			state.getProductByIdFailed = false;

			// Get the index in the set of downloaded products that matches the newly downloaded product
			const existingIndex = state.products.findIndex(
				p => p.id === action.payload.product.id,
			);

			// If an index of an existing product is found
			if (existingIndex >= 0) {
				// Update that existing item with the new information
				state.products[existingIndex] = action.payload.product;
			} else {
				// Add the new information to the downloaded set
				state.products.push(action.payload.product);
			}
		},
	},
});

/** Select products get request pending state */
export const selectGetProductsPending = state =>
	state.products.getProductsPending;

/** Select products get request failed state */
export const selectGetProductsFailed = state =>
	state.products.getProductsFailed;

/** Select products */
export const selectProducts = state => state.products.products;

/** Select categories get request pending state */
export const selectGetCategoriesPending = state =>
	state.products.getCategoriesPending;

/** Select categories get request failed state */
export const selectGetCategoriesFailed = state =>
	state.products.getCategoriesFailed;

/** Select categories */
export const selectCategories = state => state.products.categories;

/** Select get product by ID request pending state */
export const selectGetProductByIdPending = state =>
	state.products.getProductByIdPending;

/** Select get product by ID request failed state */
export const selectGetProductByIdFailed = state =>
	state.products.getProductByIdFailed;

export default productsSlice.reducer;
