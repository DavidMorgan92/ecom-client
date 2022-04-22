import Product from '../product';

/**
 * Product list component
 *
 * Displays the list of products passed to it
 */
export default function ProductList({ products }) {
	return (
		<div>
			{products.map(p => (
				<Product key={p.id} product={p} />
			))}
		</div>
	);
}
