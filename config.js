module.exports = {
    PORT: process.env.PORT || 8080,
    SESSION_STORAGE_URL: process.env.PORT || 'mongodb://localhost/session_storage',
    SECRET: process.env.SECRET || 'A very secure string'
}