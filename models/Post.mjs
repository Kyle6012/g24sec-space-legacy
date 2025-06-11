import { DataTypes } from "sequelize";
import sqz from '../config/db.mjs';

const Post = sqz.define('Post', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "Users",
            key: "id",
            onDelete:"CASCADE",
        },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mediaType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    likeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
});


export default Post;