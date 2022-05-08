import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { configureStore } from '@reduxjs/toolkit';
import Cart from '.';
import authSlice from '../../store/authSlice';
import cartSlice from '../../store/cartSlice';

describe('Cart page', () => {
	it("navigates to login page when user isn't authenticated", () => {
		// Create mock auth store for unauthenticated user
		const unauthenticatedStore = configureStore({
			reducer: {
				auth: authSlice,
				cart: cartSlice,
			},
			preloadedState: {
				auth: {
					authenticated: false,
					authPending: false,
					authFailed: false,
					email: null,
					registrationPending: false,
					registrationFailed: false,
				},
				cart: {
					cart: [],
					getCartPending: false,
					getCartFailed: false,
					updateCartPending: false,
					updateCartFailed: false,
					checkoutCartPending: false,
					checkoutCartFailed: false,
				},
			},
		});

		// Create history to track navigation
		const history = createMemoryHistory();

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Provider store={unauthenticatedStore}>
					<Cart />
				</Provider>
			</Router>,
		);

		// Expect redirect to login page with redirect back to addresses page
		expect(history.location.pathname).toBe('/login');
		expect(history.location.search).toBe('?redirect=/cart');
	});
});
