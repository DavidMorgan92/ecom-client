import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as cart from '../services/ecom/cart';
import { logout } from './authSlice';

/**
 * Initial state of the cart slice
 */
const initialState = {
	/** Is a get cart request pending? */
	getCartPending: false,

	/** Did the last get request fail? */
	getCartFailed: false,

	/** Is an update cart request pending? */
	updateCartPending: false,

	/** Did the last update request fail? */
	updateCartFailed: false,

	/** Is a checkout cart request pending? */
	checkoutCartPending: false,

	/** Did the last checkout request fail? */
	checkoutCartFailed: false,

	/** The cart items belonging to the authenticated user */
	cart: [],
};

/**
 * Dispatch this thunk to get the cart belonging to the authenticated user
 */
export const getCart = createAsyncThunk('cart/get', async () => {
	// Request cart through ECOM cart service
	const cartInfo = await cart.getCart();

	// Return the cart as the action payload
	return {
		cart: cartInfo,
	};
});

/**
 * Dispatch this thunk to update the cart belonging to the authenticated user
 */
export const updateCart = createAsyncThunk('cart/update', async items => {
	// Update the cart through the ECOM cart service
	const cartInfo = await cart.updateCart(
		items.map(item => ({
			count: item.count,
			productId: item.product.id,
		})),
	);

	// Return the updated cart as the action payload
	return {
		cart: cartInfo,
	};
});

/**
 * Dispatch this thunk to checkout a cart belonging to the authenticated user
 */
export const checkoutCart = createAsyncThunk(
	'cart/checkout',
	async ({ addressId, paymentIntentId }) => {
		// Checkout the cart through the ECOM cart service
		const orderId = await cart.checkoutCart(addressId, paymentIntentId);

		// Return the order ID as the action payload
		return {
			orderId,
		};
	},
);

const cartSlice = createSlice({
	name: 'cart',
	initialState,
	extraReducers: {
		/** The get cart request is pending a response */
		[getCart.pending]: state => {
			state.getCartPending = true;
			state.getCartFailed = false;
		},

		/** The get cart request failed */
		[getCart.rejected]: state => {
			state.getCartPending = false;
			state.getCartFailed = true;
		},

		/** The get cart request succeeded */
		[getCart.fulfilled]: (state, action) => {
			state.getCartPending = false;
			state.getCartFailed = false;
			state.updateCartFailed = false;
			state.cart = action.payload.cart;
		},

		/** The update cart request is pending a response */
		[updateCart.pending]: state => {
			state.updateCartPending = true;
			state.updateCartFailed = false;
		},

		/** The update cart request failed */
		[updateCart.rejected]: state => {
			state.updateCartPending = false;
			state.updateCartFailed = true;
		},

		/** The update cart request succeeded */
		[updateCart.fulfilled]: (state, action) => {
			state.updateCartPending = false;
			state.updateCartFailed = false;
			state.cart = action.payload.cart;
		},

		/** The checkout cart request is pending a response */
		[checkoutCart.pending]: state => {
			state.checkoutCartPending = true;
			state.checkoutCartFailed = false;
		},

		/** The checkout cart request failed */
		[checkoutCart.rejected]: state => {
			state.checkoutCartPending = false;
			state.checkoutCartFailed = true;
		},

		/** The checkout cart request succeeded */
		[checkoutCart.fulfilled]: state => {
			state.checkoutCartPending = false;
			state.checkoutCartFailed = false;
		},

		/** A logout request from the auth slice is pending */
		[logout.pending]: state => {
			// Empty the stored cart items
			state.cart = [];
		},
	},
});

/** Select get cart pending state */
export const selectGetCartPending = state => state.cart.getCartPending;

/** Select get cart failed state */
export const selectGetCartFailed = state => state.cart.getCartFailed;

/** Select update cart pending state */
export const selectUpdateCartPending = state => state.cart.updateCartPending;

/** Select update cart failed state */
export const selectUpdateCartFailed = state => state.cart.updateCartFailed;

/** Select cart items */
export const selectCart = state => state.cart.cart;

export default cartSlice.reducer;
