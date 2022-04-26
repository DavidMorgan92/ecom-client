import {
	render,
	screen,
	waitFor,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductDetails from '.';
import productsSlice from '../../store/productsSlice';
import { formatPrice } from '../../util';
import { routes } from '../../services/ecom/products';

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
		products: productsSlice,
	},
	preloadedState: {
		products: {
			products,
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
});
