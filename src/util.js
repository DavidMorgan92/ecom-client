/**
 * Format the price received from the API into a human-friendly string
 * @param {string} pricePennies The price in pennies as a big int string
 * @returns A formatted price string for display
 */
export function formatPrice(pricePennies) {
	return '£' + (Number(pricePennies) / 100).toFixed(2);
}

/**
 * Get the total price of a set of cart items
 * @param {object[]} items Array of cart items
 * @returns Total price of the items
 */
export function totalPricePennies(items) {
	return items.reduce((accumulator, currentValue) => {
		const pricePennies = Number(currentValue.product.pricePennies);
		return accumulator + pricePennies * currentValue.count;
	}, 0);
}
