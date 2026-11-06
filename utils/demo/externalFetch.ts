/**
 * Demo mode must never talk to third-party services. This wraps window.fetch so
 * any cross-origin request (Cloudinary uploads, IFSC lookups, CSV downloads,
 * analytics …) is answered locally with a harmless, plausible response.
 * Same-origin requests (our own /api stubs) pass through untouched.
 */
const fileToDataUrl = (file: Blob) =>
  new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => resolve("/demo/logo.svg");
    r.readAsDataURL(file);
  });

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const installDemoFetch = () => {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.__demoFetchInstalled) return;
  w.__demoFetchInstalled = true;
  const real = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    let abs: URL;
    try {
      abs = new URL(url, window.location.href);
    } catch {
      return real(input, init);
    }
    if (abs.origin === window.location.origin) return real(input, init);

    if (abs.hostname.includes("cloudinary.com")) {
      const file = init?.body instanceof FormData ? (init.body.get("file") as Blob | null) : null;
      const secure_url = file ? await fileToDataUrl(file) : "/demo/flyer-1.svg";
      return json({ secure_url, url: secure_url, public_id: `demo/${Date.now()}`, width: 800, height: 1000 });
    }
    if (abs.hostname.includes("ifsc.razorpay.com")) {
      return json({ BANK: "HDFC Bank", BRANCH: "Indiranagar", IFSC: abs.pathname.slice(1), CITY: "Bengaluru" });
    }
    if (/\.csv(\?|$)/i.test(abs.pathname)) {
      return new Response("email,name\naarav@example.com,Aarav Sharma\n", { status: 200, headers: { "content-type": "text/csv" } });
    }
    return json({});
  };
};
