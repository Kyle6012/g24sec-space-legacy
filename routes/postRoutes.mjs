import express from 'express';
import Post from '../models/Post.mjs';
import { isAuthenticated } from '../middleware/authMiddleware.mjs';
import { createPost, editPost, deletePost, renderEditPage } from '../controllers/postController.mjs';
import User from '../models/User.mjs';
import formidable from 'express-formidable';
import path from 'path';
import { fileURLToPath } from 'url';
import { Comment } from '../models/Comment.mjs';
import { fetchLinkPreview } from '../utils/link.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.use(formidable({
    multiples: false,
    uploadDir: path.join(__dirname, '../uploads/post-media'),
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
}));

router.get('/create', isAuthenticated, (req, res) => res.render('createPost'));
router.post('/create', isAuthenticated, createPost);

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.findAll({
            order: [["createdAt", "DESC"]],
            include: [
                { model: User, attributes: ['profilePic', 'username','fullname'] },
                { model: Comment, attributes: ['content', 'id', 'postId', 'userId'], include: [{ model: User, attributes: ['profilePic', 'username', 'fullname'] }], order: [['createdAt', 'ASC']] } // Include associated comments and their users
            ],
        });

        for (let post of posts) {
            if (post.content) {
                const linkPreview = await fetchLinkPreview(post.content);
                post.linkPreview = linkPreview; 
            }
        }

        
        const user = await User.findOne({ where: { id: req.user.id } });
        res.render("feed", { user, posts });
    } catch (e) {
        console.error(e.message);
        res.render('error', { message: 'Error Fetching posts' });
    }
});

router.get('/edit/:id', isAuthenticated, renderEditPage);
router.post('/edit/:id', isAuthenticated, editPost);

router.post('/delete/:id', isAuthenticated, deletePost);

export default router;
