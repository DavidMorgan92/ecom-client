import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import accountSlice from './accountSlice';
import productsSlice from './productsSlice';

const store = configureStore({
	reducer: {
		auth: authSlice,
		account: accountSlice,
		products: productsSlice,
	},
});

export default store;
