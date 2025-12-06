(() => {
  const currentScript = document.currentScript;
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
  if (slots.length === 0) return;

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
        const img = new Image();
        img.src = ad.image_url;
        img.style.width = "100%";
        img.style.border = "0";

        img.addEventListener("load", () => {
          fireTrack(ad.tracking_id, "view", base);
        });

        const link = document.createElement("a");
        link.href = ad.click_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.addEventListener("click", () => fireTrack(ad.tracking_id, "click", base));

        link.appendChild(img);
        container.innerHTML = "";
        container.appendChild(link);
      })
      .catch((err) => {
        console.warn("[DolpAds] Failed to load ad:", err?.message ?? err);
      });
  }

  function fireTrack(trackingId, type, base) {
    const payload = JSON.stringify({ tracking_id: trackingId, type });
    // Try sendBeacon first to avoid blocking navigations.
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(`${base}/api/track`, payload);
      if (ok) return;
    }

    fetch(`${base}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
})();

