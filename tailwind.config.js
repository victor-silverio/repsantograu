/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"], // Isso diz pro Tailwind olhar seu HTML para saber o que compilar
  theme: {
    extend: {
      colors: {
        repRed: '#8B0000',
        repGold: '#D4AF37',
        repWhite: '#FAFAFA',
        repGrey: '#333333'
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}