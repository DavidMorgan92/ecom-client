import {
	render,
	screen,
	fireEvent,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Account from '.';
import store from '../../store';
import { routes } from '../../services/ecom/account';

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

describe('Account page', () => {
	it('gets account information on mount', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Account />
			</Provider>,
		);

		// Wait for get pending message to be shown
		await screen.findByText('Loading account information...');

		// Expect initial empty values to be in the input fields
		expect(screen.getByLabelText('First name')).toHaveValue('');
		expect(screen.getByLabelText('Last name')).toHaveValue('');

		// Expect input fields to be disabled
		expect(screen.getByLabelText('First name')).toBeDisabled();
		expect(screen.getByLabelText('Last name')).toBeDisabled();
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

		// Expect gotten values to be in the input fields
		expect(screen.getByLabelText('First name')).toHaveValue('David');
		expect(screen.getByLabelText('Last name')).toHaveValue('Morgan');

		// Expect input fields to be enabled
		expect(screen.getByLabelText('First name')).toBeEnabled();
		expect(screen.getByLabelText('Last name')).toBeEnabled();
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
			<Provider store={store}>
				<Account />
			</Provider>,
		);

		// Wait for get pending message to be shown
		await screen.findByText('Loading account information...');

		// Expect initial empty values to be in the input fields
		expect(screen.getByLabelText('First name')).toHaveValue('');
		expect(screen.getByLabelText('Last name')).toHaveValue('');

		// Expect input fields to be disabled
		expect(screen.getByLabelText('First name')).toBeDisabled();
		expect(screen.getByLabelText('Last name')).toBeDisabled();
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

		// Expect input fields to be enabled
		expect(screen.getByLabelText('First name')).toBeEnabled();
		expect(screen.getByLabelText('Last name')).toBeEnabled();
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
			<Provider store={store}>
				<Account />
			</Provider>,
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

		// Expect input fields to be disabled
		expect(screen.getByLabelText('First name')).toBeDisabled();
		expect(screen.getByLabelText('Last name')).toBeDisabled();
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

		// Expect input fields to be enabled
		expect(screen.getByLabelText('First name')).toBeEnabled();
		expect(screen.getByLabelText('Last name')).toBeEnabled();
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
			<Provider store={store}>
				<Account />
			</Provider>,
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

		// Expect input fields to be disabled
		expect(screen.getByLabelText('First name')).toBeDisabled();
		expect(screen.getByLabelText('Last name')).toBeDisabled();
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

		// Expect input fields to be enabled
		expect(screen.getByLabelText('First name')).toBeEnabled();
		expect(screen.getByLabelText('Last name')).toBeEnabled();
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
});
