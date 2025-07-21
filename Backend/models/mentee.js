// models/mentee.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Mentee = sequelize.define('Mentee', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        phone_number: {
            type: DataTypes.STRING, // Store with country code
            allowNull: false,
            unique: true,
        },
        current_learning_interest: {
            type: DataTypes.STRING, // e.g., 'agriculture:wheat_farming' based on AI classification
            allowNull: true,
        },
        learning_level: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'unknown'),
            defaultValue: 'unknown',
            allowNull: false,
        },
        language_preference: {
            type: DataTypes.STRING, // e.g., 'en-IN', 'hi-IN', 'te-IN'
            defaultValue: 'en-IN',
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'in_call'),
            defaultValue: 'active',
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
    }, {
        tableName: 'mentees',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Mentee;
};