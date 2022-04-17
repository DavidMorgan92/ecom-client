import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
	getAccountInfo,
	selectGetPending,
	selectGetFailed,
	updateAccountInfo,
	selectUpdatePending,
	selectUpdateFailed,
} from '../../store/accountSlice';
import { selectAuthenticated } from '../../store/authSlice';

/**
 * Validation schema for account details form
 */
const accountSchema = Yup.object().shape({
	firstName: Yup.string()
		.required('First name is required')
		.max(20, 'First name cannot be more than 20 characters'),

	lastName: Yup.string()
		.required('Last name is required')
		.max(20, 'Last name cannot be more than 20 characters'),
});

/**
 * Account details page
 *
 * Contains a form for updating the user's account details
 */
export default function Account() {
	// Use dispatch to communicate with account redux store
	const dispatch = useDispatch();

	// Get information about account information update state from account redux store
	const getPending = useSelector(selectGetPending);
	const getFailed = useSelector(selectGetFailed);
	const updatePending = useSelector(selectUpdatePending);
	const updateFailed = useSelector(selectUpdateFailed);

	// Get information about auth state from auth redux store
	const authenticated = useSelector(selectAuthenticated);

	// Handle update form submission
	function handleSubmit(values) {
		// Dispatch updateAccount method from account redux store
		dispatch(updateAccountInfo(values));
	}

	// Store form's initial values here. Form will re-initialize when they change.
	const initialValues = useRef({ firstName: '', lastName: '' });

	// TODO: Stop this happening twice
	// Get account information on mount
	useEffect(() => {
		if (!authenticated) {
			return;
		}

		dispatch(getAccountInfo())
			.unwrap()
			.then(payload => {
				// Assign values gotten from API to the input fields
				initialValues.current = payload.accountInfo;
			})
			.catch(() => {
				// If get request failed, blank out input fields
				initialValues.current = { firstName: '', lastName: '' };
			});
	}, [dispatch, authenticated]);

	// If user isn't authenticated on mount then redirect to login with redirect back to this page
	if (!authenticated) {
		return <Navigate to='/login?redirect=/account' replace />;
	}

	return (
		<Formik
			initialValues={initialValues.current}
			onSubmit={handleSubmit}
			validationSchema={accountSchema}
			enableReinitialize={true}
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

					{/* Submit button (disable when get or update is pending) */}
					<input
						type='submit'
						value='Submit'
						disabled={getPending || updatePending}
					/>

					{/* Display when get is pending */}
					{getPending && <p>Loading account information...</p>}

					{/* Display when get has failed */}
					{getFailed && <p>Failed to get account information</p>}

					{/* Display when update is pending */}
					{updatePending && <p>Updating...</p>}

					{/* Display when update has failed */}
					{updateFailed && <p>Failed to update</p>}
				</Form>
			)}
		</Formik>
	);
}
