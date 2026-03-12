export function encodeCursor(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function decodeCursor(cursor) {
  if (!cursor) return null;
  return JSON.parse(
    Buffer.from(cursor, "base64").toString("utf8")
  );
}
