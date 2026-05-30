"use client";

import { useSession } from "next-auth/react";
import { Radio, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
    useCreateDriverProfileMutation,
    useGetDriverByUserIdQuery,
    useUpdateDriverAvailabilityMutation,
} from "@/lib/services/delivery-api";

function PanelSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6">
            <div className="h-5 w-40 rounded bg-gray-100" />
            <div className="mt-4 h-12 rounded-xl bg-gray-100" />
        </div>
    );
}

export function DriverAvailabilityPanel({ compact = false }: { compact?: boolean }) {
    const { data: session, status: authStatus } = useSession();
    const isAuthed = authStatus === "authenticated";
    const isDriver = Boolean(session?.user?.is_driver);
    const userId = session?.user?.id ? Number(session.user.id) : undefined;

    const {
        data: profile,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetDriverByUserIdQuery(userId!, { skip: !userId || !isDriver });

    const [updateAvailability, { isLoading: isUpdating }] =
        useUpdateDriverAvailabilityMutation();
    const [createProfile, { isLoading: isCreating }] = useCreateDriverProfileMutation();

    const isNotFound =
        isError && error && "status" in error && error.status === 404;

    if (!isAuthed) {
        return (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-5 py-6 text-sm text-amber-900">
                <p className="font-semibold">Sign in to manage availability</p>
                <p className="mt-1 text-amber-800/90">
                    Log in with a driver account to go online and receive delivery assignments.
                </p>
            </div>
        );
    }

    if (!isDriver) {
        return (
            <div className="rounded-2xl border border-gray-100 bg-white px-5 py-6 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Driver account required</p>
                <p className="mt-1">
                    This page is for delivery drivers. Register or sign in with a driver account
                    (e.g. driver001@foody.test).
                </p>
            </div>
        );
    }

    if (isLoading) {
        return <PanelSkeleton />;
    }

    if (isNotFound) {
        return (
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                        <Radio className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                        <h2 className="font-[Poppins] text-lg font-bold text-gray-900">
                            Set up your driver profile
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                            Before you can go online, we need a delivery profile linked to your
                            account. This only takes a moment.
                        </p>
                        <button
                            type="button"
                            disabled={isCreating || !userId}
                            onClick={async () => {
                                if (!userId) return;
                                try {
                                    await createProfile({
                                        userId,
                                        email: session?.user?.email ?? undefined,
                                        isOnline: false,
                                    }).unwrap();
                                    toast({
                                        title: "Profile created",
                                        description: "You can now go online to receive deliveries.",
                                    });
                                    refetch();
                                } catch {
                                    toast({
                                        title: "Could not create profile",
                                        description: "Make sure delivery-service is running and try again.",
                                        variant: "destructive",
                                    });
                                }
                            }}
                            className="mt-4 inline-flex rounded-full bg-green-600 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                        >
                            {isCreating ? "Creating…" : "Create driver profile"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-6 text-sm text-red-900">
                <p className="font-semibold">Could not load your driver profile</p>
                <p className="mt-1 text-red-800/90">Try refreshing the page.</p>
            </div>
        );
    }

    const handleToggle = async (isOnline: boolean) => {
        if (!userId || profile.isOnline === isOnline) return;
        try {
            await updateAvailability({ userId, isOnline }).unwrap();
            toast({
                title: isOnline ? "You are online" : "You are offline",
                description: isOnline
                    ? "You are eligible for new delivery assignments."
                    : "You will not receive new assignments while offline.",
            });
        } catch {
            toast({
                title: "Could not update status",
                description: "Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div
            className={cn(
                "rounded-2xl border bg-white p-6 transition-colors",
                profile.isOnline ? "border-green-200" : "border-gray-100"
            )}
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <span
                        className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                            profile.isOnline
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                        )}
                    >
                        {profile.isOnline ? (
                            <Wifi className="h-5 w-5" />
                        ) : (
                            <WifiOff className="h-5 w-5" />
                        )}
                    </span>
                    <div>
                        <h2 className="font-[Poppins] text-lg font-bold text-gray-900">
                            {compact ? "Availability" : "Go online for deliveries"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                            {profile.isOnline
                                ? "You are visible to the dispatch system and can receive auto-assigned orders."
                                : "Stay offline when you are not available. Turn online when you are ready to deliver."}
                        </p>
                        {!compact && profile.vehicleType ? (
                            <p className="mt-2 text-xs text-gray-400">
                                {profile.vehicleType}
                                {profile.licensePlate ? ` · ${profile.licensePlate}` : ""}
                            </p>
                        ) : null}
                    </div>
                </div>
                <span
                    className={cn(
                        "rounded-full border px-3 py-1 text-xs font-bold",
                        profile.isOnline
                            ? "border-green-200 bg-green-50 text-green-800"
                            : "border-gray-200 bg-gray-50 text-gray-600"
                    )}
                >
                    {profile.isOnline ? "Online" : "Offline"}
                </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
                <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleToggle(false)}
                    className={cn(
                        "rounded-xl border px-4 py-3 text-sm font-bold transition-colors",
                        !profile.isOnline
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    )}
                >
                    Offline
                </button>
                <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleToggle(true)}
                    className={cn(
                        "rounded-xl border px-4 py-3 text-sm font-bold transition-colors",
                        profile.isOnline
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-green-200 bg-green-50 text-green-700 hover:border-green-300"
                    )}
                >
                    {isUpdating ? "Updating…" : "Online"}
                </button>
            </div>
        </div>
    );
}
