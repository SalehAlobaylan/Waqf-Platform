"use client";

// Better Auth does not require a React context provider.
// Sessions are managed via cookie-based API calls through the auth client.
// This component is kept as a passthrough for compatibility.

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    return <>{children}</>;
}
