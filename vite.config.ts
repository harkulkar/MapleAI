import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const claimApiPlugin = () => ({
  name: 'claim-api-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === '/api/submit-claim' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const claim = JSON.parse(body);
            const filePath = path.resolve(__dirname, 'data', 'submitted-claims.json');
            let claims = [];
            if (fs.existsSync(filePath)) {
              try {
                claims = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
              } catch (e) {
                claims = [];
              }
            }
            claims.push(claim);
            if (!fs.existsSync(path.resolve(__dirname, 'data'))) {
              fs.mkdirSync(path.resolve(__dirname, 'data'));
            }
            fs.writeFileSync(filePath, JSON.stringify(claims, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to save claim' }));
          }
        });
      } else {
        next();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    claimApiPlugin()
  ],
  server: {
    watch: {
      ignored: ['**/data/submitted-claims.json']
    }
  }
})
