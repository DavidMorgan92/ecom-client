import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as orders from '../services/ecom/orders';

/**
 * Initial state of the orders slice
 */
const initialState = {
	/** Is a get orders request pending? */
	getOrdersPending: false,

	/** Did the last get orders request fail? */
	getOrdersFailed: false,

	/** Is a get order by ID request pending? */
	getOrderByIdPending: false,

	/** Did the last get order by ID request fail? */
	getOrderByIdFailed: false,

	/** Orders belonging to the authorized user */
	orders: [],
};

/**
 * Dispatch this thunk to get all orders belonging to the authorized user
 */
export const getOrders = createAsyncThunk('orders/get', async () => {
	// Request orders through ECOM orders service
	const ordersInfo = await orders.getOrders();

	// Return the orders as the action payload
	return {
		orders: ordersInfo,
	};
});

/**
 * Dispatch this thunk to get one order belonging to the authorized user by its ID
 */
export const getOrderById = createAsyncThunk('orders/getById', async id => {
	// Get the order through ECOM orders service
	const orderInfo = await orders.getOrderById(id);

	// Return the order as the action payload
	return {
		order: orderInfo,
	};
});

const ordersSlice = createSlice({
	name: 'orders',
	initialState,
	extraReducers: {
		/** The orders request is pending a response */
		[getOrders.pending]: state => {
			state.getOrdersPending = true;
			state.getOrdersFailed = false;
		},

		/** The orders request failed */
		[getOrders.rejected]: state => {
			state.getOrdersPending = false;
			state.getOrdersFailed = true;
		},

		/** The orders request succeeded */
		[getOrders.fulfilled]: (state, action) => {
			state.getOrdersPending = false;
			state.getOrdersFailed = false;
			state.orders = action.payload.orders;
		},

		/** A request for a single order is pending */
		[getOrderById.pending]: state => {
			state.getOrderByIdPending = true;
			state.getOrderByIdFailed = false;
		},

		/** A request for a single order failed */
		[getOrderById.rejected]: state => {
			state.getOrderByIdPending = false;
			state.getOrderByIdFailed = true;
		},

		/** A request for a single order succeeded */
		[getOrderById.fulfilled]: (state, action) => {
			state.getOrderByIdPending = false;
			state.getOrderByIdFailed = false;

			// Get the index in the set of downloaded orders that matches the newly downloaded order
			const existingIndex = state.orders.findIndex(
				o => o.id === action.payload.order.id,
			);

			// If an index of an existing order is found
			if (existingIndex >= 0) {
				// Update that existing item with the new information
				state.orders[existingIndex] = action.payload.order;
			} else {
				// Add the new information to the downloaded set
				state.orders.push(action.payload.order);
			}
		},
	},
});

/** Select get orders pending state */
export const selectGetOrdersPending = state => state.orders.getOrdersPending;

/** Select get orders failed state */
export const selectGetOrdersFailed = state => state.orders.getOrdersFailed;

/** Select get order by ID request failed state */
export const selectGetOrderByIdPending = state =>
	state.orders.getOrderByIdPending;

/** Select get order by ID request pending state */
export const selectGetOrderByIdFailed = state =>
	state.orders.getOrderByIdFailed;

/** Select orders belonging to the authorized user */
export const selectOrders = state => state.orders.orders;

export default ordersSlice.reducer;
