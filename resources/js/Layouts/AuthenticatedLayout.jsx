import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [theme, setTheme] = useTheme();
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-[#091540] text-white' : 'bg-white text-[#091540]'}`}>
            {/* Topbar Nav */}
            <nav className={`border-b transition-colors ${
                isDark 
                    ? 'border-[#2E438F] bg-[#091540] text-white shadow-lg' 
                    : 'border-[#091540] bg-[#2E438F] text-white shadow-md'
            }`}>
                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo & Links */}
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2.5">
                                <span className="text-3xl filter drop-shadow">☠️</span>
                                <span className="font-mono font-black tracking-widest text-xl text-white">
                                    TORTUGA COVE
                                </span>
                            </Link>

                            <div className="hidden space-x-6 sm:flex items-center h-16">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Lobby Tavern
                                </NavLink>
                                <NavLink
                                    href={route('deck')}
                                    active={route().current('deck')}
                                >
                                    Game Deck
                                </NavLink>
                                <NavLink
                                    href={route('crew')}
                                    active={route().current('crew')}
                                >
                                    Crew (Friends)
                                </NavLink>
                            </div>
                        </div>

                        {/* Right Actions: Theme Toggle & User Menu */}
                        <div className="hidden sm:flex sm:items-center sm:gap-3">
                            <button
                                type="button"
                                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                                className="px-3.5 py-1.5 rounded-xl border border-white/30 bg-[#091540] text-white text-xs font-bold tracking-wider hover:bg-[#091540]/80 transition shadow-sm flex items-center gap-2"
                            >
                                <span>{isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
                            </button>

                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-xl border border-white/30 bg-[#091540] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#091540]/80 transition shadow-sm"
                                        >
                                            <span className="mr-1.5">☠️</span>
                                            <span>{user.username}</span>
                                            <svg
                                                className="-me-0.5 ms-2 h-4 w-4 text-[#A6B9FF]"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content className={`border-2 rounded-2xl shadow-2xl overflow-hidden py-1.5 ${
                                        isDark
                                            ? 'bg-[#091540] border-white/30 text-white'
                                            : 'bg-white border-[#2E438F] text-[#091540]'
                                    }`}>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                            className={`font-black font-mono tracking-wide px-4 py-2.5 text-xs flex items-center gap-2 transition ${
                                                isDark
                                                    ? 'text-white hover:bg-[#2E438F] hover:text-white'
                                                    : 'text-[#091540] hover:bg-[#A6B9FF]/30 hover:text-[#091540]'
                                            }`}
                                        >
                                            <span>🏴‍☠️</span> My Profile
                                        </Dropdown.Link>
                                        <div className={`my-1 border-t ${isDark ? 'border-white/20' : 'border-[#2E438F]/20'}`} />
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className={`font-black font-mono tracking-wide px-4 py-2.5 text-xs flex items-center gap-2 transition w-full text-left ${
                                                isDark
                                                    ? 'text-red-400 hover:bg-red-950/60 hover:text-red-300'
                                                    : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                            }`}
                                        >
                                            <span>⚓</span> Abandon Ship (Log Out)
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="-me-2 flex items-center sm:hidden gap-2">
                            <button
                                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                                className="p-2 rounded-lg text-xs border border-white/30 bg-[#091540] text-white font-bold"
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-lg p-2 text-white hover:bg-white/10 transition"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-[#091540] bg-[#2E438F]'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Lobby Tavern
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('deck')}
                            active={route().current('deck')}
                        >
                            Game Deck
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('crew')}
                            active={route().current('crew')}
                        >
                            Crew (Friends)
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-white/20 pb-2 pt-4 px-4">
                        <div className="text-sm font-bold text-white">{user.name}</div>
                        <div className="text-xs text-[#A6B9FF]">{user.email}</div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Abandon Ship (Log Out)
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className={`border-b shadow-sm ${isDark ? 'bg-[#091540] border-[#2E438F] text-white' : 'bg-white border-[#2E438F] text-[#091540]'}`}>
                    <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className={`min-h-[calc(100vh-4rem)] transition-colors ${isDark ? 'bg-[#091540]' : 'bg-white'}`}>
                {children}
            </main>
        </div>
    );
}
