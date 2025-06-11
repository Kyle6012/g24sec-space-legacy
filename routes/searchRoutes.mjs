import express from 'express';
import { searchUsers } from '../controllers/searchController.mjs';

const router = express.Router();

router.get('/', searchUsers);

export default router;