import './globals.scss';
import { Providers } from './providers';

export const metadata = {
  title: 'EMEA AI on IBM Power Carbon Demos',
  description: 'EMEA AI on IBM Power demos with the Carbon Design System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}