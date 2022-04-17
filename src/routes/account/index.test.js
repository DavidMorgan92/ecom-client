import {
	render,
	screen,
	fireEvent,
	waitForElementToBeRemoved,
	waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { configureStore } from '@reduxjs/toolkit';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Account from '.';
import { routes } from '../../services/ecom/account';
import authSlice from '../../store/authSlice';
import accountSlice from '../../store/accountSlice';

// Mock backing store
const accountInfo = {
	firstName: 'David',
	lastName: 'Morgan',
};

// Mock server
const server = setupServer(
	rest.get(routes.account().href, (req, res, ctx) => {
		return res(ctx.json(accountInfo));
	}),

	rest.put(routes.account().href, (req, res, ctx) => {
		accountInfo.firstName = req.body.firstName;
		accountInfo.lastName = req.body.lastName;
		return res(ctx.json(accountInfo));
	}),
);

// Employ mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Create mock auth store for authenticated user
const mockStore = configureStore({
	reducer: {
		auth: authSlice,
		account: accountSlice,
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
		account: {
			getPending: false,
			getFailed: false,
			updatePending: false,
			updateFailed: false,
			accountInfo: null,
		},
	},
});

describe('Account page', () => {
	it('gets account information on mount', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<Account />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to be shown
		await screen.findByText('Loading account information...');

		// Expect initial empty values to be in the input fields
		expect(screen.getByLabelText('First name')).toHaveValue('');
		expect(screen.getByLabelText('Last name')).toHaveValue('');

		// Expect submit button to be disabled
		expect(screen.getByDisplayValue('Submit')).toBeDisabled();

		// Expect only get pending message to be shown
		expect(
			screen.queryByText('Loading account information...'),
		).toBeInTheDocument();
		expect(
			screen.queryByText('Failed to get account information'),
		).not.toBeInTheDocument();
		expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(
			screen.queryByText('Loading account information...'),
		);

		// Wait for Formik form to re-render
		waitFor(() => {
			// Expect gotten values to be in the input fields
			expect(screen.getByLabelText('First name')).toHaveValue('David');
			expect(screen.getByLabelText('Last name')).toHaveValue('Morgan');
		});

		// Expect submit button to be enabled
		expect(screen.getByDisplayValue('Submit')).toBeEnabled();

		// Expect no message to be shown
		expect(
			screen.queryByText('Loading account information...'),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText('Failed to get account information'),
		).not.toBeInTheDocument();
		expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();
	});

	it('handles get error', async () => {
		// Cause request to fail with 500
		server.use(
			rest.get(routes.account().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<Account />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to be shown
		await screen.findByText('Loading account information...');

		// Expect initial empty values to be in the input fields
		expect(screen.getByLabelText('First name')).toHaveValue('');
		expect(screen.getByLabelText('Last name')).toHaveValue('');

		// Expect submit button to be disabled
		expect(screen.getByDisplayValue('Submit')).toBeDisabled();

		// Expect only get pending message to be shown
		expect(
			screen.queryByText('Loading account information...'),
		).toBeInTheDocument();
		expect(
			screen.queryByText('Failed to get account information'),
		).not.toBeInTheDocument();
		expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(
			screen.queryByText('Loading account information...'),
		);

		// Expect input fields to be empty
		expect(screen.getByLabelText('First name')).toHaveValue('');
		expect(screen.getByLabelText('Last name')).toHaveValue('');

		// Expect submit button to be enabled
		expect(screen.getByDisplayValue('Submit')).toBeEnabled();

		// Expect get error message to be shown
		expect(
			screen.queryByText('Loading account information...'),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText('Failed to get account information'),
		).toBeInTheDocument();
		expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();
	});

	it('updates account information on submit', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<Account />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Values to submit through the form
		const newFirstName = 'John';
		const newLastName = 'Doe';

		// Wait for get-on-mount to end
		await waitForElementToBeRemoved(
			screen.queryByText('Loading account information...'),
		);

		// Input new first and last name, and submit form
		fireEvent.change(screen.getByLabelText('First name'), {
			target: { value: newFirstName },
		});
		fireEvent.change(screen.getByLabelText('Last name'), {
			target: { value: newLastName },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Wait for update pending message to be shown
		await screen.findByText('Updating...');

		// Expect new values to be in the input fields
		expect(screen.getByLabelText('First name')).toHaveValue(newFirstName);
		expect(screen.getByLabelText('Last name')).toHaveValue(newLastName);

		// Expect submit button to be disabled
		expect(screen.getByDisplayValue('Submit')).toBeDisabled();

		// Expect only update pending message to be shown
		expect(
			screen.queryByText('Loading account information...'),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText('Failed to get account information'),
		).not.toBeInTheDocument();
		expect(screen.queryByText('Updating...')).toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();

		// Wait for updating pending message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Updating...'));

		// Expect updated values to be in the input fields
		expect(screen.getByLabelText('First name')).toHaveValue(newFirstName);
		expect(screen.getByLabelText('Last name')).toHaveValue(newLastName);

		// Expect submit button to be enabled
		expect(screen.getByDisplayValue('Submit')).toBeEnabled();

		// Expect no message to be shown
		expect(
			screen.queryByText('Loading account information...'),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText('Failed to get account information'),
		).not.toBeInTheDocument();
		expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();
	});

	it('handles update error', async () => {
		// Cause request to fail with 500
		server.use(
			rest.put(routes.account().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<Account />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Values to submit through the form
		const newFirstName = 'John';
		const newLastName = 'Doe';

		// Wait for get-on-mount to end
		await waitForElementToBeRemoved(
			screen.queryByText('Loading account information...'),
		);

		// Input new first and last name, and submit form
		fireEvent.change(screen.getByLabelText('First name'), {
			target: { value: newFirstName },
		});
		fireEvent.change(screen.getByLabelText('Last name'), {
			target: { value: newLastName },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Wait for update pending message to be shown
		await screen.findByText('Updating...');

		// Expect new values to be in the input fields
		expect(screen.getByLabelText('First name')).toHaveValue(newFirstName);
		expect(screen.getByLabelText('Last name')).toHaveValue(newLastName);

		// Expect submit button to be disabled
		expect(screen.getByDisplayValue('Submit')).toBeDisabled();

		// Expect only update pending message to be shown
		expect(
			screen.queryByText('Loading account information...'),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText('Failed to get account information'),
		).not.toBeInTheDocument();
		expect(screen.queryByText('Updating...')).toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();

		// Wait for updating pending message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Updating...'));

		// Expect updated values to be in the input fields
		expect(screen.getByLabelText('First name')).toHaveValue(newFirstName);
		expect(screen.getByLabelText('Last name')).toHaveValue(newLastName);

		// Expect submit button to be enabled
		expect(screen.getByDisplayValue('Submit')).toBeEnabled();

		// Expect update failed message to be shown
		expect(
			screen.queryByText('Loading account information...'),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText('Failed to get account information'),
		).not.toBeInTheDocument();
		expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).toBeInTheDocument();
	});

	it('shows required field warnings when fields are empty', async () => {
		// Cause server to return empty values when they're gotten on mount
		server.use(
			rest.get(routes.account().href, (req, res, ctx) => {
				return res(ctx.json({ firstName: '', lastName: '' }));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<Account />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to be shown
		await screen.findByText('Loading account information...');

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(
			screen.queryByText('Loading account information...'),
		);

		// Submit form with empty input fields
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect validation warning messages to be shown
		expect(await screen.findByText('First name is required')).toBeVisible();
		expect(await screen.findByText('Last name is required')).toBeVisible();
	});

	it('shows invalid first name warning when first name field is > 20 characters', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<Account />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to be shown
		await screen.findByText('Loading account information...');

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(
			screen.queryByText('Loading account information...'),
		);

		// Input first name > 20 characters and submit form
		fireEvent.change(screen.getByLabelText('First name'), {
			target: { value: '123456789012345678901' },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect validation warning message to be shown
		expect(
			await screen.findByText('First name cannot be more than 20 characters'),
		).toBeVisible();
	});

	it('shows invalid last name warning when last name field is > 20 characters', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<Account />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to be shown
		await screen.findByText('Loading account information...');

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(
			screen.queryByText('Loading account information...'),
		);

		// Input first name > 20 characters and submit form
		fireEvent.change(screen.getByLabelText('Last name'), {
			target: { value: '123456789012345678901' },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect validation warning message to be shown
		expect(
			await screen.findByText('Last name cannot be more than 20 characters'),
		).toBeVisible();
	});

	it("navigates to login page when user isn't authenticated", () => {
		// Create mock auth store for unauthenticated user
		const unauthenticatedStore = configureStore({
			reducer: {
				auth: authSlice,
				account: accountSlice,
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
			},
		});

		// Create history to track navigation, start at account page
		const history = createMemoryHistory({ initialEntries: ['/account'] });

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Provider store={unauthenticatedStore}>
					<Account />
				</Provider>
			</Router>,
		);

		// Expect redirect to login page with redirect back to account page
		expect(history.location.pathname).toBe('/login');
		expect(history.location.search).toBe('?redirect=/account');
	});
});
