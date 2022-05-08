import { configureStore } from '@reduxjs/toolkit';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import Header from '.';
import store from '../../store';
import authSlice from '../../store/authSlice';
import * as cartSlice from '../../store/cartSlice';
import productsSlice from '../../store/productsSlice';

describe('Header component', () => {
	it('renders correctly on mount', () => {
		// Render component
		render(
			<Provider store={store}>
				<Header />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Expect link to home page to be shown
		expect(screen.getByText('Ecom Client')).toHaveAttribute('href', '/');

		// Expect unauthenticated link group to be shown
		expect(screen.getByText('Login')).toHaveAttribute('href', '/login');
		expect(screen.getByText('Register')).toHaveAttribute('href', '/register');

		// Expect authenticated link group not to be shown
		expect(screen.queryByTestId('cart-link')).not.toBeInTheDocument();
		expect(screen.queryByTestId('account-link')).not.toBeInTheDocument();
		expect(screen.queryByText('Logout')).not.toBeInTheDocument();
	});

	it('renders authenticated link group when authenticated', () => {
		// Create mock auth store for authenticated user
		const mockStore = configureStore({
			reducer: {
				auth: authSlice,
				products: productsSlice,
				cart: cartSlice.default,
			},
			preloadedState: {
				auth: {
					authenticated: true,
					email: 'david.morgan@gmail.com',
				},
			},
		});

		// Render component
		render(
			<Provider store={mockStore}>
				<Header />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Expect link to home page to be shown
		expect(screen.getByText('Ecom Client')).toHaveAttribute('href', '/');

		// Expect unauthenticated link group not to be shown
		expect(screen.queryByText('Login')).not.toBeInTheDocument();
		expect(screen.queryByText('Register')).not.toBeInTheDocument();

		// Expect authenticated link group to be shown
		expect(screen.getByTestId('cart-link')).toBeInTheDocument();
		expect(screen.getByTestId('account-link')).toBeInTheDocument();
		expect(screen.getByText('Logout')).toBeInTheDocument();

		// Expect account link to have the email as its text
		expect(screen.getByTestId('account-link')).toHaveTextContent(
			'david.morgan@gmail.com',
		);
	});

	it('logs out when button is clicked', () => {
		// Create mock auth store for authenticated user
		const mockStore = configureStore({
			reducer: {
				auth: authSlice,
				products: productsSlice,
				cart: cartSlice.default,
			},
			preloadedState: {
				auth: {
					authenticated: true,
					email: 'david.morgan@gmail.com',
				},
			},
		});

		// Render component
		render(
			<Provider store={mockStore}>
				<Header />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Click the logout button
		fireEvent.click(screen.getByText('Logout'));

		// Expect link to home page to be shown
		expect(screen.getByText('Ecom Client')).toHaveAttribute('href', '/');

		// Expect unauthenticated link group to be shown
		expect(screen.getByText('Login')).toHaveAttribute('href', '/login');
		expect(screen.getByText('Register')).toHaveAttribute('href', '/register');

		// Expect authenticated link group not to be shown
		expect(screen.queryByTestId('account-link')).not.toBeInTheDocument();
		expect(screen.queryByText('Logout')).not.toBeInTheDocument();
	});

	it('shows correct cart item count in link group', () => {
		// Create mock auth store for authenticated user with 2 cart items
		const mockStore = configureStore({
			reducer: {
				auth: authSlice,
				products: productsSlice,
				cart: cartSlice.default,
			},
			preloadedState: {
				auth: {
					authenticated: true,
					email: 'david.morgan@gmail.com',
				},
				cart: {
					cart: [{}, {}],
				},
			},
		});

		// Render component
		render(
			<Provider store={mockStore}>
				<Header />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Expect 2 cart items to be shown in the link text
		expect(screen.getByTestId('cart-link')).toHaveTextContent('Cart (2)');
	});

	it('dispatches getCart thunk on mount', () => {
		// Spy on getCart thunk
		const getCartSpy = jest.spyOn(cartSlice, 'getCart');

		// Create mock auth store for authenticated user
		const mockStore = configureStore({
			reducer: {
				auth: authSlice,
				products: productsSlice,
				cart: cartSlice.default,
			},
			preloadedState: {
				auth: {
					authenticated: true,
					email: 'david.morgan@gmail.com',
				},
			},
		});

		// Render component
		render(
			<Provider store={mockStore}>
				<Header />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Expect the getCart thunk to have been called once
		expect(getCartSpy).toHaveBeenCalledTimes(1);

		// Restore the getCart implementation
		getCartSpy.mockRestore();
	});
});
