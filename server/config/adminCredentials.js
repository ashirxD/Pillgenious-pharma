/**
 * Hard-coded admin credentials
 * For production, use environment variables and proper password hashing
 */

const ADMIN_CREDENTIALS = [
  {
    id: 'admin_001',
    name: 'Super Admin',
    email: 'admin@pillgenious.com',
    password: 'Admin@123', // In production, this should be hashed
    role: 'admin'
  },
  {
    id: 'admin_002',
    name: 'Admin User',
    email: 'admin@admin.com',
    password: 'admin123',
    role: 'admin'
  }
];

module.exports = { ADMIN_CREDENTIALS };

