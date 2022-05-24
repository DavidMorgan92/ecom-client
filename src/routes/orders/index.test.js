import {
	render,
	screen,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { configureStore } from '@reduxjs/toolkit';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Orders from '.';
import { routes } from '../../services/ecom/orders';
import ordersSlice from '../../store/ordersSlice';
import authSlice from '../../store/authSlice';

// Mock redux store for an authenticated user
const mockStore = configureStore({
	reducer: {
		auth: authSlice,
		orders: ordersSlice,
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
		orders: {
			orders: [],
		},
	},
});

// Mock backing store
const orders = [
	{
		id: 1,
		createdAt: new Date(),
		address: {
			id: 1,
			houseNameNumber: 'Pendennis',
			streetName: 'Tredegar Road',
			townCityName: 'Ebbw Vale',
			postCode: 'NP23 6LP',
		},
		items: [
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
		],
	},
];

// Mock server
const server = setupServer(
	rest.get(routes.get().href, (req, res, ctx) => {
		return res(ctx.json(orders));
	}),
);

// Employ mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Orders page', () => {
	it('gets orders on mount', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<Orders />
			</Provider>,
		);

		// Wait for loading message to appear
		await screen.findByText('Loading orders...');

		// Expect only loading message to be shown
		expect(screen.queryByText('Loading orders...')).toBeInTheDocument();
		expect(screen.queryByText('Failed to load orders')).not.toBeInTheDocument();
		expect(screen.queryByText('No orders')).not.toBeInTheDocument();

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(screen.getByText('Loading orders...'));

		// Expect orders received from server to be shown
		for (const order of orders) {
			expect(
				screen.getByText(new Date(order.createdAt).toLocaleString()),
			).toBeInTheDocument();
		}

		// Expect one details button for each order
		expect(screen.getAllByText('Details').length).toEqual(orders.length);

		// Expect none of these messages to be shown
		expect(screen.queryByText('Loading orders...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to load orders')).not.toBeInTheDocument();
		expect(screen.queryByText('No orders')).not.toBeInTheDocument();
	});

	it("navigates to login page when user isn't authenticated", () => {
		// Create mock store for unauthenticated user
		const unauthenticatedStore = configureStore({
			reducer: {
				auth: authSlice,
				orders: ordersSlice,
			},
		});

		// Create history to track navigation
		const history = createMemoryHistory();

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Provider store={unauthenticatedStore}>
					<Orders />
				</Provider>
			</Router>,
		);

		// Expect redirect to login page with redirect back to orders page
		expect(history.location.pathname).toBe('/login');
		expect(history.location.search).toBe('?redirect=/account/orders');
	});
});
