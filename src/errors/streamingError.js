export class StreamingError extends Error {
  constructor(message, domain) {
    super(message)
    this.domain = domain
  }
}
