import { formatPrice } from '../../util';

/**
 * Product component
 *
 * Displays product information for the ProductList component
 */
export default function Product({ product }) {
	return (
		<>
			<div>{product.name}</div>
			<div>{product.description}</div>
			<div>{formatPrice(product.pricePennies)}</div>
		</>
	);
}
