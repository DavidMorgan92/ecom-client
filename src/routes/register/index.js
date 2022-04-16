import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
	register,
	selectRegistrationPending,
	selectRegistrationFailed,
} from '../../store/authSlice';

/**
 * Validation schema for registration form
 */
const registerSchema = Yup.object().shape({
	firstName: Yup.string()
		.required('First name is required')
		.max(20, 'First name cannot be more than 20 characters'),

	lastName: Yup.string()
		.required('Last name is required')
		.max(20, 'Last name cannot be more than 20 characters'),

	email: Yup.string()
		.required('Email address is required')
		.email('Invalid email address'),

	password: Yup.string()
		.required('Password is required')
		.min(8, 'Password must be 8 characters or more'),

	confirmPassword: Yup.string()
		.required('Confirm password is required')
		.oneOf([Yup.ref('password')], 'Passwords must match'),
});

/**
 * Register page component
 *
 * Contains the registration form and dispatches register thunk to redux store
 */
export default function Register() {
	// Use dispatch to communicate with auth redux store
	const dispatch = useDispatch();

	// Get information about registration state from auth redux store
	const registrationPending = useSelector(selectRegistrationPending);
	const registrationFailed = useSelector(selectRegistrationFailed);

	// Handle registration form submission
	function handleSubmit(values) {
		// Dispatch register method from auth redux store
		dispatch(register(values));
	}

	return (
		<Formik
			initialValues={{
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				confirmPassword: '',
			}}
			onSubmit={handleSubmit}
			validationSchema={registerSchema}
		>
			{({ errors, touched }) => (
				<Form>
					{/* First name input field */}
					<label htmlFor='firstName'>First name</label>
					<Field id='firstName' name='firstName' type='text' />

					{/* First name input field validation errors */}
					{errors.firstName && touched.firstName ? (
						<span>{errors.firstName}</span>
					) : null}

					{/* Last name input field */}
					<label htmlFor='lastName'>Last name</label>
					<Field id='lastName' name='lastName' type='text' />

					{/* Last name input field validation errors */}
					{errors.lastName && touched.lastName ? (
						<span>{errors.lastName}</span>
					) : null}

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

					{/* Confirm password input field */}
					<label htmlFor='confirmPassword'>Confirm password</label>
					<Field id='confirmPassword' name='confirmPassword' type='password' />

					{/* Confirm password input field validation errors */}
					{errors.confirmPassword && touched.confirmPassword ? (
						<span>{errors.confirmPassword}</span>
					) : null}

					{/* Submit button (disable when registration is pending) */}
					<input type='submit' value='Submit' disabled={registrationPending} />

					{/* Display when registration is pending */}
					{registrationPending && <p>Registering...</p>}

					{/* Display when registration has failed */}
					{registrationFailed && <p>Failed to register</p>}
				</Form>
			)}
		</Formik>
	);
}
