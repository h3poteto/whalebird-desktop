// This code is to resolve errors on tootParser.spec.
// TextEncoder and TextDecoder are used in jsdom, but these object is defined in Browser js.
import { TextEncoder, TextDecoder } from 'util'
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  ;(global.TextDecoder as any) = TextDecoder
}
