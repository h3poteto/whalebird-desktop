export const prerender = 'auto'

export function load({ params }: { params: any }) {
  return {
    id: params.account_id
  }
}
