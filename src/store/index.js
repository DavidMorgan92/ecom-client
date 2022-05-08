import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import accountSlice from './accountSlice';
import productsSlice from './productsSlice';
import addressesSlice from './addressesSlice';
import cartSlice from './cartSlice';

const store = configureStore({
	reducer: {
		auth: authSlice,
		account: accountSlice,
		products: productsSlice,
		addresses: addressesSlice,
		cart: cartSlice,
	},
});

export default store;
