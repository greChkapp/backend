
export default class ValidationError extends Error {
  readonly message: string;
  readonly type:string;
  constructor({ message }) {
    super(message);

    this.message = message;
    this.type = 'CUSTOM_ERROR';
  }
}
