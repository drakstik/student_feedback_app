'use strict';
import { Model } from "sequelize";

export class Feedback extends Model { }

export default (sequelize, DataTypes) => {
    Feedback.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Feedback",
        }
    );

    return Feedback;
};