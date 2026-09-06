import "./globals.css";
import AuthSync from "../components/AuthSync";

export const metadata = {
  title: "FeniX | Business Ecosystem",
  description: "One Account. One Ecosystem.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="bg-surface text-navy">
        <AuthSync />
        {children}
      </body>
    </html>
  );
}
