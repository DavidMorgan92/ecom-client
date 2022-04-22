import { configureStore } from '@reduxjs/toolkit';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import Header from '.';
import store from '../../store';
import authSlice from '../../store/authSlice';

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
		expect(screen.queryByTestId('account-link')).not.toBeInTheDocument();
		expect(screen.queryByText('Logout')).not.toBeInTheDocument();
	});

	it('renders authenticated link group when authenticated', () => {
		// Create mock auth store for authenticated user
		const mockStore = configureStore({
			reducer: {
				auth: authSlice,
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
});
