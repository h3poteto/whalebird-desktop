import * as path from 'path'
import fs from 'fs'
import keys from 'all-object-keys'
import objectAssignDeep from 'object-assign-deep'

const defaultLocale = 'en'
const locales = ['de', 'fr', 'it', 'ja', 'ko', 'pl', 'zh_cn']

const enJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../src/config/locales/${defaultLocale}/translation.json`), 'utf8'))

describe('i18n', () => {
  describe('should be same keys', () => {
    locales.map(locale => {
      it(`${locale} translation`, () => {
        const targetJson = JSON.parse(
          fs.readFileSync(path.resolve(__dirname, `../../src/config/locales/${locale}/translation.json`), 'utf8')
        )
        const targetMissingJson = JSON.parse(
          fs.readFileSync(path.resolve(__dirname, `../../src/config/locales/${locale}/translation.missing.json`), 'utf8')
        )
        const enKeys = keys(enJson)
        const targetKeys = keys(objectAssignDeep(targetJson, targetMissingJson))
        expect(enKeys.sort()).toEqual(targetKeys.sort())
      })
    })
  })

  describe('should not define duplicate keys', () => {
    locales.map(locale => {
      it(`${locale} translation`, () => {
        const targetJson = JSON.parse(
          fs.readFileSync(path.resolve(__dirname, `../../src/config/locales/${locale}/translation.json`), 'utf8')
        )
        const targetMissingJson = JSON.parse(
          fs.readFileSync(path.resolve(__dirname, `../../src/config/locales/${locale}/translation.missing.json`), 'utf8')
        )
        const allKeys = keys(targetJson).concat(keys(targetMissingJson))
        const duplicates: Array<string> = allKeys.filter(
          (x: string, _: number, self: Array<string>) => self.indexOf(x) !== self.lastIndexOf(x)
        )
        expect(duplicates).toEqual([])
      })
    })
  })
})
