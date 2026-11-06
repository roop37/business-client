"use client";

import { installDemoFetch } from "@/utils/demo/externalFetch";

// Runs at module load in the browser so it is in place before any effect fires.
if (typeof window !== "undefined") installDemoFetch();

/** Mounts the client-side demo plumbing (external-request shield). Renders nothing. */
export const DemoBootstrap = () => null;
export default DemoBootstrap;
