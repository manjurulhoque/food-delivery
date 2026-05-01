"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Lock, Mail, ChevronRight } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error("Invalid credentials");
            }

            router.push("/");
            router.refresh();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Login failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-[calc(100vh-112px)] bg-gray-50">
            <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                <div className="max-w-6xl mx-auto px-5 py-10 relative z-10">
                    <h1 className="font-[Poppins] font-bold text-3xl md:text-4xl text-white leading-tight mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-green-100 text-sm max-w-md">
                        Login to continue your orders, track deliveries, and save your favorite dishes.
                    </p>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 py-10">
                <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
                    <h2 className="font-[Poppins] font-bold text-xl text-green-600 mb-1">Login</h2>
                    <p className="text-sm text-gray-500 mb-6">Enter your credentials to access your account.</p>

                    <form className="space-y-4" onSubmit={onSubmit}>
                        <label className="block">
                            <span className="text-xs font-bold text-gray-600 mb-1.5 block">Email Address</span>
                            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-green-400 transition-colors">
                                <Mail size={16} className="text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400"
                                    required
                                />
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-xs font-bold text-gray-600 mb-1.5 block">Password</span>
                            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-green-400 transition-colors">
                                <Lock size={16} className="text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400"
                                    required
                                />
                            </div>
                        </label>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-gray-500">
                                <input type="checkbox" className="accent-green-600" />
                                Remember me
                            </label>
                            <Link href="/forget-password" className="text-xs font-semibold text-green-600 hover:text-green-700">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                            <ChevronRight size={16} />
                        </button>
                    </form>

                    {error && (
                        <p className="mt-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <p className="text-xs text-gray-500 mt-5 text-center">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-green-600 font-bold hover:text-green-700">
                            Register
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
