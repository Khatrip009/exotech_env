export function success(res, data, message = "OK") {
  return res.json({ success: true, message, data });
}
