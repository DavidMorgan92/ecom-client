import {
	render,
	screen,
	fireEvent,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Register from '.';
import store from '../../store';
import { routes } from '../../services/ecom/auth';

// Mock server
const server = setupServer(
	rest.post(routes.register().href, (req, res, ctx) => {
		const accountInfo = {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
		};

		return res(ctx.json(accountInfo));
	}),
);

// Employ mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Register page', () => {
	it('renders correctly on mount', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Register />
			</Provider>,
		);

		// Expect initial empty values to be in the input fields
		expect(screen.getByLabelText('First name')).toHaveValue('');
		expect(screen.getByLabelText('Last name')).toHaveValue('');
		expect(screen.getByLabelText('Email')).toHaveValue('');
		expect(screen.getByLabelText('Password')).toHaveValue('');
		expect(screen.getByLabelText('Confirm password')).toHaveValue('');

		// Expect submit button to be enabled
		expect(screen.getByDisplayValue('Submit')).toBeEnabled();

		// Expect no message to be shown
		expect(screen.queryByText('Registering...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to register')).not.toBeInTheDocument();
	});

	it('registers on submit', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Register />
			</Provider>,
		);

		// Values to submit through the form
		const firstName = 'David';
		const lastName = 'Morgan';
		const email = 'david.morgan@gmail.com';
		const password = 'Password01';
		const confirmPassword = 'Password01';

		// Input values, and submit form
		fireEvent.change(screen.getByLabelText('First name'), {
			target: { value: firstName },
		});
		fireEvent.change(screen.getByLabelText('Last name'), {
			target: { value: lastName },
		});
		fireEvent.change(screen.getByLabelText('Email'), {
			target: { value: email },
		});
		fireEvent.change(screen.getByLabelText('Password'), {
			target: { value: password },
		});
		fireEvent.change(screen.getByLabelText('Confirm password'), {
			target: { value: confirmPassword },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Wait for registration pending message to be shown
		await screen.findByText('Registering...');

		// Expect submit button to be disabled
		expect(screen.getByDisplayValue('Submit')).toBeDisabled();

		// Expect only register pending message to be shown
		expect(screen.queryByText('Registering...')).toBeInTheDocument();
		expect(screen.queryByText('Failed to register')).not.toBeInTheDocument();

		// Wait for registration pending message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Registering...'));

		// Expect submit button to be enabled
		expect(screen.getByDisplayValue('Submit')).toBeEnabled();

		// Expect no message to be shown
		expect(screen.queryByText('Registering...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to register')).not.toBeInTheDocument();
	});

	it('handles registration error', async () => {
		// Cause request to fail with 500
		server.use(
			rest.post(routes.register().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={store}>
				<Register />
			</Provider>,
		);

		// Values to submit through the form
		const firstName = 'David';
		const lastName = 'Morgan';
		const email = 'david.morgan@gmail.com';
		const password = 'Password01';
		const confirmPassword = 'Password01';

		// Input values, and submit form
		fireEvent.change(screen.getByLabelText('First name'), {
			target: { value: firstName },
		});
		fireEvent.change(screen.getByLabelText('Last name'), {
			target: { value: lastName },
		});
		fireEvent.change(screen.getByLabelText('Email'), {
			target: { value: email },
		});
		fireEvent.change(screen.getByLabelText('Password'), {
			target: { value: password },
		});
		fireEvent.change(screen.getByLabelText('Confirm password'), {
			target: { value: confirmPassword },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Wait for registration pending message to be shown
		await screen.findByText('Registering...');

		// Expect submit button to be disabled
		expect(screen.getByDisplayValue('Submit')).toBeDisabled();

		// Expect only register pending message to be shown
		expect(screen.queryByText('Registering...')).toBeInTheDocument();
		expect(screen.queryByText('Failed to register')).not.toBeInTheDocument();

		// Wait for registration pending message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Registering...'));

		// Expect submit button to be enabled
		expect(screen.getByDisplayValue('Submit')).toBeEnabled();

		// Expect registration failed to be shown
		expect(screen.queryByText('Registering...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to register')).toBeInTheDocument();
	});

	it('shows required field warnings when fields are empty', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Register />
			</Provider>,
		);

		// Submit form with empty input fields
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect validation warning messages to be shown
		expect(await screen.findByText('First name is required')).toBeVisible();
		expect(await screen.findByText('Last name is required')).toBeVisible();
		expect(await screen.findByText('Email address is required')).toBeVisible();
		expect(await screen.findByText('Password is required')).toBeVisible();
		expect(
			await screen.findByText('Confirm password is required'),
		).toBeVisible();
	});

	it('shows invalid first name warning when first name field is > 20 characters', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Register />
			</Provider>,
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
			<Provider store={store}>
				<Register />
			</Provider>,
		);

		// Input last name > 20 characters and submit form
		fireEvent.change(screen.getByLabelText('Last name'), {
			target: { value: '123456789012345678901' },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect validation warning message to be shown
		expect(
			await screen.findByText('Last name cannot be more than 20 characters'),
		).toBeVisible();
	});

	it('shows invalid email warning when email field is invalid', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Register />
			</Provider>,
		);

		// Input invalid email and submit form
		fireEvent.change(screen.getByLabelText('Email'), {
			target: { value: 'dave' },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect validation warning message to be shown
		expect(await screen.findByText('Invalid email address')).toBeVisible();
	});

	it('shows invalid password warning when password field is < 8 characters', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Register />
			</Provider>,
		);

		// Input password < 8 characters and submit form
		fireEvent.change(screen.getByLabelText('Password'), {
			target: { value: 'short12' },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect validation warning message to be shown
		expect(await screen.findByText('Password must be 8 characters or more')).toBeVisible();
	});

	it('shows invalid confirm password warning when it doesn\'t match the password field', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Register />
			</Provider>,
		);

		// Input non-matching passwords and submit form
		fireEvent.change(screen.getByLabelText('Password'), {
			target: { value: 'password' },
		});
		fireEvent.change(screen.getByLabelText('Confirm password'), {
			target: { value: 'passwords' },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect validation warning message to be shown
		expect(await screen.findByText('Passwords must match')).toBeVisible();
	});
});
