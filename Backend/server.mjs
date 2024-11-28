   // server.js or server.mjs
   import express from 'express';
   import path from 'path';
   import { fileURLToPath } from 'url';
   import { dirname } from 'path';
   import { startBot } from './bot.js'; // Import your bot logic

   const __filename = fileURLToPath(import.meta.url);
   const __dirname = dirname(__filename);

   const app = express();
   const PORT = process.env.PORT || 3000; // Use the PORT environment variable

   // Serve static files from the "public" directory
   app.use(express.static(path.join(__dirname, '../Frontend')));

   // Start the web server
   app.listen(PORT, () => {
       console.log(`Server is running on port ${PORT}`);
   });

   // Start the Discord bot
   startBot();