import type { Metadata } from "next";
import { Nunito, Poppins, Geist } from "next/font/google";
import "./globals.css";
import { Navbar, Footer } from "@/components/shared";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const nunito = Nunito({
    subsets: ["latin"],
    variable: "--font-nunito",
    weight: ["400", "500", "600", "700", "800"],
});

const poppins = Poppins({
    subsets: ["latin"],
    variable: "--font-poppins",
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "Foody – Fastest Delivery & Easy Pickup",
    description: "Order your favourite food with the fastest delivery",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={cn("font-sans", geist.variable)}>
            <body className={`${nunito.variable} ${poppins.variable} font-sans bg-gray-50 text-gray-900 antialiased`}>
                <Navbar />
                {children}
                <Footer />
            </body>
        </html>
    );
}
