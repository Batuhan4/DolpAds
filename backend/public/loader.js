(() => {
  // Find the script element - works with both static and dynamic injection
  let currentScript = document.currentScript;
  
  // Fallback: find script by src when dynamically injected (document.currentScript is null)
  if (!currentScript) {
    const scripts = document.querySelectorAll('script[src*="loader.js"]');
    currentScript = scripts[scripts.length - 1]; // Get the last one (most recently added)
  }

  const publisher = currentScript?.getAttribute("data-publisher");
  const apiBase =
    currentScript?.getAttribute("data-api") ??
    new URL(currentScript?.src ?? window.location.href).origin;

  if (!publisher) {
    console.warn("[DolpAds] Missing data-publisher on loader.js script tag");
    return;
  }

  // Query all slots; default selector matches PRD docs.
  const slots = Array.from(document.querySelectorAll("[data-dolpads-slot], .dolp-ad-slot"));
  if (slots.length === 0) {
    console.warn("[DolpAds] No ad slots found (.dolp-ad-slot or [data-dolpads-slot])");
    return;
  }

  slots.forEach((slot) => injectAd(slot, publisher, apiBase));

  function injectAd(container, publisherAddress, base) {
    const slotSize = container.getAttribute("data-slot") ?? "leaderboard";
    fetch(
      `${base}/api/serve?publisher_address=${encodeURIComponent(
        publisherAddress,
      )}&slot_size=${encodeURIComponent(slotSize)}`,
    )
      .then((res) => {
        if (res.status === 204) throw new Error("No ads available");
        return res.json();
      })
      .then((ad) => {
        const clickUrl = ad.click_url;

        // Create the link element FIRST
        const link = document.createElement("a");
        link.href = clickUrl || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.display = "block";
        link.style.setProperty("cursor", "pointer", "important");
        link.style.setProperty("pointer-events", "auto", "important");
        link.style.width = "100%";
        link.style.height = "100%";
        link.style.textDecoration = "none";
        
        // Track + force navigation on click to keep the banner usable in embeds
        link.addEventListener("click", (e) => {
          if (!clickUrl) return;
          e.preventDefault();
          fireTrack(ad.tracking_id, "click", base);
          window.open(clickUrl, "_blank", "noopener,noreferrer");
        });

        // Create the image
        const img = new Image();
        img.src = ad.image_url;
        img.alt = "Advertisement";
        img.style.width = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.border = "0";
        img.style.pointerEvents = "none";

        // Track view when image loads
        img.addEventListener("load", () => {
          fireTrack(ad.tracking_id, "view", base);
        });

        // Append image to link
        link.appendChild(img);
        
        // Clear container and add the clickable banner
        container.innerHTML = "";
        container.style.setProperty("cursor", "pointer", "important");
        container.style.setProperty("pointer-events", "auto", "important");
        container.appendChild(link);
      })
      .catch((err) => {
        console.warn("[DolpAds] Failed to load ad:", err?.message ?? err);
        container.innerHTML = '<div style="text-align:center;color:#888;padding:20px;">Ad could not be loaded</div>';
      });
  }

  function fireTrack(trackingId, type, base) {
    console.log(`[DolpAds] Tracking ${type} for ${trackingId}`);
    const payload = JSON.stringify({ tracking_id: trackingId, type });
    // Try sendBeacon first to avoid blocking navigations.
    if (navigator.sendBeacon) {
      const beaconPayload = new Blob([payload], { type: "application/json" });
      const ok = navigator.sendBeacon(`${base}/api/track`, beaconPayload);
      console.log(`[DolpAds] sendBeacon result: ${ok}`);
      if (ok) return;
    }

    fetch(`${base}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).then(res => {
      console.log(`[DolpAds] Track fetch response:`, res.status);
      return res.json();
    }).then(data => {
      console.log(`[DolpAds] Track result:`, data);
    }).catch((err) => {
      console.error(`[DolpAds] Track error:`, err);
    });
  }
})();
