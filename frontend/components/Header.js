"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('token'));
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        router.push('/');
    };

    return (
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-2xl font-bold text-primary-600">
                        GeoFinder
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className={`text-sm font-medium ${pathname === '/' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/nearby"
                            className={`text-sm font-medium ${pathname === '/nearby' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Nearby Search
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <Link href="/admin/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 font-hindi">
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/admin/login"
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                        >
                            Admin Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
