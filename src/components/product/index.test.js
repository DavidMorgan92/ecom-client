import { render, screen } from "@testing-library/react";
import Product from ".";

describe('Product component', () => {
	it('renders product information', () => {
		// Product to render
		const product = { id: 1, name: 'Toothbrush' };

		// Render component
		render(<Product product={product} />);

		// Expect product name to be displayed
		expect(screen.getByText(product.name)).toBeInTheDocument();
	});
});
