// app/layout.jsx
import './globals.css';

export const metadata = {
  title: 'GigVibe | Elite Freelancing Marketplace',
  description: 'Production-ready portal connecting top engineering talent with high-impact clients.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/30">
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}