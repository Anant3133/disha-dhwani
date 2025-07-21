// dtos/authDto.js

class LoginRequestDto {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}

class RegisterUserRequestDto {
    constructor(name, email, password, contact_number, role, expertise_areas = []) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.contact_number = contact_number;
        this.role = role; // 'admin', 'mentor', 'mentee'
        this.expertise_areas = expertise_areas; // Only relevant for 'mentor'
    }
}

class AuthResponseDto {
    constructor(token, user, role) { // 'user' can be Admin, Mentor, or Mentee instance
        this.token = token;
        this.role = role; // The role that was successfully authenticated

        this.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            contactNumber: user.contact_number,
            // Role-specific fields
            ...(role === 'admin' && { // If user is an Admin
                // Admin might have specific fields here if added to model
            }),
            ...(role === 'mentor' && { // If user is a Mentor
                expertiseAreas: user.expertise_areas,
                status: user.status
            }),
            ...(role === 'mentee' && { // If user is a Mentee
                currentLearningInterest: user.current_learning_interest,
                learningLevel: user.learning_level,
                languagePreference: user.language_preference
            })
        };
    }
}

module.exports = {
    LoginRequestDto,
    RegisterUserRequestDto,
    AuthResponseDto
};