import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../../store/authSlice';
import cartSlice from '../../store/cartSlice';
import addressesSlice from '../../store/addressesSlice';
import Checkout from '.';
import * as mocks from '../../../test/mocks';
import { Elements } from '@stripe/react-stripe-js';

// Mock store for an authenticated user
const mockStore = configureStore({
	reducer: {
		auth: authSlice,
		cart: cartSlice,
		addresses: addressesSlice,
	},
	preloadedState: {
		auth: {
			authenticated: true,
			authPending: false,
			authFailed: false,
			email: 'david.morgan@gmail.com',
			registrationPending: false,
			registrationFailed: false,
		},
		cart: {
			getCartPending: false,
			getCartFailed: false,
			updateCartPending: false,
			updateCartFailed: false,
			checkoutCartPending: false,
			checkoutCartFailed: false,
			cart: [
				{
					count: 1,
					product: {
						id: 1,
						name: 'Toothbrush',
						description: 'Bristly',
						category: 'Health & Beauty',
						pricePennies: '123',
						stock: '23',
					},
				},
			],
		},
		addresses: {
			getAddressesPending: false,
			getAddressesFailed: false,
			addresses: [
				{
					id: 1,
					houseNameNumber: 'Pendennis',
					streetName: 'Tredegar Road',
					townCityName: 'Ebbw Vale',
					postCode: 'NP23 6LP',
				},
			],
			createAddressPending: false,
			createAddressFailed: false,
		},
	},
});

// Stripe mocks
let mockStripe;
let mockElements;

beforeEach(() => {
	mockStripe = mocks.mockStripe();
	mockElements = mocks.mockElements();
	mockStripe.elements.mockReturnValue(mockElements);
});

afterEach(() => {
	jest.restoreAllMocks();
});

describe('Checkout page', () => {
	it('shows the ChooseAddress page on mount', () => {
		// Render component
		render(
			<Elements stripe={mockStripe}>
				<Provider store={mockStore}>
					<Checkout />
				</Provider>
			</Elements>,
			{ wrapper: MemoryRouter },
		);

		// Expect header element at top of ChooseAddress page to be shown
		expect(screen.getByText('Your cart')).toBeInTheDocument();
	});

	it('shows the ConfirmPayment page when an address is chosen', () => {
		// Render component
		render(
			<Elements stripe={mockStripe}>
				<Provider store={mockStore}>
					<Checkout />
				</Provider>
			</Elements>,
			{ wrapper: MemoryRouter },
		);

		// Select first address in select input
		fireEvent.change(screen.getByTestId('existing-address-select'), {
			target: { value: 0 },
		});

		// Click the continue to payment button
		fireEvent.click(screen.getByText('Continue to Payment'));

		// Expect header element at top of ConfirmPayment page to be shown
		expect(screen.getByText('Confirm Payment'));
	});

	it('goes back to ChooseAddress page when back button is clicked', () => {
		// Render component
		render(
			<Elements stripe={mockStripe}>
				<Provider store={mockStore}>
					<Checkout />
				</Provider>
			</Elements>,
			{ wrapper: MemoryRouter },
		);

		// Select first address in select input
		fireEvent.change(screen.getByTestId('existing-address-select'), {
			target: { value: 0 },
		});

		// Click the continue to payment button
		fireEvent.click(screen.getByText('Continue to Payment'));

		// Click the back button
		fireEvent.click(screen.getByText('Back'));

		// Expect header element at top of ChooseAddress page to be shown
		expect(screen.getByText('Your cart')).toBeInTheDocument();
	});

	it("navigates to login page when user isn't authenticated", () => {
		// Create mock store for unauthenticated user
		const unauthenticatedStore = configureStore({
			reducer: {
				auth: authSlice,
			},
		});

		// Create history to track navigation
		const history = createMemoryHistory();

		// Render component
		render(
			<Elements stripe={mockStripe}>
				<Router navigator={history} location={history.location}>
					<Provider store={unauthenticatedStore}>
						<Checkout />
					</Provider>
				</Router>
			</Elements>,
		);

		// Expect redirect to login page with redirect back to checkout page
		expect(history.location.pathname).toBe('/login');
		expect(history.location.search).toBe('?redirect=/checkout');
	});
});
