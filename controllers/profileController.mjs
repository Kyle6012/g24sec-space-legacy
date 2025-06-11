import User from '../models/User.mjs';
import Post from '../models/Post.mjs';
import imagekit from '../config/imagekit.mjs';
import fs from 'fs';
import { FileId } from '../utils/file.mjs';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { username: req.params.username },
            include: { model: Post }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.render('profile', { user, loggedInUserId: req.user.id });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Error fetching profile.' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { bio } = req.fields;
        
        if (!bio) return res.status(400).json({ message: "Bio is required" });

        await User.update({ bio }, { where: { id: req.user.id } });

        res.io.emit("profileUpdated", { username: req.user.username, bio });
        res.json({ message: "Profile updated successfully", bio });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Error updating profile.' });
    }
};

export const uploadProfilePic = async (req, res) => {
    const image = req.files.image;
    const fileName = `profile_${req.user.id}`;
    const fileBuffer = fs.readFileSync(image.path);

    const user = await User.findOne({ where: { id : req.user.id } });

    if (user.profilePic){
        try {
            await imagekit.deleteFile(FileId(user.profilePic));  
        } catch (e) {
            console.log("Error from imagekit: ", e.message);
        }
          
    }
    try {
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName,
            folder: 'profile-images',
            isPublished: true,
            timeout: 50000
        });

        if (response && response.url) {
            await User.update({ profilePic: response.url }, { where: { id: req.user.id } });

            res.io.emit("profileUpdated", { username: req.user.username, profilePic: response.url });

            fs.unlink(image.path, (err) => {
                if (err) console.error('Error deleting temporary file:', err);
            });

            res.json({ message: "Profile picture updated successfully", profilePic: response.url });
        } else {
            res.status(400).json({ message: 'Error uploading to ImageKit', error: 'No URL received from ImageKit' });
        }
    } catch (err) {
        console.error('Error uploading image to ImageKit:', err);
        res.status(500).json({ message: 'Error uploading profile picture', error: err.message });
    }
};
