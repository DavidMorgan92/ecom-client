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
