import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Search from '.';
import store from '../../store';
import { routes } from '../../services/ecom/products';
import * as productsSlice from '../../store/productsSlice';

// Mock backing store
const categories = ['Clothing', 'Food', 'Health & Beauty'];

// Mock server
const server = setupServer(
	// Return categories from the server
	rest.get(routes.categories().href, (req, res, ctx) => {
		return res(ctx.json(categories));
	}),

	// Return empty products array to suppress warning
	rest.get(routes.get().href, (req, res, ctx) => {
		return res(ctx.json([]));
	}),
);

// Mock the useNavigate function to spy on usage
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
	useNavigate: () => mockNavigate,
}));

// Employ mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Search component', () => {
	it('gets product categories on mount', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Search />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for categories to be loaded from the API
		await waitFor(() => {
			// Expect categories to be displayed in the document
			expect(screen.getByText('All categories')).toBeInTheDocument();
			expect(screen.getByText(categories[0])).toBeInTheDocument();
			expect(screen.getByText(categories[1])).toBeInTheDocument();
			expect(screen.getByText(categories[2])).toBeInTheDocument();

			// Expect 'All categories' to be selected by default
			expect(screen.getByText('All categories').selected).toBe(true);
			expect(screen.getByText(categories[0]).selected).toBe(false);
			expect(screen.getByText(categories[1]).selected).toBe(false);
			expect(screen.getByText(categories[2]).selected).toBe(false);
		});
	});

	it('requests products with search and category parameters on click', () => {
		// Spy on getProducts thunk in productsSlice
		const getProductsSpy = jest.spyOn(productsSlice, 'getProducts');

		// Render component
		render(
			<Provider store={store}>
				<Search />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Input 'brush' into the search text input
		fireEvent.change(screen.getByTestId('search-input'), {
			target: { value: 'brush' },
		});

		// Select 'Health & Beauty' in the categories select input
		fireEvent.change(screen.getByTestId('search-dropdown'), {
			target: { value: 2 },
		});

		// Click the search button
		fireEvent.click(screen.getByTestId('search-button'));

		// Expect the getProducts thunk to have been called with the selected parameters
		expect(getProductsSpy).toHaveBeenCalledTimes(1);
		expect(getProductsSpy).toHaveBeenCalledWith({
			category: 'Health & Beauty',
			name: 'brush',
		});

		// Restore getProducts implementation
		getProductsSpy.mockRestore();
	});

	it('navigates to /products on click', () => {
		// Render component
		render(
			<Provider store={store}>
				<Search />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Click search button
		fireEvent.click(screen.getByTestId('search-button'));

		// Expect navigation to '/products'
		expect(mockNavigate).toHaveBeenCalledTimes(1);
		expect(mockNavigate).toHaveBeenCalledWith('/products');
	});
});
