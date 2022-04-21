import { render, screen } from '@testing-library/react';
import ProductList from '.';

describe('ProductList component', () => {
	it('renders the list of products', () => {
		// List of products to render
		const products = [
			{
				id: 1,
				name: 'Toothbrush',
			},
			{
				id: 2,
				name: 'Hairbrush',
			},
		];

		// Render component
		render(<ProductList products={products} />);

		// Expect product names to be displayed
		expect(screen.getByText(products[0].name)).toBeInTheDocument();
		expect(screen.getByText(products[1].name)).toBeInTheDocument();
	});
});
