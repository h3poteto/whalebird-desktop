const { makeUniversalApp } = require('@electron/universal')
const path = require('path')

const x64AppPath = path.resolve(__dirname, './Whalebird-mas-x64/Whalebird.app')
const arm64AppPath = path.resolve(__dirname, './Whalebird-mas-arm64/Whalebird.app')
const universalAppPath = path.resolve(__dirname, './Whalebird-mas-universal/Whalebird.app')

;(async () => {
  await makeUniversalApp({
    x64AppPath: x64AppPath,
    arm64AppPath: arm64AppPath,
    outAppPath: universalAppPath
  })
})()
