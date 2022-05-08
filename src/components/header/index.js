import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	logout,
	selectAuthenticated,
	selectEmail,
} from '../../store/authSlice';
import { getCart, selectCart } from '../../store/cartSlice';
import Search from '../search';

/**
 * Header component
 *
 * Displays the website title/logo and a link group related to authentication actions
 */
export default function Header() {
	// Get information about authentication state from auth redux store
	const authenticated = useSelector(selectAuthenticated);
	const email = useSelector(selectEmail);

	// Get information about the cart
	const cart = useSelector(selectCart);

	// Use dispatch to communicate with auth redux store
	const dispatch = useDispatch();

	// Get cart information if user is authenticated
	useEffect(() => {
		if (authenticated) {
			dispatch(getCart());
		}
	}, [dispatch, authenticated]);

	// Handle logout button click
	function handleLogout() {
		// Dispatch logout method from auth redux store
		dispatch(logout());
	}

	// Content to show when the user is not authenticated
	const unauthenticatedGroup = (
		<>
			{/* Link to login page */}
			<Link to='/login'>Login</Link>

			{/* Link to register page */}
			<Link to='/register'>Register</Link>
		</>
	);

	// Content to show when the user is authenticated
	const authenticatedGroup = (
		<>
			{/* Cart link */}
			<Link to='/cart' data-testid='cart-link'>Cart ({cart.length})</Link>

			{/* Show the authenticated user's email */}
			<Link to='/account' data-testid='account-link'>
				{email}
			</Link>

			{/* Show a logout button */}
			<button onClick={handleLogout}>Logout</button>
		</>
	);

	return (
		<header>
			{/* Header which links to application root page */}
			<h1>
				<Link to='/'>Ecom Client</Link>
			</h1>

			{/* Search component */}
			<Search />

			{/* Show either the authenticatedGroup or unauthenticatedGroup */}
			{authenticated ? authenticatedGroup : unauthenticatedGroup}
		</header>
	);
}
