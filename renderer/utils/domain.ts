export const domainFromAcct = (acct: string): string | null => {
  const [_account, server] = acct.split('@')
  if (server) {
    return server
  }
  return null
}
