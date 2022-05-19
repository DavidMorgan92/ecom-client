import { formatPrice, totalPricePennies } from './util';

describe('formatPrice', () => {
	it('produces the correct string', () => {
		const pricePennies = '1100';
		const result = formatPrice(pricePennies);
		expect(result).toEqual('£11.00');
	});

	it('produces the correct string', () => {
		const pricePennies = '0110';
		const result = formatPrice(pricePennies);
		expect(result).toEqual('£1.10');
	});

	it('produces the correct string', () => {
		const pricePennies = '0';
		const result = formatPrice(pricePennies);
		expect(result).toEqual('£0.00');
	});

	it('produces the correct string', () => {
		const pricePennies = '1234';
		const result = formatPrice(pricePennies);
		expect(result).toEqual('£12.34');
	});
});

describe('totalPricePennies', () => {
	it('produces the correct total', () => {
		const items = [
			{ count: 1, product: { pricePennies: '100' } },
			{ count: 2, product: { pricePennies: '22' } },
			{ count: 1, product: { pricePennies: '011' } },
		];
		const result = totalPricePennies(items);
		expect(result).toEqual(155);
	});
});
