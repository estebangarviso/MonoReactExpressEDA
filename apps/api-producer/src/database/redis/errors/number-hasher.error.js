export class NumberHasherError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NumberHasherError'
  }
}
