// src/modules/notifications/notifications.controller.js
import * as service from "./notifications.service.js";
import {
  addClient,
  removeClient
} from "./notification.stream.js";
/* =========================
   NOTIFICATIONS
========================= */
export function streamNotifications(req, res) {
  const userId = req.user.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  // initial handshake
  res.write(`event: connected\ndata: {}\n\n`);

  addClient(userId, res);

  req.on("close", () => {
    removeClient(userId, res);
  });
}

export async function getNotifications(req, res) {
  const data = await service.getMyNotifications(req.user.id);
  res.json({ success: true, data });
}

export async function markRead(req, res) {
  await service.readNotification(req.params.id, req.user.id);
  res.json({ success: true });
}

export async function markAllRead(req, res) {
  await service.readAllNotifications(req.user.id);
  res.json({ success: true });
}

/* =========================
   PREFERENCES
========================= */

export async function getPreferences(req, res) {
  const data = await service.getMyPreferences(req.user.id);
  res.json({ success: true, data });
}

export async function updatePreferences(req, res) {
  await service.savePreferences(req.user.id, req.body);
  res.json({ success: true });
}
