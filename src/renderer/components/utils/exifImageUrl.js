import loadImage from 'blueimp-load-image'

const parseExtension = url => {
  if (!url) {
    return null
  }
  if (url.match(/\.jpg$/) || url.match(/\.jpeg$/) || url.match(/\.JPG$/) || url.match(/\.JPEG$/)) {
    return 'image/jpeg'
  } else if (url.match(/\.png$/) || url.match(/\.PNG$/)) {
    return 'image/png'
  } else if (url.match(/\.gif$/) || url.match(/\.GIF$/)) {
    return 'image/gif'
  } else if (url.match(/\.webp$/) || url.match(/\.WEBP$/)) {
    return 'image/webp'
  } else if (url.match(/\.svg$/) || url.match(/\.SVG$/)) {
    return 'image/svg+xml'
  }
  return null
}

const exifImageUrl = url => {
  return new Promise((resolve, reject) => {
    const extension = parseExtension(url)
    if (!extension) {
      reject(Error(`url is not image: ${url}`))
    }
    loadImage(
      url,
      canvas => {
        const data = canvas.toDataURL(extension)
        resolve(data)
      },
      {
        canvas: true,
        meta: true,
        orientation: true
      }
    )
  })
}

export default exifImageUrl
