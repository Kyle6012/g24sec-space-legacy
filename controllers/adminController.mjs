import { Admin } from '../models/Admin.mjs';
import User from '../models/User.mjs';
import { Notification } from '../models/Notifications.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import  dotenv from 'dotenv';

dotenv.config();

export const AdminLogin = async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });

    if (admin && (await bcrypt.compare(password, admin.password))) {
        const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "5h" });
        res.cookie("adminToken", token,{ httpOnly: true });
        return res.redirect('/admin/panel/dashboard');
    } else {
        res.json({ message: "Invalid credentials" });
    }
};

export const AdminDashboard = async (req, res) => {
    const users = await User.findAll();
    const token = req.cookies.adminToken;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findOne({ where: { role: 'admin', id: decoded.id } });
    const notifications = await Notification.findAll();

    res.render('admin/dashboard', { admin, users, notifications });
};