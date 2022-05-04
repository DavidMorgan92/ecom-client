import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AddressForm from '.';

describe('AddressForm component', () => {
	it('renders correctly on mount', () => {
		// Render component
		render(<AddressForm />);

		// Expect input fields to exist and have empty values
		expect(screen.getByLabelText('House name/number')).toHaveValue('');
		expect(screen.getByLabelText('Street name')).toHaveValue('');
		expect(screen.getByLabelText('Town/city name')).toHaveValue('');
		expect(screen.getByLabelText('Post code')).toHaveValue('');

		// Expect submit button to exist and not be disabled
		expect(screen.getByDisplayValue('Submit')).toBeEnabled();

		// Expect cancel button to exist
		expect(screen.getByText('Cancel')).toBeInTheDocument();
	});

	it('renders correct values when address prop is given', () => {
		// Address given to AddressForm
		const address = {
			houseNameNumber: 'Pendennis',
			streetName: 'Tredegar Road',
			townCityName: 'Ebbw Vale',
			postCode: 'NP23 6LP',
		};

		// Render component
		render(<AddressForm address={address} />);

		// Expect input fields to exist and have values of address prop
		expect(screen.getByLabelText('House name/number')).toHaveValue(
			address.houseNameNumber,
		);
		expect(screen.getByLabelText('Street name')).toHaveValue(
			address.streetName,
		);
		expect(screen.getByLabelText('Town/city name')).toHaveValue(
			address.townCityName,
		);
		expect(screen.getByLabelText('Post code')).toHaveValue(address.postCode);

		// Expect submit button to exist and not be disabled
		expect(screen.getByDisplayValue('Submit')).toBeEnabled();

		// Expect cancel button to exist
		expect(screen.getByText('Cancel')).toBeInTheDocument();
	});

	it('disables submit and cancel buttons when disabled prop is set', () => {
		// Render component
		render(<AddressForm disabled={true} />);

		// Expect submit and cancel buttons to exist and be disabled
		expect(screen.getByDisplayValue('Submit')).toBeDisabled();
		expect(screen.getByText('Cancel')).toBeDisabled();
	});

	it('calls onSubmit prop when submit is clicked', () => {
		// Mock submit function
		const handleSubmit = jest.fn();

		// Render component
		render(<AddressForm onSubmit={handleSubmit} />);

		// Input values into the form
		fireEvent.change(screen.getByLabelText('House name/number'), {
			target: { value: 'Pendennis' },
		});
		fireEvent.change(screen.getByLabelText('Street name'), {
			target: { value: 'Tredegar Road' },
		});
		fireEvent.change(screen.getByLabelText('Town/city name'), {
			target: { value: 'Ebbw Vale' },
		});
		fireEvent.change(screen.getByLabelText('Post code'), {
			target: { value: 'NP23 6LP' },
		});

		// Click the submit button
		fireEvent.click(screen.getByDisplayValue('Submit'));

		// Wait for submit event to complete
		waitFor(() => {
			// Expect handleSubmit to have been called once
			expect(handleSubmit).toHaveBeenCalledTimes(1);

			// Expect handleSubmit to have been passed the form's values
			expect(handleSubmit).toHaveBeenCalledWith({
				houseNameNumber: 'Pendennis',
				streetName: 'Tredegar Road',
				townCityName: 'Ebbw Vale',
				postCode: 'NP23 6LP',
			});
		});
	});

	it('calls onCancel prop when cancel is clicked', () => {
		// Mock cancel function
		const handleCancel = jest.fn();

		// Render component
		render(<AddressForm onCancel={handleCancel} />);

		// Click the cancel button
		fireEvent.click(screen.getByText('Cancel'));

		// Expect handleCancel to have been called once
		expect(handleCancel).toHaveBeenCalledTimes(1);
	});
});
