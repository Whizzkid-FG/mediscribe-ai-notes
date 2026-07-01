import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createSession,
  listSessionsByUser,
  findSessionById,
  updateSession,
  deleteSession,
} from '../models/Session.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const sessions = await listSessionsByUser(req.user.userId);
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      code: 'SESSIONS_FETCH_ERROR',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const session = await findSessionById(req.params.id, req.user.userId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
    }

    res.json({ success: true, session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      code: 'SESSION_FETCH_ERROR',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const session = await createSession({
      userId: req.user.userId,
      title: req.body.title,
      patientName: req.body.patientName,
      visitType: req.body.visitType,
      transcript: req.body.transcript,
      soapNote: req.body.soapNote,
      duration: req.body.duration,
      status: req.body.status,
      uploadedFiles: req.body.uploadedFiles,
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save session',
      code: 'SESSION_CREATE_ERROR',
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const session = await updateSession(req.params.id, req.user.userId, {
      title: req.body.title,
      patientName: req.body.patientName,
      visitType: req.body.visitType,
      transcript: req.body.transcript,
      soapNote: req.body.soapNote,
      duration: req.body.duration,
      status: req.body.status,
      uploadedFiles: req.body.uploadedFiles,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
    }

    res.json({ success: true, session });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session',
      code: 'SESSION_UPDATE_ERROR',
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteSession(req.params.id, req.user.userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      code: 'SESSION_DELETE_ERROR',
    });
  }
});

export default router;