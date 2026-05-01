import express from 'express';
import {
    uploadDocument,
    getDocuments,
    getDocument,
    // updateDocuemnt,
    deleteDocument,
} from '../controller/documentController.js';

import protect from '../middleware/auth.js';
import upload from '../config/multer.js';
import router from './authRoutes.js';

// all routes are protected
router.use(protect)

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);
// router.put('/:id', updateDocuemnt);

export default router;