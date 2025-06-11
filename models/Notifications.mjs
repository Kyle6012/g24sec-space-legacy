import { DataTypes } from "sequelize";
import sqz from '../config/db.mjs';

export const Notification = sqz.define('Notification',{
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isUniversal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
});