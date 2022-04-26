import { render, screen } from '@testing-library/react';
import NoMatch from '.';

describe('NoMatch page', () => {
	it('shows the 404 Page Not Found message', () => {
		// Render component
		render(<NoMatch />);

		// Expect 404 Page Not Found message to be shown
		expect(screen.getByText('404 Page Not Found')).toBeInTheDocument();
	});
});
