import { browser } from '$app/environment'
import '$lib/i18n' // Import to initialize. Important :)
import { locale, waitLocale } from 'svelte-i18n'

export const load = async () => {
  if (browser) {
    locale.set(window.navigator.language)
  }
  await waitLocale()
}
