import { render, screen } from '@testing-library/react';
import Product from '.';
import { formatPrice } from '../../util';

describe('Product component', () => {
	it('renders product information', () => {
		// Product to render
		const product = {
			id: 1,
			name: 'Toothbrush',
			description: 'Bristly',
			pricePennies: '123',
		};

		// Render component
		render(<Product product={product} />);

		// Expect product name to be displayed
		expect(screen.getByText(product.name)).toBeInTheDocument();
		expect(screen.getByText(product.description)).toBeInTheDocument();
		expect(
			screen.getByText(formatPrice(product.pricePennies)),
		).toBeInTheDocument();
	});
});
