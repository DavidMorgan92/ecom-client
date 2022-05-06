import {
	fireEvent,
	render,
	screen,
	waitFor,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { configureStore } from '@reduxjs/toolkit';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import AccountAddresses from '.';
import { routes } from '../../services/ecom/addresses';
import authSlice from '../../store/authSlice';
import * as addressesSlice from '../../store/addressesSlice';
import accountSlice from '../../store/accountSlice';

// Mock redux store for an authenticated user
const mockStore = configureStore({
	reducer: {
		auth: authSlice,
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
		addresses: {
			getAddressesPending: false,
			getAddressesFailed: false,
			addresses: [],
			createAddressPending: false,
			createAddressFailed: false,
		},
	},
});

// Mock backing store
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
		const address = {
			id: ++newAddressId,
			houseNameNumber: req.body.houseNameNumber,
			streetName: req.body.streetName,
			townCityName: req.body.townCityName,
			postCode: req.body.postCode,
		};

		addresses.push(address);

		return res(ctx.json(address));
	}),
);

// Employ mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AccountAddresses page', () => {
	it('gets addresses on mount', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to be shown
		await screen.findByText('Loading addresses...');

		// Expect only get pending message to be shown
		expect(screen.queryByText('Loading addresses...')).toBeInTheDocument();
		expect(
			screen.queryByText('Failed to load addresses'),
		).not.toBeInTheDocument();
		expect(screen.queryByText('No addresses')).not.toBeInTheDocument();

		// Expect address list to be shown
		expect(screen.queryByTestId('address-list')).toBeInTheDocument();

		// Expect create address form not to be shown
		expect(screen.queryByTestId('create-address-form')).not.toBeInTheDocument();

		// Expect create address button to be shown
		expect(screen.queryByText('Create New Address')).toBeInTheDocument();

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Expect addresses received from server to be shown
		for (const address of addresses) {
			expect(screen.getByText(address.houseNameNumber)).toBeInTheDocument();
			expect(screen.getByText(address.streetName)).toBeInTheDocument();
			expect(screen.getByText(address.townCityName)).toBeInTheDocument();
			expect(screen.getByText(address.postCode)).toBeInTheDocument();
		}

		// Expect edit and delete buttons to be shown for the address
		expect(screen.getAllByText('Edit').length).toEqual(addresses.length);
		expect(screen.getAllByText('Delete').length).toEqual(addresses.length);

		// Expect none of these messages to be shown
		expect(screen.queryByText('Loading addresses...')).not.toBeInTheDocument();
		expect(
			screen.queryByText('Failed to load addresses'),
		).not.toBeInTheDocument();
		expect(screen.queryByText('No addresses')).not.toBeInTheDocument();

		// Expect address list to be shown
		expect(screen.queryByTestId('address-list')).toBeInTheDocument();

		// Expect create address form not to be shown
		expect(screen.queryByTestId('create-address-form')).not.toBeInTheDocument();

		// Expect create address button to be shown
		expect(screen.queryByText('Create New Address')).toBeInTheDocument();
	});

	it('shows no addresses message when no addresses are returned from the API', async () => {
		// Cause request to return empty addresses list
		server.use(
			rest.get(routes.addresses().href, (req, res, ctx) => {
				return res(ctx.json([]));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to be shown
		await screen.findByText('Loading addresses...');

		// Expect only get pending message to be shown
		expect(screen.queryByText('Loading addresses...')).toBeInTheDocument();
		expect(
			screen.queryByText('Failed to load addresses'),
		).not.toBeInTheDocument();
		expect(screen.queryByText('No addresses')).not.toBeInTheDocument();

		// Expect address list to be shown
		expect(screen.queryByTestId('address-list')).toBeInTheDocument();

		// Expect create address form not to be shown
		expect(screen.queryByTestId('create-address-form')).not.toBeInTheDocument();

		// Expect create address button to be shown
		expect(screen.queryByText('Create New Address')).toBeInTheDocument();

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Expect no addresses message to be shown
		expect(screen.getByText('No addresses'));

		// Expect no edit or delete buttons to be shown
		expect(screen.queryByText('Edit')).not.toBeInTheDocument();
		expect(screen.queryByText('Delete')).not.toBeInTheDocument();

		// Expect none of these messages to be shown
		expect(screen.queryByText('Loading addresses...')).not.toBeInTheDocument();
		expect(
			screen.queryByText('Failed to load addresses'),
		).not.toBeInTheDocument();

		// Expect address list to be shown
		expect(screen.queryByTestId('address-list')).toBeInTheDocument();

		// Expect create address form not to be shown
		expect(screen.queryByTestId('create-address-form')).not.toBeInTheDocument();

		// Expect create address button to be shown
		expect(screen.queryByText('Create New Address')).toBeInTheDocument();
	});

	it('shows error message when get fails', async () => {
		// Cause request to fail with 500
		server.use(
			rest.get(routes.addresses().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to be shown
		await screen.findByText('Loading addresses...');

		// Expect only get pending message to be shown
		expect(screen.queryByText('Loading addresses...')).toBeInTheDocument();
		expect(
			screen.queryByText('Failed to load addresses'),
		).not.toBeInTheDocument();
		expect(screen.queryByText('No addresses')).not.toBeInTheDocument();

		// Expect address list to be shown
		expect(screen.queryByTestId('address-list')).toBeInTheDocument();

		// Expect create address form not to be shown
		expect(screen.queryByTestId('create-address-form')).not.toBeInTheDocument();

		// Expect create address button to be shown
		expect(screen.queryByText('Create New Address')).toBeInTheDocument();

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Expect failed to load addresses message to be shown
		expect(screen.getByText('Failed to load addresses')).toBeInTheDocument();

		// Expect no edit or delete buttons to be shown
		expect(screen.queryByText('Edit')).not.toBeInTheDocument();
		expect(screen.queryByText('Delete')).not.toBeInTheDocument();

		// Expect none of these messages to be shown
		expect(screen.queryByText('Loading addresses...')).not.toBeInTheDocument();
		expect(screen.queryByText('No addresses')).not.toBeInTheDocument();

		// Expect address list to be shown
		expect(screen.queryByTestId('address-list')).toBeInTheDocument();

		// Expect create address form not to be shown
		expect(screen.queryByTestId('create-address-form')).not.toBeInTheDocument();

		// Expect create address button to be shown
		expect(screen.queryByText('Create New Address')).toBeInTheDocument();
	});

	it('shows create address form when create button is clicked', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Click the create button
		fireEvent.click(screen.getByText('Create New Address'));

		// Expect the create address form to be shown
		expect(screen.getByTestId('create-address-form')).toBeInTheDocument();

		// Expect the create address button not to be shown
		expect(screen.queryByText('Create New Address')).not.toBeInTheDocument();
	});

	it('dispatches createAddress thunk when create address form is submitted', async () => {
		// Spy on createAddress thunk in addressesSlice
		const createAddressSpy = jest.spyOn(addressesSlice, 'createAddress');

		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Click the create button
		fireEvent.click(screen.getByText('Create New Address'));

		// Input values into the form
		fireEvent.change(screen.getByLabelText('House name/number'), {
			target: { value: 'Pendennis' },
		});
		fireEvent.change(screen.getByLabelText('Street name'), {
			target: { value: 'Tredegar Road' },
		});
		fireEvent.change(screen.getByLabelText('Town/city name'), {
			target: { value: 'Ebbw Vale' },
		});
		fireEvent.change(screen.getByLabelText('Post code'), {
			target: { value: 'NP23 6LP' },
		});

		// Click the submit button
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect creating address message to be shown
		expect(await screen.findByText('Creating address...')).toBeInTheDocument();

		// Expect the createAddress thunk to have been called with the given parameters
		expect(createAddressSpy).toHaveBeenCalledTimes(1);
		expect(createAddressSpy).toHaveBeenCalledWith({
			houseNameNumber: 'Pendennis',
			streetName: 'Tredegar Road',
			townCityName: 'Ebbw Vale',
			postCode: 'NP23 6LP',
		});

		// Wait for the creating address message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Creating address...'));

		// Expect the create address form not to be in the document
		expect(screen.queryByTestId('create-address-form')).not.toBeInTheDocument();

		// Expect the create address button to be in the document
		expect(screen.getByText('Create New Address')).toBeInTheDocument();

		// Restore createAddress implementation
		createAddressSpy.mockRestore();
	});

	it('handles failure to create new address', async () => {
		// Make server fail with 500
		server.use(
			rest.post(routes.addresses().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Click the create button
		fireEvent.click(screen.getByText('Create New Address'));

		// Input values into the form
		fireEvent.change(screen.getByLabelText('House name/number'), {
			target: { value: 'Pendennis' },
		});
		fireEvent.change(screen.getByLabelText('Street name'), {
			target: { value: 'Tredegar Road' },
		});
		fireEvent.change(screen.getByLabelText('Town/city name'), {
			target: { value: 'Ebbw Vale' },
		});
		fireEvent.change(screen.getByLabelText('Post code'), {
			target: { value: 'NP23 6LP' },
		});

		// Click the submit button
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect creating address message to be shown
		expect(await screen.findByText('Creating address...')).toBeInTheDocument();

		// Wait for creating message to disappear
		await waitForElementToBeRemoved(screen.getByText('Creating address...'));

		// Expect failed to create message to be shown
		expect(screen.getByText('Failed to create address')).toBeInTheDocument();
	});

	it('hides create address form when edit button is clicked', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Click the create button
		fireEvent.click(screen.getByText('Create New Address'));

		// Expect the create address form to be shown
		expect(screen.getByTestId('create-address-form')).toBeInTheDocument();

		// Expect the create address button not to be shown
		expect(screen.queryByText('Create New Address')).not.toBeInTheDocument();

		// Click the first edit button
		fireEvent.click(screen.getAllByText('Edit')[0]);

		// Expect the create address from not to be shown
		expect(screen.queryByTestId('create-address-form')).not.toBeInTheDocument();

		// Expect the create address button to be shown
		expect(screen.queryByText('Create New Address')).toBeInTheDocument();
	});

	it('shows edit address form when edit button is clicked', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Click the first edit button
		fireEvent.click(screen.getAllByText('Edit')[0]);

		// Expect edit address form to be shown
		expect(screen.getByTestId('edit-address-form')).toBeInTheDocument();
	});

	it("navigates to login page when user isn't authenticated", () => {
		// Create mock auth store for unauthenticated user
		const unauthenticatedStore = configureStore({
			reducer: {
				auth: authSlice,
				account: accountSlice,
				addresses: addressesSlice.default,
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
				account: {
					getPending: false,
					getFailed: false,
					updatePending: false,
					updateFailed: false,
					accountInfo: null,
				},
				addresses: {
					getAddressesPending: false,
					getAddressesFailed: false,
					addresses: [],
					createAddressPending: false,
					createAddressFailed: false,
				},
			},
		});

		// Create history to track navigation, start at account page
		const history = createMemoryHistory({ initialEntries: ['/account'] });

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Provider store={unauthenticatedStore}>
					<AccountAddresses />
				</Provider>
			</Router>,
		);

		// Expect redirect to login page with redirect back to addresses page
		expect(history.location.pathname).toBe('/login');
		expect(history.location.search).toBe('?redirect=/account/addresses');
	});
});
