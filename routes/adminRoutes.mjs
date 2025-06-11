import express from 'express';
import { AdminLogin, AdminDashboard } from '../controllers/adminController.mjs';
import { sendBatchEmail } from '../controllers/emailController.mjs';
import { createNotification } from '../controllers/notificationController.mjs';

const router = express.Router();

router.get('/auth/login', async (req, res) => {
    res.render('admin/login', { error_msg: req.flash('error_msg'), success_msg: req.flash('success_msg') });
});

router.post('/auth/login', AdminLogin);
router.get('/panel/dasboard', AdminDashboard);
router.post('/panel/dashboard/send-email', sendBatchEmail);
router.post('/panel/notify', createNotification);

export default router;
