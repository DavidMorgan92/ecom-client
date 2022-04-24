/**
 * Format the price received from the API into a human-friendly string
 * @param {string} pricePennies The price in pennies as a big int string
 * @returns A formatted price string for display
 */
export function formatPrice(pricePennies) {
	return '£' + (Number(pricePennies) / 100).toFixed(2);
}
