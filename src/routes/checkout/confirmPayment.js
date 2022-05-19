import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import { createIntent } from '../../services/ecom/stripe';
import { formatPrice } from '../../util';

/**
 * ConfirmPayment page component
 *
 * Second step of the checkout process
 * Allows user to input their payment details to complete the purchase
 */
export default function ConfirmPayment({ onBackClick, pricePennies }) {
	// Store client secret from payment intent in state
	const [clientSecret, setClientSecret] = useState(null);

	// Store transaction state
	const [succeeded, setSucceeded] = useState(false);
	const [error, setError] = useState(null);
	const [processing, setProcessing] = useState(false);
	const [disabled, setDisabled] = useState(false);

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
		}

		// Clear processing state
		setProcessing(false);
	}

	return (
		<>
			<h2>Confirm Payment</h2>

			{/* Show total price for user's confirmation */}
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
