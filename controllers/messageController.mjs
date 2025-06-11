import { Message } from "../models/Message.mjs";
import User from "../models/User.mjs";
import sqz from '../config/db.mjs';

export const getUserMessages = async (req, res) => {
    const userId = req.user.id;

    try {
        // Query to fetch user messages and unread count
        const userMsgD = await Message.findAll({
            attributes: [
                [sqz.col('receiver.id'), 'id'],
                [sqz.col('receiver.username'), 'username'],
                [sqz.col('receiver.profilePic'), 'profilePic'],
                // Unread count using parameterized subquery
                [sqz.literal(`(
                    SELECT COUNT(*)
                    FROM "Messages" AS m 
                    WHERE m."senderId" = "receiver"."id"
                    AND m."receiverId" = :userId
                    AND m."isRead" = false
                )`), 'unreadCount']
            ],
            where: { senderId: userId },
            group: ['receiver.id', 'receiver.username', 'receiver.profilePic'],
            include: [
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username', 'profilePic'], // Ensure we're including these fields
                    required: false
                }
            ],
            order: [[sqz.col('receiver.username'), 'ASC']],
            // Pass the userId as a parameter to the query
            replacements: { userId }
        });

        const user = await User.findOne({ where: { id: userId } });
	const g24secAI = await User.findOne({ where: { username: 'g24_ai' } });

        // Check if userMsgD contains data
        if (!userMsgD || userMsgD.length === 0) {
            return res.render('message', {
                user,
                users: [],
                g24secAI: { id: g24secAI.id, username: g24secAI.username, profilePic: g24secAI.profilePic, unreadCount: 0 }
            });
        }

        // Filter out G24Sec AI from the user messages
        const filteredUserMsgD = userMsgD.filter(msg => msg.receiver && msg.receiver.username !== 'g24_ai');

        // Fetch unread count for G24Sec AI
        const g24secAIUnreadCount = await Message.count({
            where: {
                senderId: g24secAI.id, 
                receiverId: userId,
                isRead: false
            }
        });

        // Fetch unread count for the other direction (userId to G24Sec AI)
        const userToG24secAIUnreadCount = await Message.count({
            where: {
                senderId: userId, 
                receiverId: g24secAI.id,
                isRead: false
            }
        });

        // Combine both unread counts for G24Sec AI
        const totalG24secAIUnreadCount = g24secAIUnreadCount + userToG24secAIUnreadCount;

        // Render messages and include G24Sec AI unread count
        res.render('message', { 
            user,
            users: filteredUserMsgD, 
            g24secAI: { id: g24secAI.id, username: g24secAI.username, profilePic: g24secAI.profilePic, unreadCount: totalG24secAIUnreadCount }
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).render('error', { message: "Something went wrong." });
    }
};



// fetch messages between users
export const getChat = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    const messages = await Message.findAll({
        where: {
            senderId: [currentUserId, userId],
            receiverId: [currentUserId, userId]
        },
        order: [['timestamp', 'ASC']],
    });

    // mark messages aas read if currentUser is reciever
    await Message.update({ isRead: true }, { where: { receiverId: currentUserId, senderId: userId, isRead: false } });

    const user = await User.findOne({ where: { id: currentUserId } });

    const g24secAI = await User.findOne({ where: { username: "G24Sec AI" } } );
  

    const receiver = await User.findByPk(userId, { attributes: ['id', 'username', 'profilePic' ] });

    res.render('chat', { user, messages, receiver, g24secAI });
};

// mark messages read mannually , its an if needed
export const markMessagesAsRead = async (req, res) => {
    const { senderId } = req.body; // the convo partner
    const receiverId = req.user.id;

    try {
        await Message.update({ isRead: true}, { where: { senderId, receiverId, isRead: false } });
        res.json({ message: ' message marked as read' });
    } catch (err) {
        console.error('Error marking messages as read:', err);
        res.status(500).send('Something went wrong.');
    }
};
