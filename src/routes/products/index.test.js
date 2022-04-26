import {
	render,
	screen,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Products from '.';
import store from '../../store';
import { routes } from '../../services/ecom/products';
import { formatPrice } from '../../util';
import { MemoryRouter } from 'react-router-dom';

// Mock backing store
const products = [
	{
		id: 1,
		name: 'Toothbrush',
		description: 'Bristly',
		pricePennies: '123',
	},
	{
		id: 2,
		name: 'Hairbrush',
		description: 'For your head',
		pricePennies: '234',
	},
];

// Mock server
const server = setupServer(
	rest.get(routes.get().href, (req, res, ctx) => {
		return res(ctx.json(products));
	}),
);

// Employ mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Products page', () => {
	it('gets product information on mount', async () => {
		// Render component
		render(
			<Provider store={store}>
				<Products />
			</Provider>,
			{ wrapper: MemoryRouter },
		);

		// Wait for get pending message to be shown
		await screen.findByText('Receiving products list...');

		// Wait for get pending message to disappear
		await waitForElementToBeRemoved(
			screen.queryByText('Receiving products list...'),
		);

		// Expect product information to be displayed
		expect(screen.getByText(products[0].name)).toBeInTheDocument();
		expect(screen.getByText(products[0].description)).toBeInTheDocument();
		expect(
			screen.getByText(formatPrice(products[0].pricePennies)),
		).toBeInTheDocument();
		expect(screen.getByText(products[1].name)).toBeInTheDocument();
		expect(screen.getByText(products[1].description)).toBeInTheDocument();
		expect(
			screen.getByText(formatPrice(products[1].pricePennies)),
		).toBeInTheDocument();
	});
});
