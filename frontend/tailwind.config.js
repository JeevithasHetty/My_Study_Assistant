/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Dark AI theme
        bg: {
          primary: '#030712',
          secondary: '#0F172A',
          tertiary: '#1E293B',
          card: '#0F172A',
          glass: 'rgba(15, 23, 42, 0.8)',
        },
        brand: {
          blue: '#2563EB',
          'blue-light': '#3B82F6',
          'blue-glow': 'rgba(37, 99, 235, 0.3)',
          cyan: '#22D3EE',
          'cyan-light': '#67E8F9',
          'cyan-glow': 'rgba(34, 211, 238, 0.2)',
          green: '#10B981',
          'green-light': '#34D399',
          'green-glow': 'rgba(16, 185, 129, 0.2)',
          purple: '#8B5CF6',
          'purple-glow': 'rgba(139, 92, 246, 0.2)',
          amber: '#F59E0B',
          pink: '#EC4899',
          red: '#EF4444',
        },
        border: {
          primary: '#1E293B',
          glow: 'rgba(37, 99, 235, 0.4)',
          cyan: 'rgba(34, 211, 238, 0.3)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          muted: '#475569',
          accent: '#22D3EE',
        },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37, 99, 235, 0.3), transparent)',
        'glow-blue': 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
        'glow-cyan': 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, transparent 100%)',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.4), 0 0 60px rgba(37, 99, 235, 0.15)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.1)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.3)',
        'card': '0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(37, 99, 235, 0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'grid-move': 'grid-move 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)' },
          '50%': { opacity: '0.85', boxShadow: '0 0 40px rgba(37, 99, 235, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'grid-move': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(60px)' },
        },
      },
      backdropBlur: { xs: '2px' },
      borderRadius: { xl: '1rem', '2xl': '1.5rem', '3xl': '2rem' },
    },
  },
  plugins: [],
};
