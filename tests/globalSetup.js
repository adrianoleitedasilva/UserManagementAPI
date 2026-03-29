const { execSync } = require('child_process');
const path = require('path');

// Executado uma vez antes de todos os testes.
// Garante que o banco de teste existe e tem o schema aplicado.
module.exports = async () => {
  execSync('npx prisma db push --force-reset --skip-generate', {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'pipe',
  });
};
