import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Mural Pay Dashboard',
  description: 'Manage your Mural Pay accounts and payouts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex gap-4">
            <Link href="/" className="hover:text-gray-300">Home</Link>
            <Link href="/accounts" className="hover:text-gray-300">Accounts</Link>
            <Link href="/payouts" className="hover:text-gray-300">Payouts</Link>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
