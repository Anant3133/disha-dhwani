// utils/token.js

/**
 * @param {object} sessionData 
 * @param {string} sessionData.token 
 * @param {string} sessionData.userId 
 * @param {string} sessionData.userRole
 */
export const saveToken = ({ token, userId, userRole }) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userRole', userRole);
};

/**
 * 
 * @returns {{token: string, userId: string, userRole: string}|null} 
 */
export const getToken = () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (token && userId && userRole) {
        return { token, userId, userRole };
    }
    return null;
};

export const removeToken = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
};