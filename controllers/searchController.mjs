import User from '../models/User.mjs';
import { Op } from 'sequelize';

export const searchUsers = async (req, res) => {
    const query = req.query.q;
    
    if (!query) return res.render('search', { users: [] });

    try {
        const users = await User.findAll({
            where: {
                username: { [Op.iLike]: `%${query}%` }, // case insensitive search
            },
        });

        res.render('search', { users });
    } catch (error) {
        console.error(error); // Catch any errors from the query
        res.status(500).send('Internal Server Error');
    }
};
