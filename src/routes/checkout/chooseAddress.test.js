import {
	fireEvent,
	render,
	screen,
	waitFor,
	waitForElementToBeRemoved,
	getByText,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ChooseAddress from './chooseAddress';
import authSlice from '../../store/authSlice';
import cartSlice from '../../store/cartSlice';
import * as addressesSlice from '../../store/addressesSlice';
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
		addresses: addressesSlice.default,
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

		// Expect 'Choose an existing address or...' header to be shown
		expect(
			screen.getByText('Choose an existing address or...'),
		).toBeInTheDocument();

		// Expect existing address select input to be shown
		expect(screen.getByTestId('existing-address-select')).toBeInTheDocument();

		// Expect 'New address' option to be shown
		expect(screen.getByText('New address')).toBeInTheDocument();

		// Expect existing addresses to be shown in the select input
		for (let address of addresses) {
			expect(screen.getByText(address.houseNameNumber)).toBeInTheDocument();
		}

		// Expect get addresses pending message to be shown
		expect(screen.getByText('Loading addresses...')).toBeInTheDocument();

		// Expect get failed message not to be shown
		expect(
			screen.queryByText('Failed to get addresses'),
		).not.toBeInTheDocument();

		// Expect input a new address header to be shown
		expect(screen.getByText('Input a new address')).toBeInTheDocument();

		// Expect these messages not to be shown
		expect(screen.queryByText('Saving new address...')).not.toBeInTheDocument();
		expect(
			screen.queryByText('Failed to save new address'),
		).not.toBeInTheDocument();

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
			expect(
				screen.queryByText('Loading addresses...'),
			).not.toBeInTheDocument();
		});

		// Expect get error messages not to be shown
		expect(screen.queryByText('Failed to get cart')).not.toBeInTheDocument();
		expect(
			screen.queryByText('Failed to get addresses'),
		).not.toBeInTheDocument();
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

	it('shows error message when get addresses fails', async () => {
		// Cause request to fail with 500
		server.use(
			rest.get(addressesRoutes.addresses().href, (req, res, ctx) => {
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
		await waitForElementToBeRemoved(screen.getByText('Loading addresses...'));

		// Expect failed to get addresses message to be shown
		expect(
			await screen.findByText('Failed to get addresses'),
		).toBeInTheDocument();
	});

	it('shows the selected address when one is chosen from the select input', async () => {
		// Check that handler gets called when continue to payment is clicked
		const handleContinueToPayment = jest.fn();

		// Render component
		render(
			<Provider store={mockStore}>
				<ChooseAddress onContinueToPayment={handleContinueToPayment} />
			</Provider>,
		);

		// Select first address in the select input
		fireEvent.change(screen.getByTestId('existing-address-select'), {
			target: { value: 0 },
		});

		// Expect address to be shown
		const deliveringToAddress = screen.getByTestId('delivering-to-address');
		expect(
			getByText(deliveringToAddress, addresses[0].houseNameNumber),
		).toBeInTheDocument();
		expect(
			getByText(deliveringToAddress, addresses[0].streetName),
		).toBeInTheDocument();
		expect(
			getByText(deliveringToAddress, addresses[0].townCityName),
		).toBeInTheDocument();
		expect(
			getByText(deliveringToAddress, addresses[0].postCode),
		).toBeInTheDocument();

		// Expect please choose address message not to be shown
		expect(
			screen.queryByText('Please choose a delivery address'),
		).not.toBeInTheDocument();

		// Click continue to payment button
		fireEvent.click(screen.getByText('Continue to Payment'));

		// Expect handler to be called with selected address and total price
		expect(handleContinueToPayment).toHaveBeenCalledTimes(1);
		expect(handleContinueToPayment).toHaveBeenCalledWith({
			id: addresses[0].id,
			houseNameNumber: addresses[0].houseNameNumber,
			streetName: addresses[0].streetName,
			townCityName: addresses[0].townCityName,
			postCode: addresses[0].postCode,
		}, 591);
	});

	it('shows the newly input address when it is submitted', async () => {
		// Spy on createAddress thunk
		const createAddressSpy = jest.spyOn(addressesSlice, 'createAddress');

		// Check that handler gets called when continue to payment is clicked
		const handleContinueToPayment = jest.fn();

		// Render component
		render(
			<Provider store={mockStore}>
				<ChooseAddress onContinueToPayment={handleContinueToPayment} />
			</Provider>,
		);

		// Input new address into address form and submit
		fireEvent.change(screen.getByLabelText('House name/number'), {
			target: { value: '3 Josiah Court' },
		});
		fireEvent.change(screen.getByLabelText('Street name'), {
			target: { value: 'Upper Union Street' },
		});
		fireEvent.change(screen.getByLabelText('Town/city name'), {
			target: { value: 'Merthyr Tydfil' },
		});
		fireEvent.change(screen.getByLabelText('Post code'), {
			target: { value: 'CF48 3LE' },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect address to be shown
		let deliveringToAddress;

		// Wait for submit form to complete
		await waitFor(() => {
			deliveringToAddress = screen.getByTestId('delivering-to-address');
		});

		expect(
			getByText(deliveringToAddress, '3 Josiah Court'),
		).toBeInTheDocument();
		expect(
			getByText(deliveringToAddress, 'Upper Union Street'),
		).toBeInTheDocument();
		expect(
			getByText(deliveringToAddress, 'Merthyr Tydfil'),
		).toBeInTheDocument();
		expect(getByText(deliveringToAddress, 'CF48 3LE')).toBeInTheDocument();

		// Expect please choose address message not to be shown
		expect(
			screen.queryByText('Please choose a delivery address'),
		).not.toBeInTheDocument();

		// Click continue to payment button
		fireEvent.click(screen.getByText('Continue to Payment'));

		// Expect saving new address message to appear
		expect(
			await screen.findByText('Saving new address...'),
		).toBeInTheDocument();

		// Expect continue to payment button to be disabled
		expect(screen.getByText('Continue to Payment')).toBeDisabled();

		// Expect handler to be called with selected address and total price
		await waitFor(() => {
			expect(handleContinueToPayment).toHaveBeenCalledTimes(1);
		});

		expect(handleContinueToPayment).toHaveBeenCalledWith({
			id: addresses.length,
			houseNameNumber: '3 Josiah Court',
			streetName: 'Upper Union Street',
			townCityName: 'Merthyr Tydfil',
			postCode: 'CF48 3LE',
		}, 591);

		// Expect failed to save new address message not to be shown
		expect(
			screen.queryByText('Failed to save new address'),
		).not.toBeInTheDocument();

		// Expect createAddress thunk to have been called with these parameters
		expect(createAddressSpy).toHaveBeenCalledTimes(1);
		expect(createAddressSpy).toHaveBeenCalledWith({
			houseNameNumber: '3 Josiah Court',
			streetName: 'Upper Union Street',
			townCityName: 'Merthyr Tydfil',
			postCode: 'CF48 3LE',
		});

		// Restore createAddress implementation
		createAddressSpy.mockRestore();
	});

	it('shows error message when create address fails', async () => {
		// Cause request to fail with 500
		server.use(
			rest.post(addressesRoutes.addresses().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<ChooseAddress />
			</Provider>,
		);

		// Input new address into address form and submit
		fireEvent.change(screen.getByLabelText('House name/number'), {
			target: { value: '3 Josiah Court' },
		});
		fireEvent.change(screen.getByLabelText('Street name'), {
			target: { value: 'Upper Union Street' },
		});
		fireEvent.change(screen.getByLabelText('Town/city name'), {
			target: { value: 'Merthyr Tydfil' },
		});
		fireEvent.change(screen.getByLabelText('Post code'), {
			target: { value: 'CF48 3LE' },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Wait for form submission to complete
		await screen.findByTestId('delivering-to-address');

		// Click continue to payment button
		fireEvent.click(screen.getByText('Continue to Payment'));

		// Wait for saving address message to appear
		await screen.findByText('Saving new address...');

		// Wait for saving address message to disappear
		await waitForElementToBeRemoved(screen.getByText('Saving new address...'));

		// Expect failed to save address message to be shown
		expect(screen.getByText('Failed to save new address')).toBeInTheDocument();
	});
});
