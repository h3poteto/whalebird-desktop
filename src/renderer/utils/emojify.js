const emojify = (str, customEmoji = []) => {
  let result = str
  customEmoji.map((emoji) => {
    const reg = new RegExp(`:${emoji.shortcode}:`, 'g')
    const match = result.match(reg)
    if (!match) return emoji
    const replaceTag = `<img draggable="false" class="emojione" alt="${emoji.shortcode}" title="${emoji.shortcode}" src="${emoji.url}" />`
    result = result.replace(reg, replaceTag)
    return emoji
  })
  return result
}

export default emojify
