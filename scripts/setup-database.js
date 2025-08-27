const { execSync } = require('child_process');
const path = require('path');

console.log('Setting up Helios database...\n');

try {
    // Change to the project root directory
    process.chdir(path.join(__dirname, '..'));
    
    console.log('1. Creating database migration...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    
    console.log('\n2. Database setup complete!');
    console.log('You can now run the import script to populate the database with Greek literature.');
    
} catch (error) {
    console.error('Database setup failed:', error.message);
    process.exit(1);
}
