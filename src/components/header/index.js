import { Link } from 'react-router-dom';

export default function Header() {
	return (
		<header>
			<h1>
				<Link to='/'>Ecom Client</Link>
			</h1>
			<Link to='/login'>Login</Link>
			<Link to='/register'>Register</Link>
		</header>
	);
}
