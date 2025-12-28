// 临时检查用户认证状态的脚本
const { getUser, getAuthToken } = require('./authService');

console.log('Auth Token:', getAuthToken());
console.log('User:', getUser());
