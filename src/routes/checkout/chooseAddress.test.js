import {
	render,
	screen,
	waitFor,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ChooseAddress from './chooseAddress';
import authSlice from '../../store/authSlice';
import cartSlice from '../../store/cartSlice';
import addressesSlice from '../../store/addressesSlice';
import { routes as cartRoutes } from '../../services/ecom/cart';
import { routes as addressesRoutes } from '../../services/ecom/addresses';

// Mock cart
const cart = [
	{
		count: 1,
		product: {
			id: 1,
			name: 'Toothbrush',
			description: 'Bristly',
			category: 'Health & Beauty',
			pricePennies: '123',
			stock: 23,
		},
	},
	{
		count: 2,
		product: {
			id: 2,
			name: 'Hairbrush',
			description: 'For your head',
			category: 'Health & Beauty',
			pricePennies: '234',
			stock: 12,
		},
	},
];

// Mock addresses
const addresses = [
	{
		id: 1,
		houseNameNumber: 'Pendennis',
		streetName: 'Tredegar Road',
		townCityName: 'Ebbw Vale',
		postCode: 'NP23 6LP',
	},
	{
		id: 2,
		houseNameNumber: '3 Josiah Court',
		streetName: 'Upper Union Street',
		townCityName: 'Merthyr Tydfil',
		postCode: 'CF48 3LE',
	},
];

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
			cart,
		},
		addresses: {
			getAddressesPending: false,
			getAddressesFailed: false,
			addresses: [...addresses],
			createAddressPending: false,
			createAddressFailed: false,
		},
	},
});

let newAddressId = addresses.length;

// Mock server
const server = setupServer(
	rest.get(cartRoutes.cart().href, (req, res, ctx) => {
		return res(ctx.json({ items: cart }));
	}),

	rest.get(addressesRoutes.addresses().href, (req, res, ctx) => {
		return res(ctx.json(addresses));
	}),

	rest.post(addressesRoutes.addresses().href, (req, res, ctx) => {
		const newAddress = {
			id: ++newAddressId,
			houseNameNumber: req.body.houseNameNumber,
			streetName: req.body.streetName,
			townCityName: req.body.townCityName,
			postCode: req.body.postCode,
		};

		addresses.push(newAddress);

		return res(ctx.json(newAddress));
	}),
);

// Employ mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ChooseAddress page', () => {
	it('gets cart and addresses on mount', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<ChooseAddress />
			</Provider>,
		);

		// Expect 'Your cart' header to be shown
		expect(screen.getByText('Your cart')).toBeInTheDocument();

		// Expect cart items to be shown
		for (let item of cart) {
			expect(screen.getByText(item.product.name)).toBeInTheDocument();
			expect(screen.getByText('x' + item.count)).toBeInTheDocument();
		}

		// Expect loading cart message to be shown
		expect(screen.getByText('Loading cart...')).toBeInTheDocument();

		// Expect get cart failed message not to be shown
		expect(screen.queryByText('Failed to get cart')).not.toBeInTheDocument();

		// Expect 'Select delivery address' header to be shown
		expect(screen.getByText('Select delivery address')).toBeInTheDocument();

		// Expect delivering to header to be shown
		expect(screen.getByText('Delivering to...')).toBeInTheDocument();

		// Expect choose delivery address message to be shown
		expect(
			screen.getByText('Please choose a delivery address'),
		).toBeInTheDocument();

		// Expect continue to payment button to be shown
		expect(screen.getByText('Continue to Payment'));

		// Wait for loading messages to disappear
		await waitFor(() => {
			expect(screen.queryByText('Loading cart...')).not.toBeInTheDocument();
		});

		// Expect get error messages not to be shown
		expect(screen.queryByText('Failed to get cart')).not.toBeInTheDocument();
	});

	it('shows error message when get cart fails', async () => {
		// Cause request to fail with 500
		server.use(
			rest.get(cartRoutes.cart().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<ChooseAddress />
			</Provider>,
		);

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.getByText('Loading cart...'));

		// Expect failed to get cart message to be shown
		expect(screen.getByText('Failed to get cart')).toBeInTheDocument();
	});
});
