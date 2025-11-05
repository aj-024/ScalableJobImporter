import "./globals.css";

export const metadata = {
  title: "Import History Dashboard",
  description: "Scalable Job Importer UI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
