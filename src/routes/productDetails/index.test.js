import {
	fireEvent,
	render,
	screen,
	waitFor,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route, Router } from 'react-router-dom';
import ProductDetails from '.';
import productsSlice from '../../store/productsSlice';
import * as cartSlice from '../../store/cartSlice';
import { formatPrice } from '../../util';
import { routes } from '../../services/ecom/products';
import { routes as cartRoutes } from '../../services/ecom/cart';
import authSlice from '../../store/authSlice';
import { createMemoryHistory } from 'history';

// Mock redux products set
const products = [
	{
		id: 1,
		name: 'Toothbrush',
		description: 'Bristly',
		pricePennies: '123',
	},
];

// Mock redux store
const mockStore = configureStore({
	reducer: {
		auth: authSlice,
		products: productsSlice,
		cart: cartSlice.default,
	},
	preloadedState: {
		auth: {
			authenticated: true,
			email: 'david.morgan@gmail.com',
		},
		products: {
			products,
		},
		cart: {
			cart: [],
		},
	},
});

// Mock server
const server = setupServer(
	// Mock return of a single product
	rest.get(routes.getOne(2).href, (req, res, ctx) => {
		return res(
			ctx.json({
				id: 2,
				name: 'Hairbrush',
				description: 'For your head',
				pricePennies: '234',
			}),
		);
	}),

	// Mock return of a nonexisting product
	rest.get(routes.getOne(3).href, (req, res, ctx) => {
		return res(ctx.status(404));
	}),

	// Mock adding an item to the cart
	rest.put(cartRoutes.cart().href, (req, res, ctx) => {
		return res(
			ctx.json({
				items: [
					{
						count: 1,
						product: {
							id: 1,
							name: 'Toothbrush',
							description: 'Bristly',
							pricePennies: '123',
						},
					},
				],
			}),
		);
	}),
);

// Employ mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ProductDetails page', () => {
	it('renders product details if it exists in the redux store', () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<MemoryRouter initialEntries={['/product/1']}>
					<Routes>
						<Route path='/product/:productId' element={<ProductDetails />} />
					</Routes>
				</MemoryRouter>
			</Provider>,
		);

		// Expect product details to be shown
		expect(screen.getByText(products[0].name)).toBeInTheDocument();
		expect(screen.getByText(products[0].description)).toBeInTheDocument();
		expect(
			screen.getByText(formatPrice(products[0].pricePennies)),
		).toBeInTheDocument();

		// Expect add to cart button to be shown
		expect(screen.getByText('Add to Cart')).toBeInTheDocument();

		// Expect none of these messages to be shown
		expect(
			screen.queryByText('Adding item to cart...'),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText('Failed to add item to cart'),
		).not.toBeInTheDocument();
	});

	it('requests a product from the API if it does not exist in the redux store', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<MemoryRouter initialEntries={['/product/2']}>
					<Routes>
						<Route path='/product/:productId' element={<ProductDetails />} />
					</Routes>
				</MemoryRouter>
			</Provider>,
		);

		// Expect loading message to be shown
		expect(
			screen.getByText('Loading product information...'),
		).toBeInTheDocument();

		// Wait for loading message to disappear
		await waitFor(() => {
			expect(
				screen.queryByText('Loading product information...'),
			).not.toBeInTheDocument();
		});

		// Expect product details to be shown
		expect(screen.getByText('Hairbrush')).toBeInTheDocument();
		expect(screen.getByText('For your head')).toBeInTheDocument();
		expect(screen.getByText('£2.34')).toBeInTheDocument();
	});

	it('shows no match page if request for product fails', async () => {
		// Render component
		render(
			<Provider store={mockStore}>
				<MemoryRouter initialEntries={['/product/3']}>
					<Routes>
						<Route path='/product/:productId' element={<ProductDetails />} />
					</Routes>
				</MemoryRouter>
			</Provider>,
		);

		// Expect loading message to be shown
		expect(
			screen.getByText('Loading product information...'),
		).toBeInTheDocument();

		// Wait for loading message to disappear
		await waitFor(() => {
			expect(
				screen.queryByText('Loading product information...'),
			).not.toBeInTheDocument();
		});

		// Expect the 404 Page Not Found of the NoMatch component to be shown
		expect(screen.getByText('404 Page Not Found')).toBeInTheDocument();
	});

	it('dispatches updateCart thunk when add to cart is clicked', async () => {
		// Spy on updateCart thunk
		const updateCartSpy = jest.spyOn(cartSlice, 'updateCart');

		// Render component
		render(
			<Provider store={mockStore}>
				<MemoryRouter initialEntries={['/product/1']}>
					<Routes>
						<Route path='/product/:productId' element={<ProductDetails />} />
					</Routes>
				</MemoryRouter>
			</Provider>,
		);

		// Wait for loading message to disappear
		await waitFor(() => {
			expect(
				screen.queryByText('Loading product information...'),
			).not.toBeInTheDocument();
		});

		// Click add to cart button
		fireEvent.click(screen.getByText('Add to Cart'));

		// Expect update pending message to be shown
		expect(
			await screen.findByText('Adding item to cart...'),
		).toBeInTheDocument();

		// Expect failed to update message not to be shown
		expect(
			screen.queryByText('Failed to add item to cart'),
		).not.toBeInTheDocument();

		// Expect add to cart button to be disabled
		expect(screen.getByText('Add to Cart')).toBeDisabled();

		// Wait for update pending message to disappear
		await waitForElementToBeRemoved(screen.getByText('Adding item to cart...'));

		// Expect none of these messages to be shown
		expect(
			screen.queryByText('Adding item to cart...'),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText('Failed to add item to cart'),
		).not.toBeInTheDocument();

		// Expect add to cart button to be enabled
		expect(screen.getByText('Add to Cart')).toBeEnabled();

		// Expect update cart to have been called with a list with the additional product
		expect(updateCartSpy).toHaveBeenCalledTimes(1);
		expect(updateCartSpy).toHaveBeenCalledWith([
			{
				count: 1,
				product: {
					id: 1,
					name: 'Toothbrush',
					description: 'Bristly',
					pricePennies: '123',
				},
			},
		]);

		// Restore updateCart implementation
		updateCartSpy.mockRestore();
	});

	it('shows failed to update message when add to cart fails', async () => {
		// Cause request to fail with 500
		server.use(
			rest.put(cartRoutes.cart().href, (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		// Render component
		render(
			<Provider store={mockStore}>
				<MemoryRouter initialEntries={['/product/1']}>
					<Routes>
						<Route path='/product/:productId' element={<ProductDetails />} />
					</Routes>
				</MemoryRouter>
			</Provider>,
		);

		// Wait for loading message to disappear
		await waitFor(() => {
			expect(
				screen.queryByText('Loading product information...'),
			).not.toBeInTheDocument();
		});

		// Click add to cart button
		fireEvent.click(screen.getByText('Add to Cart'));

		// Expect update pending message to be shown
		expect(
			await screen.findByText('Adding item to cart...'),
		).toBeInTheDocument();

		// Expect failed to update message not to be shown
		expect(
			screen.queryByText('Failed to add item to cart'),
		).not.toBeInTheDocument();

		// Expect add to cart button to be disabled
		expect(screen.getByText('Add to Cart')).toBeDisabled();

		// Wait for update pending message to disappear
		await waitForElementToBeRemoved(screen.getByText('Adding item to cart...'));

		// Expect update failed message to be shown
		expect(
			screen.queryByText('Failed to add item to cart'),
		).toBeInTheDocument();

		// Expect add to cart button to be enabled
		expect(screen.getByText('Add to Cart')).toBeEnabled();
	});

	it('navigates to login page on add to cart if user is not authenticated', async () => {
		// Mock store for an unauthenticated user
		const unauthenticatedStore = configureStore({
			reducer: {
				auth: authSlice,
				products: productsSlice,
				cart: cartSlice.default,
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
				products: {
					products,
				},
				cart: {
					cart: [],
				},
			},
		});

		// Create history to track navigation
		const history = createMemoryHistory({ initialEntries: ['/product/1'] });

		// Render component
		render(
			<Provider store={unauthenticatedStore}>
				<Router navigator={history} location={history.location}>
					<Routes>
						<Route path='/product/:productId' element={<ProductDetails />} />
					</Routes>
				</Router>
			</Provider>,
		);

		// Wait for loading message to disappear
		await waitFor(() => {
			expect(
				screen.queryByText('Loading product information...'),
			).not.toBeInTheDocument();
		});

		// Click add to cart button
		fireEvent.click(screen.getByText('Add to Cart'));

		// Expect redirect to login page with redirect back to product page
		expect(history.location.pathname).toBe('/login');
		expect(history.location.search).toBe('?redirect=/product/1');
	});
});
