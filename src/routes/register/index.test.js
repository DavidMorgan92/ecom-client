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
});
