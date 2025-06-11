import { Message } from '../models/Message.mjs';
import { chatWithAI } from './aiController.mjs';
import User from '../models/User.mjs';
import { Comment } from '../models/Comment.mjs';
import Post from '../models/Post.mjs';
import { Like } from '../models/Like.mjs';

const onlineUsers = {};

export default async function initSocket(io) {
    io.on('connection', async (socket) => {
        const userId = socket.user?.id;
        if (userId) {
            onlineUsers[userId] = socket.id;
            io.emit('updateOnlineUsers', Object.keys(onlineUsers));
        }

        // Handle follow updates
        socket.on('followUpdate', async (data) => {
            try {
                io.emit('followUpdate', data);
            } catch (error) {
                console.error('Error emitting followUpdate event:', error);
            }
        });

        // Handle new posts
        socket.on('newPost', async (post) => {
            try {
                io.emit('newPost', post);
            } catch (error) {
                console.error('Error emitting newPost event:', error);
            }
        });

        // Handle comments
        socket.on('sendComment', async (data) => {
            if (!userId) {
                socket.emit('errorMessage', { message: 'Authentication required' });
                return;
            }

            const { postId, content } = data;
            if (!postId || !content) {
                socket.emit('errorMessage', { message: 'Missing required fields' });
                return;
            }

            try {
                const post = await Post.findByPk(postId);
                if (!post) {
                    socket.emit('errorMessage', { message: 'Post not found' });
                    return;
                }

                const newComment = await Comment.create({
                    content,
                    userId,
                    postId,
                    createdAt: new Date()
                });

                const commenter = await User.findByPk(userId, {
                    attributes: ['id', 'username', 'profilePic']
                });

                const commentData = {
                    postId,
                    comment: {
                        ...newComment.toJSON(),
                        User: commenter
                    }
                };

                io.emit('newComment', commentData);
            } catch (err) {
                console.error('Error creating comment:', err);
                socket.emit('errorMessage', { message: 'Failed to send comment' });
            }
        });

        // Handle post likes
        socket.on('likePost', async (postId) => {
            if (!userId) {
                socket.emit('errorMessage', { message: 'Authentication required' });
                return;
            }

            try {
                const post = await Post.findByPk(postId);
                if (!post) {
                    socket.emit('errorMessage', { message: 'Post not found' });
                    return;
                }

                const [like, created] = await Like.findOrCreate({
                    where: { postId, userLikeId: userId },
                    defaults: { postId, userLikeId: userId }
                });

                if (!created) {
                    await like.destroy();
                    post.likeCount = Math.max(0, post.likeCount - 1);
                } else {
                    post.likeCount += 1;
                }

                await post.save();
                io.emit('newLike', { postId, likeCount: post.likeCount });
            } catch (error) {
                console.error('Error handling like:', error);
                socket.emit('errorMessage', { message: 'Failed to process like' });
            }
        });

        // Handle post deletion
        socket.on('deletePost', async (postId) => {
            try {
                io.emit('deletePost', postId);
            } catch (error) {
                console.error('Error emitting deletePost event:', error);
            }
        });

        // Handle connection errors
        socket.on('connect_error', (error) => {
            console.error('Connection Error:', error);
        });

        // Handle sending messages
        socket.on('sendMessage', async (data) => {
            if (!userId) {
                socket.emit('errorMessage', { message: 'Authentication required' });
                return;
            }

            const { message, receiverId } = data;
            if (!message || !receiverId) {
                socket.emit('errorMessage', { message: 'Missing required fields' });
                return;
            }

            try {
                const g24secAI = await User.findOne({ where: { username: 'g24_ai' } });
                const isAIChat = receiverId === g24secAI?.id;

                // Save user message
                const userMessage = await Message.create({
                    senderId: userId,
                    receiverId,
                    message,
                    timestamp: new Date(),
                    isRead: false
                });

                // Emit to sender
                socket.emit('messageSent', {
                    ...userMessage.toJSON(),
                    isOwnMessage: true
                });

                if (isAIChat) {
                    const user = await User.findByPk(userId);
                    const aiResponse = await chatWithAI(user, message);

                    const aiMessage = await Message.create({
                        senderId: g24secAI.id,
                        receiverId: userId,
                        message: aiResponse,
                        timestamp: new Date(),
                        isRead: false
                    });

                    // Send AI response only to the original sender
                    io.to(socket.id).emit('receiveMessage', {
                        ...aiMessage.toJSON(),
                        isOwnMessage: false
                    });
                } else {
                    // Regular user-to-user message
                    const receiverSocketId = onlineUsers[receiverId];
                    if (receiverSocketId) {
                        // Send to receiver
                        io.to(receiverSocketId).emit('receiveMessage', {
                            ...userMessage.toJSON(),
                            isOwnMessage: false
                        });
                        
                        // Also send to sender (for their own chat window)
                        socket.emit('receiveMessage', {
                            ...userMessage.toJSON(),
                            isOwnMessage: true
                        });
                    }
                }
            } catch (err) {
                console.error('Error sending message:', err);
                socket.emit('errorMessage', { message: 'Failed to send message' });
            }
        });

        // Handle message read status
        socket.on('markAsRead', async (messageId) => {
            try {
                const message = await Message.findByPk(messageId);
                if (message && message.receiverId === userId) {
                    message.isRead = true;
                    await message.save();
                    
                    // Notify sender that their message was read
                    const senderSocketId = onlineUsers[message.senderId];
                    if (senderSocketId) {
                        io.to(senderSocketId).emit('messageRead', {
                            messageId: message.id
                        });
                    }
                }
            } catch (err) {
                console.error('Error marking message as read:', err);
            }
        });

        // Handle typing indicators
        socket.on('typing', ({ receiverId }) => {
            const receiverSocketId = onlineUsers[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('displayTyping', { 
                    senderId: userId 
                });
            }
        });

        socket.on('stopTyping', ({ receiverId }) => {
            const receiverSocketId = onlineUsers[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('hideTyping', { 
                    senderId: userId 
                });
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            if (userId) {
                delete onlineUsers[userId];
                io.emit('updateOnlineUsers', Object.keys(onlineUsers));
            }
        });
    });
}
