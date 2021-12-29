type Account = {
  username: string
  acct: string
  url: string
}

export declare function findLink(target: HTMLElement | null, parentClass?: string): string | null

export declare function findTag(target: HTMLElement | null, parentClass?: string): string | null

export declare function parseTag(tagURL: string): string

export declare function findAccount(target: HTMLElement | null, parentClass?: string): Account | null

export declare function parseMastodonAccount(accountURL: string): Account

export declare function parsePleromaAccount(accountURL: string): Account
