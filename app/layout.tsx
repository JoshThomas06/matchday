import type { Metadata } from "next";
import "./globals.css";
import SideNav from "@/components/layout/SideNav";
import TopBar from "@/components/layout/TopBar";

export const metadata: Metadata = {
  title: "MATCHDAY",
  description: "Live second-screen sports engagement",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#051424", fontFamily: "'Archivo Narrow', sans-serif" }}>
        <TopBar />
        <div style={{ display: "flex", paddingTop: 64, minHeight: "100vh" }}>
          <SideNav />
          <main style={{ marginLeft: 240, flex: 1, minHeight: "calc(100vh - 64px)", background: "#051424" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}