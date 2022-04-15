import {
	render,
	screen,
	fireEvent,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Login from '.';
import store from '../../store';
import { routes } from '../../services/ecom/auth';

// Mock server
const server = setupServer(
	rest.post(routes.login().href, (req, res, ctx) => {
		return res(ctx.status(200));
	}),
);

// Employ mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Login page', () => {
	it('renders correctly on mount', () => {
		// Render component
		render(
			<Provider store={store}>
				<Login />
			</Provider>,
		);

		// Expect initial empty values to be in the input fields
		expect(screen.getByLabelText('Email')).toHaveValue('');
		expect(screen.getByLabelText('Password')).toHaveValue('');

		// Expect no message to be shown
		expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to login')).not.toBeInTheDocument();
	});

	it('logs in on submit', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Login />
			</Provider>,
		);

		// Values to submit through the form
		const email = 'david.morgan@gmail.com';
		const password = 'Password01';

		// Input email and password, and submit form
		fireEvent.change(screen.getByLabelText('Email'), {
			target: { value: email },
		});
		fireEvent.change(screen.getByLabelText('Password'), {
			target: { value: password },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Wait for login pending message to be shown
		await screen.findByText('Logging in...');

		// Expect submit button to be disabled
		expect(screen.getByDisplayValue('Submit')).toBeDisabled();

		// Expect only login pending message to be shown
		expect(screen.queryByText('Logging in...')).toBeInTheDocument();
		expect(screen.queryByText('Failed to login')).not.toBeInTheDocument();

		// Wait for login pending message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Logging in...'));

		// Expect submit button to be enabled
		expect(screen.getByDisplayValue('Submit')).toBeEnabled();

		// Expect no message to be shown
		expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to login')).not.toBeInTheDocument();
	});

	it('handles login error', async () => {
		// Cause request to fail with 500
		server.use(
			rest.post(routes.login().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={store}>
				<Login />
			</Provider>,
		);

		// Values to submit through the form
		const email = 'david.morgan@gmail.com';
		const password = 'Password01';

		// Input email and password, and submit form
		fireEvent.change(screen.getByLabelText('Email'), {
			target: { value: email },
		});
		fireEvent.change(screen.getByLabelText('Password'), {
			target: { value: password },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Wait for login pending message to be shown
		await screen.findByText('Logging in...');

		// Expect submit button to be disabled
		expect(screen.getByDisplayValue('Submit')).toBeDisabled();

		// Expect only login pending message to be shown
		expect(screen.queryByText('Logging in...')).toBeInTheDocument();
		expect(screen.queryByText('Failed to login')).not.toBeInTheDocument();

		// Wait for login pending message to disappear
		await waitForElementToBeRemoved(screen.queryByText('Logging in...'));

		// Expect submit button to be enabled
		expect(screen.getByDisplayValue('Submit')).toBeEnabled();

		// Expect login failed message to be shown
		expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to login')).toBeInTheDocument();
	});
});
