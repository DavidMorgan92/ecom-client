import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
	login,
	selectAuthPending,
	selectAuthFailed,
} from '../../store/authSlice';

/**
 * Validation schema for login form
 */
const loginSchema = Yup.object().shape({
	// Email is required and must be a valid email address
	email: Yup.string()
		.email('Invalid email address')
		.required('Email address is required'),

	// Password is required
	password: Yup.string().required('Password is required'),
});

/**
 * Login page component
 *
 * Contains the login form and dispatches login thunk to redux store
 */
export default function Login() {
	// Use dispatch to communicate with auth redux store
	const dispatch = useDispatch();

	// Get information about authentication state from auth redux store
	const authPending = useSelector(selectAuthPending);
	const authFailed = useSelector(selectAuthFailed);

	// Use search params to get query string parameters
	const [searchParams] = useSearchParams();

	// Get redirect query string parameter
	const redirectParam = searchParams.get('redirect');

	// Use navigate to go to the redirect URL
	const navigate = useNavigate();

	// Handle login form submission
	function handleSubmit(values) {
		// Dispatch login method from auth redux store
		dispatch(login(values))
			.unwrap()
			.then(() => {
				// Navigate to redirect query parameter or home
				navigate(redirectParam || '/')
			})
			.catch(() => {});
	}

	return (
		<Formik
			initialValues={{ email: '', password: '' }}
			onSubmit={handleSubmit}
			validationSchema={loginSchema}
		>
			{({ errors, touched }) => (
				<Form>
					{/* Email input field */}
					<label htmlFor='email'>Email</label>
					<Field id='email' name='email' type='email' />

					{/* Email input field validation errors */}
					{errors.email && touched.email ? <span>{errors.email}</span> : null}

					{/* Password input field */}
					<label htmlFor='password'>Password</label>
					<Field id='password' name='password' type='password' />

					{/* Password input field validation errors */}
					{errors.password && touched.password ? (
						<span>{errors.password}</span>
					) : null}

					{/* Submit button (disable when authentication is pending) */}
					<input type='submit' value='Submit' disabled={authPending} />

					{/* Display when authentication is pending */}
					{authPending && <p>Logging in...</p>}

					{/* Display when authentication has failed */}
					{authFailed && <p>Failed to login</p>}
				</Form>
			)}
		</Formik>
	);
}
