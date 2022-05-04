import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

/**
 * Validation schema for address form
 */
const addressSchema = Yup.object().shape({
	houseNameNumber: Yup.string()
		.required('House name/number is required')
		.max(20, 'House name/number cannot be more than 20 characters'),

	streetName: Yup.string()
		.required('Street name is required')
		.max(20, 'Street name cannot be more than 20 characters'),

	townCityName: Yup.string()
		.required('Town/city name is required')
		.max(20, 'Town/city name cannot be more than 20 characters'),

	postCode: Yup.string()
		.required('Post code is required')
		.max(20, 'Post code cannot be more than 20 characters'),
});

/**
 * Address form
 *
 * For editing an address
 */
export default function AddressForm({ address, onSubmit, onCancel, disabled }) {
	// Initial empty values for the form
	const initialValues = {
		houseNameNumber: '',
		streetName: '',
		townCityName: '',
		postCode: '',
	};

	// If an address is given then copy its values to the initial values
	if (address) {
		Object.assign(initialValues, address);
	}

	return (
		<Formik
			initialValues={initialValues}
			onSubmit={onSubmit}
			validationSchema={addressSchema}
		>
			{({ errors, touched }) => (
				<Form>
					{/* House name/number input field */}
					<label htmlFor='houseNameNumber'>House name/number</label>
					<Field id='houseNameNumber' name='houseNameNumber' type='text' />

					{/* House name/number input field validation errors */}
					{errors.houseNameNumber && touched.houseNameNumber ? (
						<span>{errors.houseNameNumber}</span>
					) : null}

					{/* Street name input field */}
					<label htmlFor='streetName'>Street name</label>
					<Field id='streetName' name='streetName' type='text' />

					{/* Street name input field validation errors */}
					{errors.streetName && touched.streetName ? (
						<span>{errors.streetName}</span>
					) : null}

					{/* Town/city name input field */}
					<label htmlFor='townCityName'>Town/city name</label>
					<Field id='townCityName' name='townCityName' type='text' />

					{/* Town/city name input field validation errors */}
					{errors.townCityName && touched.townCityName ? (
						<span>{errors.townCityName}</span>
					) : null}

					{/* Post code input field */}
					<label htmlFor='postCode'>Post code</label>
					<Field id='postCode' name='postCode' type='text' />

					{/* Post code input field validation errors */}
					{errors.postCode && touched.postCode ? (
						<span>{errors.postCode}</span>
					) : null}

					{/* Submit button */}
					<input type='submit' value='Submit' disabled={disabled} />

					{/* Cancel button */}
					<button onClick={onCancel} disabled={disabled}>
						Cancel
					</button>
				</Form>
			)}
		</Formik>
	);
}
