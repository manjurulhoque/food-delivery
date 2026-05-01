"use client";

export function Footer() {
    return (
        <footer className="bg-gray-900 text-white mt-16">
            <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
                <div className="col-span-2">
                    <div className="text-2xl font-extrabold font-[Poppins] mb-3">
                        <span className="text-green-400">F</span>
                        <span className="text-orange-400">o</span>
                        <span className="text-green-400">o</span>
                        <span className="text-orange-400">d</span>
                        <span className="text-green-400">y</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-xs">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepturi nisi excepturi tempor molestiae.
                    </p>
                    <div className="flex gap-2">
                        {["📘", "🐦", "📷", "💼"].map((icon, i) => (
                            <button
                                key={i}
                                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-sm transition-colors"
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>
                {[
                    { title: "Menu", items: ["Categories", "How it works", "Popular", "Newest"] },
                    { title: "Services", items: ["Free Centres", "Feedback", "Other", "Payment & Tax"] },
                    { title: "Support", items: ["Help Centre", "FAQ", "Documents"] },
                    { title: "Company", items: ["About Us", "Blog", "Careers", "News"] },
                ].map((col) => (
                    <div key={col.title}>
                        <h4 className="text-sm font-bold text-green-400 mb-3">{col.title}</h4>
                        {col.items.map((item) => (
                            <p key={item} className="text-xs text-gray-400 mb-2 hover:text-gray-200 cursor-pointer transition-colors">
                                {item}
                            </p>
                        ))}
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-800">
                <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
                    <p className="text-xs text-gray-500">© 2024 Foody Inc. All Rights Reserved</p>
                    <div className="flex gap-4">
                        <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</a>
                        <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms & Conditions</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
