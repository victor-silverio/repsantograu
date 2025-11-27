/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}", "!./node_modules/**/*"], 
  theme: {
    extend: {
      colors: {
        repRed: '#8B0000',
        repGold: '#D4AF37',
        repWhite: '#FAFAFA',
        repGrey: '#333333',
        whatsapp: '#128C7E',
        whatsappDark: '#075E54',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}