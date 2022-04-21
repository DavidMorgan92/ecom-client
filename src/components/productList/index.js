/**
 * Product list component
 *
 * Displays the list of products passed to it
 */
export default function ProductList({ products }) {
	return (
		<div>
			{products.map(p => {
				return <div key={p.id}>{p.name}</div>;
			})}
		</div>
	);
}
