import './globals.css';
import Navigation from './components/Navigation';

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
        <Navigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
