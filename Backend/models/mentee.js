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
        name: {
            type: DataTypes.STRING,
            allowNull: true, 
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true, 
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: true, 
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        current_learning_interest: {
            type: DataTypes.STRING, 
            allowNull: true,
        },
        learning_level: {
            type: DataTypes.ENUM('Beginner', 'Amateur', 'Pro', 'Unknown'),
            defaultValue: 'Unknown',
            allowNull: false,
        },
        language_preference: {
            type: DataTypes.STRING, 
            defaultValue: 'en',
            allowNull: false,
        },
        onboarding_status: {
            type: DataTypes.ENUM('Incomplete', 'Complete'),
            defaultValue: 'Incomplete',
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'in_call'),
            defaultValue: 'active',
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