import { Link } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme';

export default function GuestLayout({ children }) {
    const [theme, setTheme] = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200 relative ${
            isDark ? 'bg-[#091540] text-white' : 'bg-white text-[#091540]'
        }`}>
            {/* Topbar Theme Toggle */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className={`px-3.5 py-1.5 rounded-full border-2 text-xs font-black transition shadow-sm flex items-center gap-1.5 ${
                        isDark
                            ? 'bg-[#2E438F] hover:bg-[#2E438F]/80 text-white border-white/20'
                            : 'bg-white hover:bg-[#A6B9FF]/20 text-[#091540] border-[#2E438F]'
                    }`}
                >
                    <span>{isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
                </button>
            </div>

            {/* Logo */}
            <div className="mb-6 text-center">
                <Link href="/" className="flex flex-col items-center gap-2 group">
                    <span className="text-5xl animate-bounce">🏴‍☠️</span>
                    <h1 className={`text-2xl sm:text-3xl font-black tracking-widest font-mono uppercase transition ${
                        isDark ? 'text-white group-hover:text-[#A6B9FF]' : 'text-[#091540] group-hover:text-[#2E438F]'
                    }`}>
                        TORTUGA COVE
                    </h1>
                </Link>
            </div>

            {/* Auth Card */}
            <div className={`w-full sm:max-w-md p-6 sm:p-8 rounded-2xl border-2 shadow-2xl transition-all duration-200 ${
                isDark
                    ? 'bg-[#091540] border-white/20 text-white'
                    : 'bg-white border-[#2E438F] text-[#091540]'
            }`}>
                {children}
            </div>
        </div>
    );
}
