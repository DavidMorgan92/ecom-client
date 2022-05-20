import {
	fireEvent,
	render,
	screen,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import AddressPicker from '.';
import addressesSlice from '../../store/addressesSlice';
import { routes } from '../../services/ecom/addresses';

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

let newAddressId = addresses.length;

// Mock server
const server = setupServer(
	rest.get(routes.addresses().href, (req, res, ctx) => {
		return res(ctx.json(addresses));
	}),

	rest.post(routes.addresses().href, (req, res, ctx) => {
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

// Mock store
const mockStore = configureStore({
	reducer: {
		addresses: addressesSlice,
	},
	preloadedState: {
		addresses: {
			getAddressesPending: false,
			getAddressesFailed: false,
			addresses: [...addresses],
			createAddressPending: false,
			createAddressFailed: false,
		},
	},
});

describe('AddressPicker', () => {
	it('gets addresses on mount', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<AddressPicker />
			</Provider>,
		);

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
			expect(
				screen.getByText(`${address.houseNameNumber}${address.postCode}`),
			).toBeInTheDocument();
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

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'))

		// Expect get error message not to be shown
		expect(
			screen.queryByText('Failed to get addresses'),
		).not.toBeInTheDocument();
	});

	it('shows error message when get addresses fails', async () => {
		// Cause request to fail with 500
		server.use(
			rest.get(routes.addresses().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<AddressPicker />
			</Provider>,
		);

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.getByText('Loading addresses...'));

		// Expect failed to get addresses message to be shown
		expect(
			await screen.findByText('Failed to get addresses'),
		).toBeInTheDocument();
	});

	it('shows error message when create address fails', async () => {
		// Cause request to fail with 500
		server.use(
			rest.post(routes.addresses().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<AddressPicker />
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

		// Wait for saving address message to appear
		await screen.findByText('Saving new address...');

		// Wait for saving address message to disappear
		await waitForElementToBeRemoved(screen.getByText('Saving new address...'));

		// Expect failed to save address message to be shown
		expect(screen.getByText('Failed to save new address')).toBeInTheDocument();
	});
});
