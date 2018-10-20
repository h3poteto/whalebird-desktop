import assert from 'assert'
import { JSDOM } from 'jsdom'
import { findLink, isTag, findAccount } from '../../src/renderer/utils/tootParser'

describe('findLink', () => {
  context('Pleroma', () => {
    const doc = (new JSDOM(`<html><head></head><body>
<div class="toot">
<p>
I released Whalebird version 2.4.1. In version 2.4.0, Whalebird supports streaming update of Pleroma. But it contains a bug, so it is resolved in version 2.4.1.  <br /><a href="https://github.com/h3poteto/whalebird-desktop/releases/tag/2.4.1" id="link">https://github.com/h3poteto/whalebird-desktop/releases/tag/2.4.1</a><br /><a href="https://pleroma.io/tag/whalebird">#Whalebird</a>
</p>
</div>
</body>
</html>`)).window.document

    const target = doc.getElementById('link')
    it('should find', () => {
      const res = findLink(target)
      assert.strictEqual(res, 'https://github.com/h3poteto/whalebird-desktop/releases/tag/2.4.1')
    })
  })
})

describe('isTag', () => {
  context('Pleroma', () => {
    const doc = (new JSDOM(`<html><head></head><body>
<div class="toot">
<p>
I released Whalebird version 2.4.1. In version 2.4.0, Whalebird supports streaming update of Pleroma. But it contains a bug, so it is resolved in version 2.4.1.  <br /><a href="https://github.com/h3poteto/whalebird-desktop/releases/tag/2.4.1">https://github.com/h3poteto/whalebird-desktop/releases/tag/2.4.1</a><br /><a id="tag" href="https://pleroma.io/tag/whalebird">#Whalebird</a>
</p>
</div>
</body>
</html>`)).window.document
    const target = doc.getElementById('tag')
    it('should find', () => {
      const res = isTag(target)
      assert.strictEqual(res, true)
    })
  })
})

describe('findAccount', () => {
  context('Pleroma', () => {
    const doc = (new JSDOM(`<html><head></head><body>
<div class="toot">
<p><span><a href="https://social.mikutter.hachune.net/@h3_poteto">@<span id="user">h3_poteto</span></a></span> hogehoge</p>
</div>
</body>
</html>`)).window.document
    const target = doc.getElementById('user')
    it('should find', () => {
      const res = findAccount(target)
      assert.strictEqual(res.username, '@h3_poteto')
      assert.strictEqual(res.acct, '@h3_poteto@social.mikutter.hachune.net')
    })
  })
})
