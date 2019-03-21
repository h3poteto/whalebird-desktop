import * as path from 'path'
import * as i18next from 'i18next'
import * as Backend from 'i18next-sync-fs-backend'
import { InitOptions } from 'i18next'

const options: InitOptions = {
  initImmediate: false,
  lng: 'en',
  backend: {
    // path where resources get loaded from
    loadPath: path.resolve(__dirname, './locales/{{lng}}/{{ns}}.json'),

    // path to post missing resources
    addPath: path.resolve(__dirname, './locales/{{lng}}/{{ns}}.missing.json'),

    // jsonIndent to use when storing json files
    jsonIndent: 2
  }
}

i18next
  .use(Backend)
  .init(options)

export default i18next
