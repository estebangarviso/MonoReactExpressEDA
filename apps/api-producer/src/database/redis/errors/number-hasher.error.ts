export class NumberHasherError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NumberHasherError'
  }
}
