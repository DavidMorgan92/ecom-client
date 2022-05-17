import {
	fireEvent,
	render,
	screen,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { configureStore } from '@reduxjs/toolkit';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Cart from '.';
import { routes } from '../../services/ecom/cart';
import authSlice from '../../store/authSlice';
import * as cartSlice from '../../store/cartSlice';

// Mock redux store for an authenticated user
const mockStore = configureStore({
	reducer: {
		auth: authSlice,
		cart: cartSlice.default,
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
		cart: {
			getCartPending: false,
			getCartFailed: false,
			updateCartPending: false,
			updateCartFailed: false,
			checkoutCartPending: false,
			checkoutCartFailed: false,
			cart: [],
		},
	},
});

// Mock backing store
const cart = {
	items: [
		{
			count: 1,
			product: {
				id: 1,
				name: 'Toothbrush',
				description: 'Bristly',
				category: 'Health & Beauty',
				pricePennies: '123',
				stockCount: 23,
			},
		},
		{
			count: 2,
			product: {
				id: 2,
				name: 'Hairbrush',
				description: 'For your head',
				category: 'Health & Beauty',
				pricePennies: '234',
				stockCount: 12,
			},
		},
	],
};

// Mock server
const server = setupServer(
	rest.get(routes.cart().href, (req, res, ctx) => {
		return res(ctx.json(cart));
	}),

	rest.put(routes.cart().href, (req, res, ctx) => {
		return res(ctx.json(cart));
	}),

	rest.post(routes.checkout().href, (req, res, ctx) => {
		return res(ctx.json({ orderId: 1 }));
	}),
);

// Employ mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Cart page', () => {
	it('gets cart on mount', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<Cart />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to be shown
		await screen.findByText('Loading cart...');

		// Expect only get pending message to be shown
		expect(screen.queryByText('Loading cart...')).toBeInTheDocument();
		expect(screen.queryByText('Failed to get cart')).not.toBeInTheDocument();
		expect(screen.queryByText('Cart is empty')).not.toBeInTheDocument();
		expect(screen.queryByText('Updating cart...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();

		// Expect cart items list to be shown
		expect(screen.getByTestId('cart-list')).toBeInTheDocument();

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(screen.getByText('Loading cart...'));

		// Expect cart items received from server to be shown
		for (const item of cart.items) {
			expect(screen.getByText(item.product.name)).toBeInTheDocument();
		}

		// Expect a count input and remove button for each item
		expect(screen.getAllByTestId('item-count').length).toEqual(
			cart.items.length,
		);
		expect(screen.getAllByText('Remove').length).toEqual(cart.items.length);

		// Expect none of these messages to be shown
		expect(screen.queryByText('Loading cart...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to get cart')).not.toBeInTheDocument();
		expect(screen.queryByText('Cart is empty')).not.toBeInTheDocument();
		expect(screen.queryByText('Updating cart...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();

		// Expect checkout button to be enabled
		expect(screen.getByText('Checkout')).toBeEnabled();
	});

	it('shows empty cart message when no items are returned from the API', async () => {
		// Cause request to return empty cart
		server.use(
			rest.get(routes.cart().href, (req, res, ctx) => {
				return res(ctx.json({ items: [] }));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<Cart />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(screen.getByText('Loading cart...'));

		// Expect empty cart message to be shown
		expect(screen.getByText('Cart is empty')).toBeInTheDocument();

		// Expect no count inputs or remove buttons to be shown
		expect(screen.queryByTestId('item-count')).not.toBeInTheDocument();
		expect(screen.queryByText('Remove')).not.toBeInTheDocument();

		// Expect none of these messages to be shown
		expect(screen.queryByText('Loading cart...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to get cart')).not.toBeInTheDocument();
		expect(screen.queryByText('Updating cart...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();

		// Expect checkout button to be disabled
		expect(screen.getByText('Checkout')).toBeDisabled();
	});

	it('shows error message when get fails', async () => {
		// Cause request to fail with 500
		server.use(
			rest.get(routes.cart().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<Cart />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(screen.getByText('Loading cart...'));

		// Expect failed to get cart message to be shown
		expect(screen.getByText('Failed to get cart')).toBeInTheDocument();

		// Expect none of these messages to be shown
		expect(screen.queryByText('Loading cart...')).not.toBeInTheDocument();
		expect(screen.queryByText('Updating cart...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();

		// Expect checkout button to be disabled
		expect(screen.getByText('Checkout')).toBeDisabled();
	});

	it('dispatches updateCart when item is removed', async () => {
		// Spy on updateCart thunk in cartSlice
		const updateCartSpy = jest.spyOn(cartSlice, 'updateCart');

		// Render component
		render(
			<Provider store={mockStore}>
				<Cart />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(screen.getByText('Loading cart...'));

		// Click the first remove button
		fireEvent.click(screen.getAllByText('Remove')[0]);

		// Expect updating cart message to be shown
		expect(await screen.findByText('Updating cart...')).toBeInTheDocument();

		// Wait for updating cart message to disappear
		await waitForElementToBeRemoved(screen.getByText('Updating cart...'));

		// Expect none of these messages to be shown
		expect(screen.queryByText('Loading cart...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to get cart')).not.toBeInTheDocument();
		expect(screen.queryByText('Cart is empty')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();

		// Expect updateCart to have been called without the first cart item
		expect(updateCartSpy).toHaveBeenCalledTimes(1);
		expect(updateCartSpy).toHaveBeenCalledWith([
			{
				count: 2,
				product: {
					id: 2,
					name: 'Hairbrush',
					description: 'For your head',
					category: 'Health & Beauty',
					pricePennies: '234',
					stockCount: 12,
				},
			},
		]);

		// Restore updateCart's implementation
		updateCartSpy.mockRestore();
	});

	it('shows failed to update message when item fails to remove', async () => {
		// Cause request to fail with 500
		server.use(
			rest.put(routes.cart().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<Cart />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(screen.getByText('Loading cart...'));

		// Click the first remove button
		fireEvent.click(screen.getAllByText('Remove')[0]);

		// Expect updating cart message to be shown
		expect(await screen.findByText('Updating cart...')).toBeInTheDocument();

		// Wait for updating cart message to disappear
		await waitForElementToBeRemoved(screen.getByText('Updating cart...'));

		// Expect failed to update message to be shown
		expect(screen.queryByText('Failed to update')).toBeInTheDocument();

		// Expect none of these messages to be shown
		expect(screen.queryByText('Failed to get cart')).not.toBeInTheDocument();
		expect(screen.queryByText('Loading cart...')).not.toBeInTheDocument();
		expect(screen.queryByText('Cart is empty')).not.toBeInTheDocument();
	});

	it('dispatches updateCart when item count is changed', async () => {
		// Spy on updateCart thunk in cartSlice
		const updateCartSpy = jest.spyOn(cartSlice, 'updateCart');

		// Render component
		render(
			<Provider store={mockStore}>
				<Cart />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(screen.getByText('Loading cart...'));

		// Click the first remove button
		fireEvent.change(screen.getAllByTestId('item-count')[0], {
			target: { value: 2 },
		});

		// Expect updating cart message to be shown
		expect(await screen.findByText('Updating cart...')).toBeInTheDocument();

		// Wait for updating cart message to disappear
		await waitForElementToBeRemoved(screen.getByText('Updating cart...'));

		// Expect none of these messages to be shown
		expect(screen.queryByText('Loading cart...')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to get cart')).not.toBeInTheDocument();
		expect(screen.queryByText('Cart is empty')).not.toBeInTheDocument();
		expect(screen.queryByText('Failed to update')).not.toBeInTheDocument();

		// Expect updateCart to have been called without the first cart item
		expect(updateCartSpy).toHaveBeenCalledTimes(1);
		expect(updateCartSpy).toHaveBeenCalledWith([
			{
				count: 2,
				product: {
					id: 1,
					name: 'Toothbrush',
					description: 'Bristly',
					category: 'Health & Beauty',
					pricePennies: '123',
					stockCount: 23,
				},
			},
			{
				count: 2,
				product: {
					id: 2,
					name: 'Hairbrush',
					description: 'For your head',
					category: 'Health & Beauty',
					pricePennies: '234',
					stockCount: 12,
				},
			},
		]);

		// Restore updateCart's implementation
		updateCartSpy.mockRestore();
	});

	it('shows failed to update message when item count fails to change', async () => {
		// Cause request to fail with 500
		server.use(
			rest.put(routes.cart().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<Cart />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(screen.getByText('Loading cart...'));

		// Click the first remove button
		fireEvent.change(screen.getAllByTestId('item-count')[0], {
			target: { value: 2 },
		});

		// Expect updating cart message to be shown
		expect(await screen.findByText('Updating cart...')).toBeInTheDocument();

		// Wait for updating cart message to disappear
		await waitForElementToBeRemoved(screen.getByText('Updating cart...'));

		// Expect failed to update message to be shown
		expect(screen.queryByText('Failed to update')).toBeInTheDocument();

		// Expect none of these messages to be shown
		expect(screen.queryByText('Failed to get cart')).not.toBeInTheDocument();
		expect(screen.queryByText('Loading cart...')).not.toBeInTheDocument();
		expect(screen.queryByText('Cart is empty')).not.toBeInTheDocument();
	});

	it('navigates to checkout when checkout is clicked', async () => {
		// Create history to track navigation
		const history = createMemoryHistory();

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Provider store={mockStore}>
					<Cart />
				</Provider>
			</Router>,
		);

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(screen.getByText('Loading cart...'));

		// Click the checkout button
		fireEvent.click(screen.getByText('Checkout'));

		// Expect navigation to checkout page
		expect(history.location.pathname).toBe('/checkout');
	});

	it("navigates to login page when user isn't authenticated", () => {
		// Create mock store for unauthenticated user
		const unauthenticatedStore = configureStore({
			reducer: {
				auth: authSlice,
				cart: cartSlice.default,
			},
		});

		// Create history to track navigation
		const history = createMemoryHistory();

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Provider store={unauthenticatedStore}>
					<Cart />
				</Provider>
			</Router>,
		);

		// Expect redirect to login page with redirect back to addresses page
		expect(history.location.pathname).toBe('/login');
		expect(history.location.search).toBe('?redirect=/cart');
	});
});
