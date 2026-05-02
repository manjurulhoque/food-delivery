import Link from "next/link";
import { Home, Search, UtensilsCrossed } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-[calc(100vh-112px)] bg-gray-50">
            <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                <div className="max-w-6xl mx-auto px-5 py-10 relative z-10">
                    <h1 className="font-[Poppins] font-bold text-3xl md:text-4xl text-white leading-tight mb-2">
                        Oops — we can&apos;t find that page
                    </h1>
                    <p className="text-green-100 text-sm max-w-md">
                        The page you&apos;re looking for may have been moved, removed, or the link might be
                        wrong. Let&apos;s get you back to the good stuff.
                    </p>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 py-10">
                <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 p-8 md:p-10 text-center shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 text-green-700 mb-5">
                        <UtensilsCrossed size={28} strokeWidth={2} />
                    </div>
                    <p className="font-[Poppins] text-5xl font-extrabold text-green-600 tracking-tight mb-1">
                        404
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mb-2">This page could not be found</p>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                        Try the home page or browse our menu to discover dishes near you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-3 px-5 transition-colors"
                        >
                            <Home size={16} />
                            Back to home
                        </Link>
                        <Link
                            href="/menu"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 text-gray-800 text-sm font-bold py-3 px-5 transition-colors"
                        >
                            <Search size={16} className="text-green-600" />
                            Browse menu
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
