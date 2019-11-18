import * as path from 'path'
import fs from 'fs'
import keys from 'all-object-keys'

const locales = ['de', 'fr', 'it', 'ja', 'ko', 'pl', 'zh_cn']

describe('i18n', () => {
  describe('should not define duplicate keys', () => {
    locales.map(locale => {
      it(`${locale} translation`, () => {
        const targetJson = JSON.parse(
          fs.readFileSync(path.resolve(__dirname, `../../src/config/locales/${locale}/translation.json`), 'utf8')
        )
        const allKeys = keys(targetJson)
        const duplicates: Array<string> = allKeys.filter(
          (x: string, _: number, self: Array<string>) => self.indexOf(x) !== self.lastIndexOf(x)
        )
        expect(duplicates).toEqual([])
      })
    })
  })
})
