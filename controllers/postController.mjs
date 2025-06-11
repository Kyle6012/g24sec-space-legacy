import fs from 'fs';
import imagekit from '../config/imagekit.mjs';
import Post from '../models/Post.mjs';
import path from 'path';
import { FileId } from '../utils/file.mjs';

export const createPost = async (req, res) => {
    const { title, content } = req.fields;
    const userId = req.user.id;
    let mediaUrl = null, mediaType = null;

    if (req.files?.file) {
        const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
        const fileExtension = path.extname(file.name).toLowerCase();

        if (['.jpg', '.jpeg', '.png', '.gif', '.pdf'].includes(fileExtension)) {
            try {
                const fileBuffer = fs.readFileSync(file.path);
                const uploadData = await imagekit.upload({
                    file: fileBuffer,
                    fileName: `${fileExtension.slice(1)}_post_${userId}_${Date.now()}`,
                    folder: "post-media",
                    isPublished: true,
                    timeout: 50000
                });

                mediaUrl = uploadData.url;
                mediaType = fileExtension === '.pdf' ? 'pdf' : 'image';
                fs.unlinkSync(file.path);
            } catch (e) {
                return res.status(500).json({ message: "Error uploading media.", error: e.message });
            }
        } else {
            fs.unlinkSync(file.path);
        }
    }

    try {
        const newPost = await Post.create({
            userId, title, content, mediaUrl, mediaType
        });
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (e) {
        res.status(500).json({ message: "Error creating post", error: e.message });
    }
};

export const renderEditPage = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post || post.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized access." });
        res.render('editPost', { post });
    } catch {
        res.status(500).json({ message: 'Error loading post.' });
    }
};

export const editPost = async (req, res) => {
    const { title, content } = req.fields;
    console.log("request is ", req);
    const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;

    try {
        const post = await Post.findByPk(req.params.id);
        if (!post || post.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized access." });

        if (file) {
            const uploadResponse = await imagekit.upload({
                file: file.buffer.toString('base64'),
                fileName: file.originalname,
            });

            post.mediaUrl = uploadResponse.url;
            post.mediaType = file.mimetype.startsWith('image') ? 'image' : 'pdf';
            fs.unlinkSync(file.path);
        }

        post.title = title;
        post.content = content;
        await post.save();

        res.redirect('/feed');
    } catch (e) {
        res.status(500).json({ message: 'Error updating post.' });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post || post.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized access." });

        if (post.mediaUrl) {
            try {
                const fileId = FileId(post.mediaUrl); //extract file id from url
                console.log(post.mediaUrl);
                console.log("file id is: ",fileId);
                await imagekit.deleteFile(fileId);
                console.log(`File with ID ${fileId} deleted from ImageKit.`);
            } catch (e) {
                console.error("Error deleting media file from ImageKit:", e.message);
            }
        }

        await post.destroy();
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Error deleting post.' });
    }
};
