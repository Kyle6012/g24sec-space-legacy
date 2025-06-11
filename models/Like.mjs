import { DataTypes } from "sequelize";
import sqz from '../config/db.mjs';

export const Like = sqz.define('Like', {
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    postId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model : "Posts",
            key: "id",
        }
    },
});