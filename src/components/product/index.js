import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../util';

/**
 * Product component
 *
 * Displays product information for the ProductList component
 */
export default function Product({ product }) {
	// Use navigate to go to product details page on click
	const navigate = useNavigate();

	// Handle product click
	function handleClick() {
		// Navigate to product details page
		navigate(`/product/${product.id}`);
	}

	return (
		<div onClick={handleClick} data-testid='product-details-container'>
			<div>{product.name}</div>
			<div>{product.description}</div>
			<div>{formatPrice(product.pricePennies)}</div>
		</div>
	);
}
