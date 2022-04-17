import {
	render,
	screen,
	fireEvent,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
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
			{ wrapper: MemoryRouter },
		);

		// Expect initial empty values to be in the input fields
		expect(screen.getByLabelText('Email')).toHaveValue('');
		expect(screen.getByLabelText('Password')).toHaveValue('');

		// Expect submit button to be enabled
		expect(screen.getByDisplayValue('Submit')).toBeEnabled();

		// Expect no message to be shown
		expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to login')).not.toBeInTheDocument();
	});

	it('logs in on submit', async () => {
		// Create history to track navigation, start at login page
		const history = createMemoryHistory({ initialEntries: ['/login'] });

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Provider store={store}>
					<Login />
				</Provider>
			</Router>,
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

		// Expect redirect to home page on login
		expect(history.location.pathname).toBe('/');
	});

	it('redirects to query param on successful login', async () => {
		// Create history to track navigation, start at login page with redirect to account page
		const history = createMemoryHistory({
			initialEntries: ['/login?redirect=account'],
		});

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Provider store={store}>
					<Login />
				</Provider>
			</Router>,
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

		// Expect redirect to account page on login
		expect(history.location.pathname).toBe('/account');
	});

	it('handles login error', async () => {
		// Cause request to fail with 500
		server.use(
			rest.post(routes.login().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Create history to track navigation, start at login page
		const history = createMemoryHistory({ initialEntries: ['/login'] });

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Provider store={store}>
					<Login />
				</Provider>
			</Router>,
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

		// Expect page not to redirect
		expect(history.location.pathname).toBe('/login');
	});

	it('shows required field warnings when fields are empty', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Login />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Submit form with empty input fields
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect validation warning messages to be shown
		expect(await screen.findByText('Email address is required')).toBeVisible();
		expect(await screen.findByText('Password is required')).toBeVisible();
	});

	it('shows invalid email warning when email field is invalid', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Login />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Input invalid email and submit form
		fireEvent.change(screen.getByLabelText('Email'), {
			target: { value: 'dave' },
		});
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Expect validation warning message to be shown
		expect(await screen.findByText('Invalid email address')).toBeVisible();
	});
});
