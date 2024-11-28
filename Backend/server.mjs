   // server.js or server.mjs
   import express from 'express';
   import { Client, GatewayIntentBits } from 'discord.js';
   import path from 'path';
   import { fileURLToPath } from 'url';
   import { dirname } from 'path';

   const __filename = fileURLToPath(import.meta.url);
   const __dirname = dirname(__filename);

   const app = express();
   const PORT = process.env.PORT || 3000;

   // Middleware to parse JSON bodies
   app.use(express.json());

   // Serve static files
   app.use(express.static(path.join(__dirname, '../Frontend')));

   // Discord bot setup
   const client = new Client({
     intents: [
       GatewayIntentBits.Guilds,
       GatewayIntentBits.GuildMessages,
       GatewayIntentBits.MessageContent,
     ],
   });

   client.once('ready', () => {
     console.log('Bot is online!');
   });

   // Endpoint to handle contact form submissions
   app.post('/api/contact', async (req, res) => {
     const { name, email, message } = req.body;

     try {
       const channel = await client.channels.fetch('1311794653087010838'); // Replace with your channel ID
       await channel.send(`New contact form submission:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`);
       res.status(200).send('Message sent to Discord');
     } catch (error) {
       console.error('Error sending message to Discord:', error);
       res.status(500).send('Failed to send message');
     }
   });

   client.login(process.env.BOT_TOKEN); // Ensure BOT_TOKEN is set in Heroku

   // Start the web server
   app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
   });