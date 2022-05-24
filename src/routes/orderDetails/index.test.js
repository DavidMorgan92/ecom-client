import {
	fireEvent,
	render,
	screen,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import OrderDetails from '.';
import authSlice from '../../store/authSlice';
import ordersSlice from '../../store/ordersSlice';
import { routes } from '../../services/ecom/orders';

// Mock redux orders set
const orders = [
	{
		id: 1,
		createdAt: '2004-10-20T09:23:54.000Z',
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
			orders,
		},
	},
});

// Mock server
const server = setupServer(
	rest.get(routes.getOne(2).href, (req, res, ctx) => {
		return res(
			ctx.json({
				id: 2,
				createdAt: '2004-10-19T09:23:54.000Z',
				address: {
					id: 1,
					houseNameNumber: '3 Josiah Court',
					streetName: 'Upper Union Street',
					townCityName: 'Merthyr Tydfil',
					postCode: 'CF48 3LE',
				},
				items: [
					{
						count: 10,
						product: {
							id: 1,
							name: 'Hairbrush',
							description: 'For your head',
							category: 'Health & Beauty',
							pricePennies: '321',
							stock: 32,
						},
					},
				],
			}),
		);
	}),

	rest.get(routes.getOne(3).href, (req, res, ctx) => {
		return res(ctx.status(404));
	}),
);

// Employ mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('OrderDetails page', () => {
	it('renders order details if it exists in the redux store', () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<MemoryRouter initialEntries={['/account/order/1']}>
					<Routes>
						<Route path='/account/order/:orderId' element={<OrderDetails />} />
					</Routes>
				</MemoryRouter>
			</Provider>,
		);

		// Expect order details to be shown
		expect(
			screen.getByText(new Date(orders[0].createdAt).toLocaleString()),
		).toBeInTheDocument();
		expect(
			screen.getByText(orders[0].address.houseNameNumber),
		).toBeInTheDocument();
		expect(screen.getByText(orders[0].address.streetName)).toBeInTheDocument();
		expect(
			screen.getByText(orders[0].address.townCityName),
		).toBeInTheDocument();
		expect(screen.getByText(orders[0].address.postCode)).toBeInTheDocument();

		// Expect order items to be shown
		for (const item of orders[0].items) {
			expect(screen.getByText(item.product.name)).toBeInTheDocument();
			expect(screen.getByText(`x${item.count}`)).toBeInTheDocument();
		}
	});

	it('requests an order from the API if it does not exist in the redux store', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<MemoryRouter initialEntries={['/account/order/2']}>
					<Routes>
						<Route path='/account/order/:orderId' element={<OrderDetails />} />
					</Routes>
				</MemoryRouter>
			</Provider>,
		);

		// Expect loading message to be shown
		expect(
			screen.getByText('Loading order information...'),
		).toBeInTheDocument();

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(
			screen.queryByText('Loading order information...'),
		);

		// Expect order details to be shown
		expect(
			screen.getByText(new Date('2004-10-19T09:23:54.000Z').toLocaleString()),
		).toBeInTheDocument();
		expect(screen.getByText('3 Josiah Court')).toBeInTheDocument();
		expect(screen.getByText('Upper Union Street')).toBeInTheDocument();
		expect(screen.getByText('Merthyr Tydfil')).toBeInTheDocument();
		expect(screen.getByText('CF48 3LE')).toBeInTheDocument();

		// Expect order items to be shown
		expect(screen.getByText('Hairbrush')).toBeInTheDocument();
		expect(screen.getByText('x10')).toBeInTheDocument();
	});

	it('shows no match page if request for order fails', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<MemoryRouter initialEntries={['/account/order/3']}>
					<Routes>
						<Route path='/account/order/:orderId' element={<OrderDetails />} />
					</Routes>
				</MemoryRouter>
			</Provider>,
		);

		// Expect loading message to be shown
		expect(
			screen.getByText('Loading order information...'),
		).toBeInTheDocument();

		// Wait for loading message to disappear
		await waitForElementToBeRemoved(
			screen.queryByText('Loading order information...'),
		);

		// Expect the 404 Page Not Found of the NoMatch component to be shown
		expect(screen.getByText('404 Page Not Found')).toBeInTheDocument();
	});

	it('goes to /account/orders when go back button is clicked', async () => {
		// Create history to track navigation
		const history = createMemoryHistory({
			initialEntries: ['/account/order/1'],
		});

		// Render component
		render(
			<Provider store={mockStore}>
				<Router navigator={history} location={history.location}>
					<Routes>
						<Route path='/account/order/:orderId' element={<OrderDetails />} />
					</Routes>
				</Router>
			</Provider>,
		);

		// Click the go back button
		fireEvent.click(screen.getByText('Go back'));

		// Expect navigation to /account/orders
		expect(history.location.pathname).toEqual('/account/orders');
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
		const history = createMemoryHistory({
			initialEntries: ['/account/order/1'],
		});

		// Render component
		render(
			<Provider store={unauthenticatedStore}>
				<Router navigator={history} location={history.location}>
					<Routes>
						<Route path='/account/order/:orderId' element={<OrderDetails />} />
					</Routes>
				</Router>
			</Provider>,
		);

		// Expect redirect to login page with redirect back to orders page
		expect(history.location.pathname).toBe('/login');
		expect(history.location.search).toBe('?redirect=/account/order/1');
	});
});
