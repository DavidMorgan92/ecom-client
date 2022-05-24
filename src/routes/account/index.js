import { NavLink, Outlet } from 'react-router-dom';

/**
 * Account page
 * 
 * Responsible for routing to sub pages of the account route
 */
export default function Account() {
	return (
		<>
			{/* Links to sub pages */}
			<nav>
				<NavLink to='/account/details'>Details</NavLink>
				<NavLink to='/account/addresses'>Addresses</NavLink>
				<NavLink to='/account/orders'>Orders</NavLink>
			</nav>

			{/* Render sub page */}
			<Outlet />
		</>
	);
}
