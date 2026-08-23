"use client";

import { useEffect } from "react";

const LOADER_SRC = "https://widgets.leadconnectorhq.com/loader.js";
const RESOURCES_URL = "https://widgets.leadconnectorhq.com/chat-widget/loader.js";
const WIDGET_ID = "6a4181e0cf2c64bbfaae4ef2";

/**
 * Mounts the HighLevel A2P chat widget, and — the reason this is a component
 * rather than a plain <Script> — removes it again on unmount.
 *
 * The loader appends a <chat-widget> element to <body>, outside the React
 * tree. Leaving /sms through a client-side navigation tears down the route but
 * not that element, so the launcher stayed pinned to the corner of the
 * homepage. Carrier review expects the widget on /sms only, so it has to go
 * when the route does.
 *
 * Only the DOM the widget renders is cleaned up. The library <script> tags it
 * adds to <head> are left alone: once a script has executed, removing its tag
 * unloads nothing, and they render no UI without a <chat-widget> element to
 * upgrade. Leaving them also lets a return trip to /sms re-render instantly
 * from the already-defined custom element.
 */
export function SmsChatWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = LOADER_SRC;
    script.dataset.resourcesUrl = RESOURCES_URL;
    script.dataset.widgetId = WIDGET_ID;
    script.dataset.source = "WEB_USER";
    document.body.appendChild(script);

    return () => {
      script.remove();
      document.querySelectorAll("chat-widget").forEach((el) => el.remove());
    };
  }, []);

  return null;
}
