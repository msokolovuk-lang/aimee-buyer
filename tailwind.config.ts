import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:     '#0D1B2A',
        bg2:    '#112236',
        card:   '#14283A',
        cyan:   '#00C2CB',
        yellow: '#F5A623',
        green:  '#3DD68C',
      },
    },
  },
  plugins: [],
}
export default config
