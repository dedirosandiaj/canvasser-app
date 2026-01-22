// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, ErrorBoundary } from "solid-js";
import { MetaProvider, Title, Meta, Link } from "@solidjs/meta";
import "./app.css";

// Global loading fallback
function GlobalLoader() {
    return (
        <div class="flex items-center justify-center min-h-screen bg-pjp-gray-950">
            <div class="flex flex-col items-center gap-4">
                <svg
                    class="w-10 h-10 animate-spin text-pjp-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                    />
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
                <span class="text-pjp-gray-400 text-sm">Loading...</span>
            </div>
        </div>
    );
}

// Global error fallback
function GlobalError(props: { error: Error }) {
    return (
        <div class="flex items-center justify-center min-h-screen bg-pjp-gray-950">
            <div class="text-center max-w-md mx-auto p-6">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-pjp-red-500/20 flex items-center justify-center">
                    <svg
                        class="w-8 h-8 text-pjp-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h1 class="text-xl font-bold text-white mb-2">Something went wrong</h1>
                <p class="text-pjp-gray-400 mb-4">
                    {props.error.message || "An unexpected error occurred"}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    class="px-4 py-2 bg-pjp-blue-600 hover:bg-pjp-blue-700 text-white rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <Router
            root={(props) => (
                <MetaProvider>
                    {/* Default meta tags */}
                    <Title>Store Visit Form</Title>
                    <Meta charset="utf-8" />
                    <Meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, interactive-widget=resizes-content" />
                    <Meta name="description" content="Store Visit Form" />
                    <Meta name="theme-color" content="#111827" />
                    
                    {/* PWA Manifest & Icons */}
                    <Link rel="manifest" href="/manifest.webmanifest" />
                    <Link rel="apple-touch-icon" href="/favicon.ico" />
                    <Meta name="apple-mobile-web-app-capable" content="yes" />
                    <Meta name="apple-mobile-web-app-status-bar-style" content="black" />

                    <ErrorBoundary fallback={(err) => <GlobalError error={err} />}>
                        <Suspense fallback={<GlobalLoader />}>
                            {props.children}
                        </Suspense>
                    </ErrorBoundary>
                </MetaProvider>
            )}
        >
            <FileRoutes />
        </Router>
    );
}
