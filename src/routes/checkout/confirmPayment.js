import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import AddressPicker from '../../components/addressPicker';
import { createIntent } from '../../services/ecom/stripe';
import { formatPrice } from '../../util';

/**
 * ConfirmPayment page component
 *
 * Second step of the checkout process
 * Allows user to input their payment details to complete the purchase
 */
export default function ConfirmPayment({
	onBackClick,
	pricePennies,
	deliveryAddress,
}) {
	// Store client secret from payment intent in state
	const [clientSecret, setClientSecret] = useState(null);

	// Store transaction state
	const [succeeded, setSucceeded] = useState(false);
	const [error, setError] = useState(null);
	const [processing, setProcessing] = useState(false);
	const [disabled, setDisabled] = useState(false);

	// Store billing address in state
	const [billingAddress, setBillingAddress] = useState(null);

	// Use Stripe
	const stripe = useStripe();
	const elements = useElements();

	// Create payment intent on server and store client secret
	useEffect(() => {
		createIntent(pricePennies).then(setClientSecret);
	}, [pricePennies]);

	// User has chosen to go back to delivery address page
	function handleBackClick() {
		onBackClick();
	}

	// Handle change in card input
	function handleChange(event) {
		// Disable submit button if event is not empty
		setDisabled(event.empty);

		// Show error to user
		setError(event.error ? event.error.message : '');
	}

	// User submitted payment form
	async function handleSubmit(event) {
		// Prevent default form submission action
		event.preventDefault();

		// Require user to choose a billing address
		if (!billingAddress) {
			return;
		}

		// Set processing state
		setProcessing(true);

		// Confirm payment through Stripe
		const payload = await stripe.confirmCardPayment(clientSecret, {
			payment_method: {
				card: elements.getElement(CardElement),
			},
		});

		// If an error occurred
		if (payload.error) {
			// Set error state
			setError(`Payment failed ${payload.error.message}`);
		} else {
			// Clear error state and set succeeded state
			setError(null);
			setSucceeded(true);

			// TODO: Checkout cart on ecom server
		}

		// Clear processing state
		setProcessing(false);
	}

	// User chose a billing address
	function handleAddressChange(address) {
		setBillingAddress(address);
	}

	return (
		<>
			{/* Allow user to pick billing address */}
			<AddressPicker onChange={handleAddressChange} />

			{/* Show address user has chosen for clarity */}
			<h2>Billing to...</h2>
			{billingAddress ? (
				<div data-testid='billing-address'>
					<span>{billingAddress.houseNameNumber}</span>
					<span>{billingAddress.streetName}</span>
					<span>{billingAddress.townCityName}</span>
					<span>{billingAddress.postCode}</span>
				</div>
			) : (
				<p>Please choose a billing address</p>
			)}

			{/* Show total price for user's confirmation */}
			<h2>Confirm Payment</h2>
			<p>Total price: {formatPrice(pricePennies)}</p>

			{/* Credit card form */}
			<form onSubmit={handleSubmit}>
				<CardElement onChange={handleChange} />

				{/* Submit button */}
				<input
					type='submit'
					value='Submit'
					disabled={processing || disabled || succeeded}
				/>

				{/* Show error message */}
				{error && <p>{error}</p>}

				{/* Show success message */}
				{succeeded && <p>Payment complete</p>}
			</form>

			{/* Button to go back to delivery address page */}
			<button onClick={handleBackClick}>Back</button>
		</>
	);
}
