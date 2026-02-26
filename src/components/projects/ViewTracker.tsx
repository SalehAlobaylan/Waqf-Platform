"use client";

import { useEffect, useRef } from "react";

export function ViewTracker({ projectId }: { projectId: string }) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        tracked.current = true;

        // Fire and forget
        fetch(`/api/projects/${projectId}/view`, { method: "POST" }).catch(() => { });
    }, [projectId]);

    return null;
}
