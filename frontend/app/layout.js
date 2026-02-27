import { Montserrat } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata = {
    title: 'GeoFinder - Find Nearby Services',
    description: 'Locate hospitals, ATMs, and shops near you.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={montserrat.className}>
                <Header />
                <main className="min-h-screen bg-gray-50">
                    {children}
                </main>
            </body>
        </html>
    );
}
