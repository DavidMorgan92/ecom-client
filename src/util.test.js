import { formatPrice } from './util';

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
