/**
 * ConfirmPayment page component
 * 
 * Second step of the checkout process
 * Allows user to input their payment details to complete the purchase
 */
export default function ConfirmPayment({ onBackClick }) {
	// User has chosen to go back to delivery address page
	function handleBackClick() {
		onBackClick();
	}

	return (
		<>
			<h2>Confirm Payment</h2>

			{/* Button to go back to delivery address page */}
			<button onClick={handleBackClick}>Back</button>
		</>
	);
}
