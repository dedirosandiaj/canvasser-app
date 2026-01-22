/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            // Berry Vue Color Palette
            colors: {
                // Primary (Blue)
                primary: {
                    DEFAULT: '#1e88e5',
                    50: '#e3f2fd',
                    100: '#bbdefb',
                    200: '#90caf9',
                    300: '#64b5f6',
                    400: '#42a5f5',
                    500: '#1e88e5',
                    600: '#1976d2',
                    700: '#1565c0',
                    800: '#0d47a1',
                    900: '#0a3d91',
                    light: '#eef2f6',
                    dark: '#1565c0',
                },
                // Secondary (Purple)  
                secondary: {
                    DEFAULT: '#5e35b1',
                    50: '#ede7f6',
                    100: '#d1c4e9',
                    200: '#b39ddb',
                    300: '#9575cd',
                    400: '#7e57c2',
                    500: '#5e35b1',
                    600: '#512da8',
                    700: '#4527a0',
                    800: '#311b92',
                    900: '#1a0f5c',
                    light: '#ede7f6',
                    dark: '#4527a0',
                },
                // Success (Green)
                success: {
                    DEFAULT: '#00c853',
                    50: '#e8f5e9',
                    100: '#c8e6c9',
                    200: '#a5d6a7',
                    300: '#81c784',
                    400: '#66bb6a',
                    500: '#00c853',
                    600: '#43a047',
                    700: '#388e3c',
                    800: '#2e7d32',
                    900: '#1b5e20',
                    light: '#b9f6ca',
                },
                // Warning (Yellow/Amber)
                warning: {
                    DEFAULT: '#ffc107',
                    50: '#fff8e1',
                    100: '#ffecb3',
                    200: '#ffe082',
                    300: '#ffd54f',
                    400: '#ffca28',
                    500: '#ffc107',
                    600: '#ffb300',
                    700: '#ffa000',
                    800: '#ff8f00',
                    900: '#ff6f00',
                    light: '#fff8e1',
                },
                // Error (Red)
                error: {
                    DEFAULT: '#f44336',
                    50: '#ffebee',
                    100: '#ffcdd2',
                    200: '#ef9a9a',
                    300: '#e57373',
                    400: '#ef5350',
                    500: '#f44336',
                    600: '#e53935',
                    700: '#d32f2f',
                    800: '#c62828',
                    900: '#b71c1c',
                    light: '#f9d8d8',
                },
                // Info (Cyan)
                info: {
                    DEFAULT: '#03c9d7',
                    50: '#e0f7fa',
                    100: '#b2ebf2',
                    200: '#80deea',
                    300: '#4dd0e1',
                    400: '#26c6da',
                    500: '#03c9d7',
                    600: '#00acc1',
                    700: '#0097a7',
                    800: '#00838f',
                    900: '#006064',
                    light: '#e0f7fa',
                },
                // Gray Scale
                gray: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#eeeeee',
                    300: '#e0e0e0',
                    400: '#bdbdbd',
                    500: '#9e9e9e',
                    600: '#757575',
                    700: '#616161',
                    800: '#424242',
                    900: '#212121',
                },
                // Theme Specific
                surface: '#ffffff',
                background: '#eef2f6',
                containerBg: '#eef2f6',
                darkText: '#212121',
                lightText: '#616161',
                borderLight: '#d0d0d0',
                inputBorder: '#787878',
            },
            // Typography
            fontFamily: {
                sans: ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
                roboto: ['Roboto', 'sans-serif'],
            },
            // Border Radius (12px base)
            borderRadius: {
                none: '0',
                sm: '6px',
                DEFAULT: '12px',
                md: '12px',
                lg: '24px',
                xl: '72px',
                pill: '9999px',
                full: '50%',
            },
            // Box Shadow
            boxShadow: {
                'berry-sm': '0 2px 4px rgba(0, 0, 0, 0.05)',
                'berry': '0 4px 12px rgba(0, 0, 0, 0.08)',
                'berry-md': '1px 0 20px rgba(0, 0, 0, 0.08)',
                'berry-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
                'berry-xl': '0 12px 32px rgba(0, 0, 0, 0.16)',
                'card': '0 1px 4px rgba(0, 0, 0, 0.08)',
            },
            // Typography Scale
            fontSize: {
                'h1': ['2.125rem', { lineHeight: '3.5rem', fontWeight: '700' }],
                'h2': ['1.5rem', { lineHeight: '2.5rem', fontWeight: '700' }],
                'h3': ['1.25rem', { lineHeight: '2rem', fontWeight: '600' }],
                'h4': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
                'h5': ['0.875rem', { lineHeight: '1.2rem', fontWeight: '500' }],
                'h6': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
                'subtitle1': ['0.875rem', { lineHeight: '1rem', fontWeight: '500' }],
                'subtitle2': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
                'body1': ['0.875rem', { lineHeight: '1.5rem', fontWeight: '400' }],
                'body2': ['0.75rem', { lineHeight: '1.25rem', fontWeight: '400' }],
                'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
            },
            // Spacing
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '26': '6.5rem',
                '30': '7.5rem',
                '34': '8.5rem',
                '38': '9.5rem',
            },
            // Animations
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'fade-out': 'fadeOut 0.2s ease-in',
                'slide-in-left': 'slideInLeft 0.25s ease-out',
                'slide-in-right': 'slideInRight 0.25s ease-out',
                'slide-up': 'slideUp 0.25s ease-out',
                'slide-down': 'slideDown 0.25s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'spin-slow': 'spin 2s linear infinite',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
            // Width/Height
            width: {
                'sidebar': '260px',
                'sidebar-mini': '75px',
            },
            height: {
                'topbar': '80px',
            },
        },
    },
    plugins: [],
};
