import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
	logout,
	selectAuthenticated,
	selectEmail,
} from '../../store/authSlice';

/**
 * Header component
 *
 * Displays the website title/logo and a link group related to authentication actions
 */
export default function Header() {
	// Get information about authentication state from auth redux store
	const authenticated = useSelector(selectAuthenticated);
	const email = useSelector(selectEmail);

	// Use dispatch to communicate with auth redux store
	const dispatch = useDispatch();

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
			{/* Show the authenticated user's email */}
			<span>{email}</span>

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

			{/* Show either the authenticatedGroup or unauthenticatedGroup */}
			{authenticated ? authenticatedGroup : unauthenticatedGroup}
		</header>
	);
}
