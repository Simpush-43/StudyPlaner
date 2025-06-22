import express from 'express'
import {
  getSessions,
  CreateSessions,
  UpdateSession,
  MarkSession,
  ToggleSession,
  DeleteSession,
} from '../Controllers/SessionController.js'

const router = express.Router();

// diffrent routes

router.get('/getSession',getSessions);
router.post('/createSession',CreateSessions);
router.put(`/:id`,UpdateSession);
router.delete('/delete/:id',DeleteSession);
router.patch('/toggle/:id',ToggleSession);
router.patch('/mark/:id',MarkSession)

export default router