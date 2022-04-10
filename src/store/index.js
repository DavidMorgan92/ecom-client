import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import accountSlice from './accountSlice';

const store = configureStore({
	reducer: {
		auth: authSlice,
		account: accountSlice,
	},
});

export default store;
