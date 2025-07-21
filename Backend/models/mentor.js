// models/mentor.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Mentor = sequelize.define('Mentor', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        expertise_areas: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'on_call'),
            defaultValue: 'active',
            allowNull: false,
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true,
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
        tableName: 'mentors',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    Mentor.associate = (models) => {
        Mentor.hasMany(models.MentorshipRequest, {
            foreignKey: 'assigned_mentor_id',
            as: 'assignedRequests'
        });
    };

    return Mentor;
};