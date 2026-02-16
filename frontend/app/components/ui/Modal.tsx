'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export default function Modal({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const onDismiss = useCallback(() => {
        router.back();
    }, [router]);

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onDismiss();
        },
        [onDismiss]
    );

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onKeyDown]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md p-6 m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div onClick={onDismiss} className="absolute inset-0 -z-10 cursor-alias" />
                <button
                    onClick={onDismiss}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {children}
            </div>
            <div onClick={onDismiss} className="absolute inset-0 -z-10" />
        </div>
    );
}
