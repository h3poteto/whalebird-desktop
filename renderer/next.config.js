/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  distDir:
    process.env.NODE_ENV === 'production'
      ? // we want to change `distDir` to "../app" so as nextron can build the app in production mode!
        '../app'
      : // default `distDir` value
        '.next',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  webpack: config => {
    return config
  }
}
