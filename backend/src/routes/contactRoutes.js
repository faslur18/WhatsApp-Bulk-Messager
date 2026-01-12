import express from 'express';
import multer from 'multer';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  uploadContacts,
  tagContacts,
  getTags,
} from '../controllers/contactController.js';

const router = express.Router();

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv') || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  },
});

// Routes
router.get('/', getContacts);
router.get('/tags', getTags);
router.get('/:id', getContactById);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.post('/upload', upload.single('file'), uploadContacts);
router.post('/tag', tagContacts);

export default router;
