import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Comfortaa','Be Vietnam Pro ','Lexend','Figtree', ...defaultTheme.fontFamily.sans],
                serif:[' Josefin Slab ','Merriweather','Playfair Display','Roboto Slab', ...defaultTheme.fontFamily.serif],
                mono: ['ui-monospace', 'SFMono-Regular', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                dicatho: '#0096dd',
                pachinos: '#df7a1c',
                cepac: '#2c3691',
                vsp: '#d30009',
                penitencia: '#fec63e'
            },
        },
    },

    plugins: [
        require('daisyui'),
        forms],

        daisyui: {
            themes: true, // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
            darkTheme: "dark", // name of one of the included themes for dark mode
            base: true, // applies background color and foreground color for root element by default
            styled: true, // include daisyUI colors and design decisions for all components
            utils: true, // adds responsive and modifier utility classes
            prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
            logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
            themeRoot: ":root", // The element that receives theme color CSS variables
          },
};
