export class WrapperError extends Error {
	constructor(message = 'Must wrap components in a Wrapper component') {
		super(message);
		this.name = 'WrapperError';
	}
}
