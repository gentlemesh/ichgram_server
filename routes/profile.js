import express from 'express';

import { getProfile, updateProfile } from '../controllers/profile.js';
import { validationRules } from '../services/requestValidation.js';
import { uploadSingleFile } from '../middleware/uploadFiles.js';

const router = express.Router();

router.get('/', validationRules.profile.getCurrent, getProfile);
router.get('/:id', validationRules.profile.getById, getProfile);
router.post('/', uploadSingleFile('picture'), validationRules.profile.update, updateProfile);

export default router;