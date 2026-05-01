import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgetPasswordPage() {
    return (
        <main className="min-h-[calc(100vh-112px)] bg-gray-50">
            <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                <div className="max-w-6xl mx-auto px-5 py-10 relative z-10">
                    <h1 className="font-[Poppins] font-bold text-3xl md:text-4xl text-white leading-tight mb-2">
                        Reset Password
                    </h1>
                    <p className="text-green-100 text-sm max-w-md">
                        Enter your account email and we&apos;ll send a password reset link right away.
                    </p>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 py-10">
                <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
                    <h2 className="font-[Poppins] font-bold text-xl text-green-600 mb-1">Forgot Password?</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Don&apos;t worry, this happens. Enter the email linked to your account.
                    </p>

                    <form className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-bold text-gray-600 mb-1.5 block">Email Address</span>
                            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-green-400 transition-colors">
                                <Mail size={16} className="text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400"
                                />
                            </div>
                        </label>

                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                        >
                            Send Reset Link
                            <Send size={15} />
                        </button>
                    </form>

                    <div className="mt-5 flex items-center justify-center">
                        <Link href="/login" className="text-xs font-semibold text-green-600 hover:text-green-700 inline-flex items-center gap-1">
                            <ArrowLeft size={14} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
