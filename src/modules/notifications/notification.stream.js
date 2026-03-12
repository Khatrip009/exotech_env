// src/modules/notifications/notification.stream.js
// userId -> Set(res)
const clients = new Map();

export function addClient(userId, res) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId).add(res);
}

export function removeClient(userId, res) {
  const set = clients.get(userId);
  if (!set) return;

  set.delete(res);
  if (!set.size) {
    clients.delete(userId);
  }
}

export function pushToUser(userId, payload) {
  const set = clients.get(userId);
  if (!set) return;

  for (const res of set) {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }
}
