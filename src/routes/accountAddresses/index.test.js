import {
	fireEvent,
	render,
	screen,
	waitForElementToBeRemoved,
	queryByText,
	getByText,
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

	rest.put(routes.addressById(1).href, (req, res, ctx) => {
		const address = {
			id: 1,
			houseNameNumber: req.body.houseNameNumber,
			streetName: req.body.streetName,
			townCityName: req.body.townCityName,
			postCode: req.body.postCode,
		};

		const index = addresses.findIndex(a => a.id === 1);
		addresses[index] = address;

		return res(ctx.json(address));
	}),

	rest.delete(routes.addressById(1).href, (req, res, ctx) => {
		const index = addresses.findIndex(a => a.id === 1);
		addresses.splice(index, 1);
		return res(ctx.status(204));
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
			target: { value: '732' },
		});
		fireEvent.change(screen.getByLabelText('Street name'), {
			target: { value: 'Evergreen Terrace' },
		});
		fireEvent.change(screen.getByLabelText('Town/city name'), {
			target: { value: 'Springfield' },
		});
		fireEvent.change(screen.getByLabelText('Post code'), {
			target: { value: 'SP23 1ET' },
		});

		// Click the submit button
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect creating address message to be shown
		expect(await screen.findByText('Creating address...')).toBeInTheDocument();

		// Expect the createAddress thunk to have been called with the given parameters
		expect(createAddressSpy).toHaveBeenCalledTimes(1);
		expect(createAddressSpy).toHaveBeenCalledWith({
			houseNameNumber: '732',
			streetName: 'Evergreen Terrace',
			townCityName: 'Springfield',
			postCode: 'SP23 1ET',
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

	it('hides create address form when delete button is clicked', async () => {
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

		// Click the first delete button
		fireEvent.click(screen.getAllByText('Delete')[0]);

		// Expect the create address from not to be shown
		expect(screen.queryByTestId('create-address-form')).not.toBeInTheDocument();

		// Expect the create address button to be shown
		expect(screen.queryByText('Create New Address')).toBeInTheDocument();
	});

	it('hides create address form when cancel button is clicked', async () => {
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

		// Click the cancel button
		fireEvent.click(
			getByText(screen.getByTestId('create-address-form'), 'Cancel'),
		);

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

		// Get info on edit and delete buttons
		const editButtons = screen.getAllByText('Edit');
		const numEditButtons = editButtons.length;
		const deleteButtons = screen.getAllByText('Delete');
		const numDeleteButtons = deleteButtons.length;

		// Click the first edit button
		fireEvent.click(editButtons[0]);

		// Expect edit address form to be shown
		expect(screen.getByTestId('edit-address-form')).toBeInTheDocument();

		// Expect the first address's details not to be shown
		expect(
			screen.queryByText(addresses[0].houseNameNumber),
		).not.toBeInTheDocument();
		expect(screen.queryByText(addresses[0].streetName)).not.toBeInTheDocument();
		expect(
			screen.queryByText(addresses[0].townCityName),
		).not.toBeInTheDocument();
		expect(screen.queryByText(addresses[0].postCode)).not.toBeInTheDocument();

		// Expect number of edit and delete buttons to be reduced by one
		expect(screen.getAllByText('Edit').length).toEqual(numEditButtons - 1);
		expect(screen.getAllByText('Delete').length).toEqual(numDeleteButtons - 1);
	});

	it('dispatches editAddress thunk when edit address form is submitted', async () => {
		// Spy on editAddress thunk in addressesSlice
		const editAddressSpy = jest.spyOn(addressesSlice, 'editAddress');

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

		// Input values into the form
		fireEvent.change(screen.getByLabelText('House name/number'), {
			target: { value: '732' },
		});
		fireEvent.change(screen.getByLabelText('Street name'), {
			target: { value: 'Evergreen Terrace' },
		});
		fireEvent.change(screen.getByLabelText('Town/city name'), {
			target: { value: 'Springfield' },
		});
		fireEvent.change(screen.getByLabelText('Post code'), {
			target: { value: 'SP23 1ET' },
		});

		// Click the submit button
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect updating address message to be shown
		expect(await screen.findByText('Updating address...')).toBeInTheDocument();

		// Expect editAddress thunk to have been called with the given parameters
		expect(editAddressSpy).toHaveBeenCalledTimes(1);
		expect(editAddressSpy).toHaveBeenCalledWith({
			id: addresses[0].id,
			houseNameNumber: '732',
			streetName: 'Evergreen Terrace',
			townCityName: 'Springfield',
			postCode: 'SP23 1ET',
		});

		// Wait for the updating address message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Updating address...'));

		// Expect the edit address form not to be in the document
		expect(screen.queryByTestId('edit-address-form')).not.toBeInTheDocument();

		// Restore editAddress implementation
		editAddressSpy.mockRestore();
	});

	it('handles failure to edit an address', async () => {
		// Make server fail with 500
		server.use(
			rest.put(routes.addressById(1).href, (req, res, ctx) => {
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

		// Click the first edit button
		fireEvent.click(screen.getAllByText('Edit')[0]);

		// Input values into the form
		fireEvent.change(screen.getByLabelText('House name/number'), {
			target: { value: '732' },
		});
		fireEvent.change(screen.getByLabelText('Street name'), {
			target: { value: 'Evergreen Terrace' },
		});
		fireEvent.change(screen.getByLabelText('Town/city name'), {
			target: { value: 'Springfield' },
		});
		fireEvent.change(screen.getByLabelText('Post code'), {
			target: { value: 'SP23 1ET' },
		});

		// Click the submit button
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect updating address message to be shown
		expect(await screen.findByText('Updating address...')).toBeInTheDocument();

		// Wait for the updating address message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Updating address...'));

		// Expect failed to update message to be shown
		expect(screen.getByText('Failed to update address')).toBeInTheDocument();
	});

	it('hides edit address form when create button is clicked', async () => {
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

		// Expect the edit address form to be shown
		expect(screen.getByTestId('edit-address-form')).toBeInTheDocument();

		// Click the create button
		fireEvent.click(screen.getByText('Create New Address'));

		// Expect the edit address from not to be shown
		expect(screen.queryByTestId('edit-address-form')).not.toBeInTheDocument();
	});

	it('hides edit address form when delete button is clicked', async () => {
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

		// Expect the edit address form to be shown
		expect(screen.getByTestId('edit-address-form')).toBeInTheDocument();

		// Click the first delete button
		fireEvent.click(screen.getAllByText('Delete')[0]);

		// Expect the edit address from not to be shown
		expect(screen.queryByTestId('edit-address-form')).not.toBeInTheDocument();
	});

	it('hides edit address form when cancel button is clicked', async () => {
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

		// Expect the edit address form to be shown
		expect(screen.getByTestId('edit-address-form')).toBeInTheDocument();

		// Click the cancel button
		fireEvent.click(
			getByText(screen.getByTestId('edit-address-form'), 'Cancel'),
		);

		// Expect the edit address from not to be shown
		expect(screen.queryByTestId('edit-address-form')).not.toBeInTheDocument();
	});

	it('shows delete address dialog when delete button is clicked', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Click the first delete button
		fireEvent.click(screen.getAllByText('Delete')[0]);

		// Expect the delete address dialog to be shown
		const deleteAddressDialog = screen.getByTestId('delete-address-dialog');
		expect(deleteAddressDialog).toBeInTheDocument();

		// Expect the address's details to be shown in the dialog
		expect(
			queryByText(deleteAddressDialog, addresses[0].houseNameNumber),
		).toBeInTheDocument();
		expect(
			queryByText(deleteAddressDialog, addresses[0].streetName),
		).toBeInTheDocument();
		expect(
			queryByText(deleteAddressDialog, addresses[0].townCityName),
		).toBeInTheDocument();
		expect(
			queryByText(deleteAddressDialog, addresses[0].postCode),
		).toBeInTheDocument();

		// Expect the delete address dialog to contain confirm and cancel buttons
		expect(queryByText(deleteAddressDialog, 'Confirm')).toBeInTheDocument();
		expect(queryByText(deleteAddressDialog, 'Cancel')).toBeInTheDocument();
	});

	it('dispatches deleteAddress thunk when confirm button is clicked', async () => {
		// Spy on deleteAddress thunk in addressesSlice
		const deleteAddressSpy = jest.spyOn(addressesSlice, 'deleteAddress');

		// Store ID of address we will be deleting
		const idToDelete = addresses[0].id;

		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Click the first delete button
		fireEvent.click(screen.getAllByText('Delete')[0]);

		// Click the confirm button
		fireEvent.click(screen.getByText('Confirm'));

		// Expect deleting address message to be shown
		expect(await screen.findByText('Deleting address...')).toBeInTheDocument();

		// Expect deleteAddress thunk to have been called with the given parameters
		expect(deleteAddressSpy).toHaveBeenCalledTimes(1);
		expect(deleteAddressSpy).toHaveBeenCalledWith(idToDelete);

		// Wait for the deleting address message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Deleting address...'));

		// Expect the delete address dialog not to be in the document
		expect(
			screen.queryByTestId('delete-address-dialog'),
		).not.toBeInTheDocument();

		// Restore deleteAddress implementation
		deleteAddressSpy.mockRestore();
	});

	it('hides delete address dialog when create button is clicked', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Click the first delete button
		fireEvent.click(screen.getAllByText('Delete')[0]);

		// Expect the delete address form to be shown
		expect(screen.getByTestId('delete-address-dialog')).toBeInTheDocument();

		// Click the create button
		fireEvent.click(screen.getByText('Create New Address'));

		// Expect the delete address from not to be shown
		expect(
			screen.queryByTestId('delete-address-dialog'),
		).not.toBeInTheDocument();
	});

	it('hides delete address dialog when edit button is clicked', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Click the first delete button
		fireEvent.click(screen.getAllByText('Delete')[0]);

		// Expect the delete address form to be shown
		expect(screen.getByTestId('delete-address-dialog')).toBeInTheDocument();

		// Click the first edit button
		fireEvent.click(screen.getAllByText('Edit')[0]);

		// Expect the delete address from not to be shown
		expect(
			screen.queryByTestId('delete-address-dialog'),
		).not.toBeInTheDocument();
	});

	it('hides delete address dialog when cancel button is clicked', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<AccountAddresses />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Loading addresses...'));

		// Click the first delete button
		fireEvent.click(screen.getAllByText('Delete')[0]);

		// Click the cancel button
		fireEvent.click(screen.getByText('Cancel'));

		// Expect the delete address dialog not to be in the document
		expect(
			screen.queryByTestId('delete-address-dialog'),
		).not.toBeInTheDocument();
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
