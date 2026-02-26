/**
 * Vercel Edge Function: Africa's Talking USSD & SMS Proxy
 * This proxy tunnels latency-sensitive callbacks to the main Render backend.
 * 
 * Deployment: Place this file in [frontend-repo]/api/ussd.js
 */

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // 1. Parse Africa's Talking form-urlencoded body
    const formData = await req.formData();
    const params = Object.fromEntries(formData);

    // 2. Determine target based on payload
    const RENDER_URL = (process.env.RENDER_BACKEND_URL || "https://keja-yangu-api.onrender.com").replace(/\/$/, "");
    let targetPath = "/api/v1/internal/ussd";

    // 3. Forward to Render
    const backendRes = await fetch(`${RENDER_URL}${targetPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Vercel-Edge-Proxy": "true",
      },
      body: JSON.stringify(params),
    });

    if (!backendRes.ok) {
      console.error("Backend Error:", await backendRes.text());
      return new Response("END Service currently unavailable. Please try again later.", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 4. Return plain text response to Africa's Talking
    const responseText = await backendRes.text();
    return new Response(responseText, {
      headers: { "Content-Type": "text/plain" },
    });

  } catch (error) {
    console.error("Edge Proxy Error:", error);
    return new Response("END Sorry, a technical error occurred. Please try again.", {
      headers: { "Content-Type": "text/plain" },
    });
  }
}
