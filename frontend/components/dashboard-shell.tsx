"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type DashboardStat = {
    label: string;
    value: string;
};

type DashboardCard = {
    title: string;
    description: string;
    action: string;
};

type SidebarSubMenu = {
    label: string;
    href: string;
};

type SidebarMenu = {
    label: string;
    href?: string;
    subMenu?: SidebarSubMenu[];
};

export function DashboardShell({
    roleTitle,
    subtitle,
    stats,
    cards,
    sidebarMenus,
    children,
}: {
    roleTitle: string;
    subtitle: string;
    stats: DashboardStat[];
    cards: DashboardCard[];
    sidebarMenus: SidebarMenu[];
    children?: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <main>
            <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                <div className="max-w-6xl mx-auto px-5 py-10 relative z-10">
                    <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                        Dashboard Overview
                    </span>
                    <h1 className="font-[Poppins] font-bold text-3xl md:text-4xl text-white leading-tight mb-3">
                        {roleTitle}
                    </h1>
                    <p className="text-green-100 text-sm max-w-xl leading-relaxed">{subtitle}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
                        {stats.map((stat) => (
                            <div key={stat.label} className="bg-white/15 rounded-xl px-3 py-2.5 border border-white/20">
                                <p className="text-xs text-green-100">{stat.label}</p>
                                <p className="text-white font-extrabold text-lg">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 py-8">
                <div className="flex gap-5 items-start">
                    <aside className="w-64 shrink-0 bg-white rounded-2xl border border-gray-100 p-4">
                        <h2 className="font-[Poppins] font-bold text-sm text-gray-900 mb-3">Dashboard Menu</h2>
                        <div className="space-y-2">
                            {sidebarMenus.map((menu) => (
                                <div key={menu.label} className="rounded-xl border border-gray-100 p-2">
                                    {menu.href ? (
                                        <Link
                                            href={menu.href}
                                            className={cn(
                                                "block text-sm font-bold rounded-lg px-2.5 py-2 transition-colors",
                                                pathname === menu.href
                                                    ? "bg-green-50 text-green-700"
                                                    : "text-gray-600 hover:bg-gray-50"
                                            )}
                                        >
                                            {menu.label}
                                        </Link>
                                    ) : (
                                        <p className="text-sm font-bold text-gray-700 px-2.5 py-1">{menu.label}</p>
                                    )}

                                    {menu.subMenu && menu.subMenu.length > 0 && (
                                        <div className="mt-1 ml-2 border-l border-gray-200 pl-2 space-y-1">
                                            {menu.subMenu.map((sub) => (
                                                <Link
                                                    key={sub.href}
                                                    href={sub.href}
                                                    className={cn(
                                                        "block text-xs font-semibold rounded-md px-2 py-1.5 transition-colors",
                                                        pathname === sub.href
                                                            ? "bg-green-50 text-green-700"
                                                            : "text-gray-500 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </aside>

                    <div className="flex-1">
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {cards.map((card) => (
                                <article key={card.title} className="bg-white rounded-2xl border border-gray-100 p-5">
                                    <h2 className="font-[Poppins] font-bold text-lg text-gray-900 mb-2">{card.title}</h2>
                                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{card.description}</p>
                                    <button className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors">
                                        {card.action}
                                    </button>
                                </article>
                            ))}
                        </div>
                        {children && <div className="mt-5">{children}</div>}
                    </div>
                </div>
            </section>
        </main>
    );
}
