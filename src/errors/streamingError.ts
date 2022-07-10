export class StreamingError extends Error {
  constructor(message: string, domain: string) {
    const cause = new Error(domain)
    super(message, { cause: cause })
  }
}
