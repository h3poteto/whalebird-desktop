const withMT = require('@material-tailwind/react/utils/withMT')

module.exports = withMT({
  content: ['./renderer/pages/**/*.{js,ts,jsx,tsx}', './renderer/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          950: '#0B2A68'
        }
      }
    }
  },
  plugins: []
})
