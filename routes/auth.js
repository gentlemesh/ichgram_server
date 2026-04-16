import express from 'express';

import { login, register, restore, autologin } from '../controllers/auth.js';
import { validationRules } from '../services/requestValidation.js';

const router = express.Router();

router.post('/login', validationRules.auth.login, login);
router.post('/register', validationRules.auth.register, register);
router.post('/restore', validationRules.auth.restore, restore);
router.post('/autologin/:id', validationRules.auth.autologin, autologin);

export default router;