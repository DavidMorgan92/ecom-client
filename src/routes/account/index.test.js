import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import Account from '.';

describe('Account page', () => {
	it('navigates to /account/details when details link is clicked', () => {
		// Create history to track navigation
		const history = createMemoryHistory();

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Account />
			</Router>,
		);

		// Click the Details link
		fireEvent.click(screen.getByText('Details'));

		// Expect navigation to /account/details
		expect(history.location.pathname).toBe('/account/details');
	});

	it('navigates to /account/addresses when addresses link is clicked', () => {
		// Create history to track navigation
		const history = createMemoryHistory();

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Account />
			</Router>,
		);

		// Click the Addresses link
		fireEvent.click(screen.getByText('Addresses'));

		// Expect navigation to /account/addresses
		expect(history.location.pathname).toBe('/account/addresses');
	});

	it('navigates to /account/orders when orders link is clicked', () => {
		// Create history to track navigation
		const history = createMemoryHistory();

		// Render component
		render(
			<Router navigator={history} location={history.location}>
				<Account />
			</Router>,
		);

		// Click the Orders link
		fireEvent.click(screen.getByText('Orders'));

		// Expect navigation to /account/orders
		expect(history.location.pathname).toBe('/account/orders');
	});
});
