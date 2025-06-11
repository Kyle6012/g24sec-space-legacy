import { Notification } from "../models/Notifications.mjs";

// universal notification
export const createNotification = async (req, res) => {
    const { title, message } = req.body;
    try {
        await Notification.create({ title, message, isUniversal: true });
        res.redirect('/admin/dashboard');
    } catch (e){
        console.error(e.message);
        res.render('error', { message: 'failed to create notification' });
    }
};

// fetch notifications for users
export const fetchNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({ where: { isUniversal: true } });
        res.json(notifications);
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'failed to fetch notifications' });
    }
};