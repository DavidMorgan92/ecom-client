import { render, screen } from '@testing-library/react';
import ProductList from '.';
import { formatPrice } from '../../util';

describe('ProductList component', () => {
	it('renders the list of products', () => {
		// List of products to render
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

		// Render component
		render(<ProductList products={products} />);

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
