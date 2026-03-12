import { pool } from "../../db/pool.js";

const ALLOWED_PROFILE_FIELDS = [
  "full_name",
  "profile_photo",
  "date_of_birth",
  "gender",
  "address_text",
  "city",
  "state",
  "country",
  "latitude",
  "longitude",
  "google_place_id",
  "bio"
];
export async function upsertUserProfile(userId, data) {
  const safeData = Object.fromEntries(
    Object.entries(data).filter(([key]) =>
      ALLOWED_PROFILE_FIELDS.includes(key)
    )
  );

  const fields = Object.keys(safeData);
  if (!fields.length) return;

  const updates = fields.map(
    (k, i) => `${k} = $${i + 2}`
  ).join(", ");

  await pool.query(
    `
    INSERT INTO user_profiles (user_id, ${fields.join(", ")})
    VALUES ($1, ${fields.map((_, i) => `$${i + 2}`).join(", ")})
    ON CONFLICT (user_id)
    DO UPDATE SET ${updates}, updated_at = now()
    `,
    [userId, ...Object.values(safeData)]
  );
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return rows[0];
}

export async function createSession({ userId, deviceType, browser, ip }) {
  const { rows } = await pool.query(
    `INSERT INTO user_sessions (user_id, device_type, browser, ip_address)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [userId, deviceType, browser, ip]
  );
  return rows[0];
}

export async function findUserById(id) {
  const { rows } = await pool.query(
    "SELECT id, role FROM users WHERE id = $1",
    [id]
  );
  return rows[0];
}
