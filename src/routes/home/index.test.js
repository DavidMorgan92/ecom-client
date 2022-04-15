import { render, screen } from '@testing-library/react';
import Home from '.';

describe('Home page', () => {
	it('renders correctly', () => {
		// Render component
		render(
			<Home />
		);

		// Expect welcome message to be shown
		expect(screen.queryByText('Welcome to ecom client')).toBeInTheDocument();
	});
});
