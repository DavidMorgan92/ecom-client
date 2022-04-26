import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { MemoryRouter, Router } from 'react-router-dom';
import Product from '.';
import { formatPrice } from '../../util';

// Product to render
const product = {
	id: 1,
	name: 'Toothbrush',
	description: 'Bristly',
	pricePennies: '123',
};

describe('Product component', () => {
	it('renders product information', () => {
		// Render component
		render(<Product product={product} />, { wrapper: MemoryRouter });

		// Expect product name to be displayed
		expect(screen.getByText(product.name)).toBeInTheDocument();
		expect(screen.getByText(product.description)).toBeInTheDocument();
		expect(
			screen.getByText(formatPrice(product.pricePennies)),
		).toBeInTheDocument();
	});

	it('navigates to product details page on click', () => {
		const history = createMemoryHistory();

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Product product={product} />
			</Router>,
		);

		// Click the product details container
		fireEvent.click(screen.getByTestId('product-details-container'));

		// Expect navigation to product details page
		expect(history.location.pathname).toEqual('/product/1');
	});
});
