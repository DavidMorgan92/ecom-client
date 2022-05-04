import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import accountSlice from './accountSlice';
import productsSlice from './productsSlice';
import addressesSlice from './addressesSlice';

const store = configureStore({
	reducer: {
		auth: authSlice,
		account: accountSlice,
		products: productsSlice,
		addresses: addressesSlice,
	},
});

export default store;
