// models/mentorshipRequest.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MentorshipRequest = sequelize.define('MentorshipRequest', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        mentee_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'mentees', // refers to table name
                key: 'id',
            },
        },
        requested_topic: {
            type: DataTypes.STRING, // e.g., 'agriculture:crop_management'
            allowNull: false,
        },
        requested_level: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'unknown'),
            defaultValue: 'unknown',
            allowNull: false,
        },
        language_requested: {
            type: DataTypes.STRING, // e.g., 'en-IN', 'hi-IN'
            allowNull: false,
        },
        request_status: {
            type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
            defaultValue: 'pending',
            allowNull: false,
        },
        ai_transcript: {
            type: DataTypes.TEXT, // Full transcript from AI
            allowNull: true,
        },
        ai_classification: {
            type: DataTypes.JSONB, // JSON object from AI detailing intent, sub-topic, entities etc.
            allowNull: true,
        },
        assigned_mentor_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'mentors', // refers to table name
                key: 'id',
            },
        },
        mentor_notes: {
            type: DataTypes.TEXT, // Notes added by mentor after interaction
            allowNull: true,
        },
        requested_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        assigned_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'mentorship_requests',
        timestamps: true, // Sequelize will automatically manage createdAt and updatedAt
        createdAt: 'requested_at', // Use requested_at for createdAt
        updatedAt: 'updated_at', // Default updatedAt
    });

    // Define associations in the index.js or directly here if preferred
    MentorshipRequest.associate = (models) => {
        MentorshipRequest.belongsTo(models.Mentee, { foreignKey: 'mentee_id', as: 'mentee' });
        MentorshipRequest.belongsTo(models.Mentor, { foreignKey: 'assigned_mentor_id', as: 'assignedMentor' });
    };

    return MentorshipRequest;
};