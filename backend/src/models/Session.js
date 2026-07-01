import { query } from '../config/database.js';

const normalizeSession = (row) => ({
  ...row,
  uploaded_files: row.uploaded_files || [],
});

export const createSession = async (sessionData) => {
  const {
    userId,
    title,
    patientName,
    visitType = 'routine',
    transcript = '',
    soapNote = null,
    duration = 0,
    status = 'draft',
    uploadedFiles = [],
  } = sessionData;

  const result = await query(
    `INSERT INTO sessions (
      user_id, title, patient_name, visit_type, transcript, soap_note, duration, status, uploaded_files, created_date, updated_date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW(), NOW())
    RETURNING *`,
    [
      userId,
      title || null,
      patientName || null,
      visitType,
      transcript,
      soapNote,
      duration,
      status,
      JSON.stringify(uploadedFiles),
    ]
  );

  return normalizeSession(result.rows[0]);
};

export const listSessionsByUser = async (userId) => {
  const result = await query(
    `SELECT * FROM sessions
     WHERE user_id = $1
     ORDER BY created_date DESC, id DESC`,
    [userId]
  );

  return result.rows.map(normalizeSession);
};

export const findSessionById = async (sessionId, userId) => {
  const result = await query(
    `SELECT * FROM sessions
     WHERE id = $1 AND user_id = $2`,
    [sessionId, userId]
  );

  return result.rows[0] ? normalizeSession(result.rows[0]) : null;
};

export const updateSession = async (sessionId, userId, sessionData) => {
  const {
    title,
    patientName,
    visitType,
    transcript,
    soapNote,
    duration,
    status,
    uploadedFiles,
  } = sessionData;

  const result = await query(
    `UPDATE sessions
     SET title = COALESCE($3, title),
         patient_name = COALESCE($4, patient_name),
         visit_type = COALESCE($5, visit_type),
         transcript = COALESCE($6, transcript),
         soap_note = COALESCE($7, soap_note),
         duration = COALESCE($8, duration),
         status = COALESCE($9, status),
         uploaded_files = COALESCE($10::jsonb, uploaded_files),
         updated_date = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [
      sessionId,
      userId,
      title ?? null,
      patientName ?? null,
      visitType ?? null,
      transcript ?? null,
      soapNote ?? null,
      duration ?? null,
      status ?? null,
      uploadedFiles ? JSON.stringify(uploadedFiles) : null,
    ]
  );

  return result.rows[0] ? normalizeSession(result.rows[0]) : null;
};

export const deleteSession = async (sessionId, userId) => {
  const result = await query(
    'DELETE FROM sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId]
  );

  return result.rowCount > 0;
};

export default {
  createSession,
  listSessionsByUser,
  findSessionById,
  updateSession,
  deleteSession,
};