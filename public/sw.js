/**
 * Service Worker para Web Push (notificações no dispositivo).
 * Funciona em Android, iOS (PWA), desktop (Chrome, Firefox, Edge, Safari).
 */
self.addEventListener("push", function (event) {
  if (!event.data) return;
  let payload = { title: "CazéApp", body: "", url: "/pages/user/notifications" };
  try {
    payload = event.data.json();
  } catch (_) {
    payload.body = event.data.text();
  }
  const title = payload.title || "CazéApp";
  const options = {
    body: payload.body || "",
    icon: "/logo/logo-android.png",
    badge: "/logo/logo-android.png",
    tag: payload.notification_id ? `n1-${payload.notification_id}` : "n1-notification",
    data: {
      url: payload.url || "/pages/user/notifications",
      notification_id: payload.notification_id,
    },
    renotify: true,
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/pages/user/notifications";
  const fullUrl = new URL(url, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope) && "focus" in client) {
          client.navigate(fullUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(fullUrl);
      }
    })
  );
});
