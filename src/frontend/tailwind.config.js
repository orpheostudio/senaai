/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './index.html'
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Yume Color Palette
        yume: {
          midnight: '#1a1b3a',
          lavender: '#b19cd9',
          pearl: '#f5f3ff',
          coral: '#ff6b9d',
          'soft-blue': '#a8d8ff',
          mint: '#9de0ad',
          peach: '#ffb5a0',
          violet: '#d4a5ff'
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'typing': 'typing 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        bounceSoft: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -10px, 0)' },
          '70%': { transform: 'translate3d(0, -5px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px theme(colors.yume.lavender)' },
          '100%': { boxShadow: '0 0 20px theme(colors.yume.lavender), 0 0 30px theme(colors.yume.lavender)' }
        },
        typing: {
          '0%': { transform: 'translateY(0px)' },
          '28%': { transform: 'translateY(-5px)' },
          '44%': { transform: 'translateY(0px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      backgroundImage: {
        'gradient-kawaii': 'linear-gradient(135deg, theme(colors.yume.pearl) 0%, theme(colors.yume.lavender) 50%, theme(colors.yume.midnight) 100%)',
        'gradient-sunset': 'linear-gradient(135deg, theme(colors.yume.coral) 0%, theme(colors.yume.peach) 50%, theme(colors.yume.violet) 100%)',
        'gradient-ocean': 'linear-gradient(135deg, theme(colors.yume.soft-blue) 0%, theme(colors.yume.lavender) 100%)',
        'gradient-forest': 'linear-gradient(135deg, theme(colors.yume.mint) 0%, theme(colors.yume.soft-blue) 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'kawaii': '0 8px 32px -8px rgba(177, 156, 217, 0.3)',
        'glow': '0 0 20px rgba(177, 156, 217, 0.4)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
      },
      backdropBlur: {
        'xs': '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Plugin personalizado para utilitários kawaii
    function({ addUtilities, theme }) {
      const kawaiUtils = {
        '.text-kawaii': {
          background: theme('backgroundImage.gradient-kawaii'),
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text'
        },
        '.card-kawaii': {
          background: theme('colors.white'),
          borderRadius: theme('borderRadius.2xl'),
          boxShadow: theme('boxShadow.kawaii'),
          border: `1px solid ${theme('colors.yume.lavender')}33`
        },
        '.btn-kawaii': {
          background: theme('backgroundImage.gradient-kawaii'),
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.soft'),
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.glow')
          }
        },
        '.animate-kawaii': {
          animation: theme('animation.float')
        }
      }
      addUtilities(kawaiUtils)
    }
  ],
}