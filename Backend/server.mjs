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
   // Handle POST requests to send data to Discord
   app.post('/send-to-discord', (req, res) => {
       const { name, email, message } = req.body;
       const webhookURL = 'https://discord.com/api/webhooks/1311794677564837908/X-zteBu1CyS6UjDqsbBFfjPpjCYayVTHoL0hS_fF1tOzRJLPXkWT3hY2nTcVphcqd1gP';

       const payload = {
           content: `**New Contact Form Submission**\n**Name:** ${name}\n**Email:** ${email}\n**Message:** ${message}`
       };

       fetch(webhookURL, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify(payload)
       })
       .then(response => {
           if (response.ok) {
               res.status(200).send('Message sent successfully!');
           } else {
               res.status(500).send('Failed to send message.');
           }
       })
       .catch(error => {
           console.error('Error:', error);
           res.status(500).send('Error sending message.');
       });
   });

   // Start the web server
   app.listen(PORT, () => {
       console.log(`Server is running on port ${PORT}`);
   });

   // Start the Discord bot
   startBot();
   