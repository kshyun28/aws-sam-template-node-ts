import { BaseError } from './BaseError';

export class InternalServerError extends BaseError {
    public statusCode = 500;

    constructor(public message: string, public data?: any) {
        super(message);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }

    serializeErrors() {
        return { statusCode: this.statusCode, message: this.message, data: this.data };
    }
}
