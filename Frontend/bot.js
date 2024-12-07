const { Client, GatewayIntentBits} = require('discord.js');
const fs = require('fs');

function startBot() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    client.once('ready', () => {
        console.log('Bot is online!');
    });

    const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
    const axios = require('axios');
    
    // Create a new client instance with necessary intents
    // Specify the logging channel ID (replace with your actual channel ID)
    const LOG_CHANNEL_ID = '1312383146053865503'; // e.g., '123456789012345678'
    
    // When the client is ready, run this code (once)
    client.once('ready', () => {
        console.log('Bot is online and ready to respond!');
    });
    
    // Function to log moderation actions
    async function logAction(action, user, moderator) {
        const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff') // Set the color of the embed
                .setTitle('Moderation Action')
                .addFields(
                    { name: 'Action', value: action, inline: true },
                    { name: 'User', value: user, inline: true },
                    { name: 'Moderator', value: moderator, inline: true }
                )
                .setTimestamp(); // Add a timestamp
    
            await logChannel.send({ embeds: [embed] });
        } else {
            console.error('Log channel not found!');
        }
    }
    
    // Check if the user has the required permissions
    function hasPermission(message, permission) {
        return message.member.permissions.has(permission) || message.member.permissions.has('ADMINISTRATOR');
    }
    
    // Listen for messages
    client.on('messageCreate', async message => {
        console.log(`Received message: ${message.content}`);
        if (message.author.bot) return;
    
        // Moderation commands
        if (message.content.startsWith('!kick')) {
            console.log('Kick command triggered');
            if (!hasPermission(message, 'KICK_MEMBERS')) {
                return message.channel.send('You do not have permission to use this command.');
            }
            const user = message.mentions.members.first();
            if (!user) {
                return message.channel.send('Please mention a user to kick.');
            }
            if (user.roles.highest.position >= message.member.roles.highest.position) {
                return message.channel.send('You cannot kick this user because they have a higher or equal role.');
            }
            await user.kick();
            message.channel.send(`${user.user.tag} has been kicked.`);
            await logAction('Kicked', user.user.tag, message.author.tag);
        }
    
        if (message.content.startsWith('!ban')) {
            console.log('Ban command triggered');
            if (!hasPermission(message, 'BAN_MEMBERS')) {
                return message.channel.send('You do not have permission to use this command.');
            }
            const user = message.mentions.members.first();
            if (!user) {
                return message.channel.send('Please mention a user to ban.');
            }
            if (user.roles.highest.position >= message.member.roles.highest.position) {
                return message.channel.send('You cannot ban this user because they have a higher or equal role.');
            }
            await user.ban();
            message.channel.send(`${user.user.tag} has been banned.`);
            await logAction('Banned', user.user.tag, message.author.tag);
        }
    
        if (message.content.startsWith('!unban')) {
            console.log('Unban command triggered');
            if (!hasPermission(message, 'BAN_MEMBERS')) {
                return message.channel.send('You do not have permission to use this command.');
            }
            const userId = message.content.split(' ')[1];
            if (!userId) {
                return message.channel.send('Please provide a user ID to unban.');
            }
            await message.guild.members.unban(userId);
            message.channel.send(`User with ID ${userId} has been unbanned.`);
            await logAction('Unbanned', userId, message.author.tag);
        }
    
        // Advanced Mute command
        if (message.content.startsWith('!mute')) {
            console.log('Mute command triggered');
            if (!hasPermission(message, 'MANAGE_ROLES')) {
                return message.channel.send('You do not have permission to use this command.');
            }
            const args = message.content.split(' ').slice(1);
            const user = message.mentions.members.first();
            if (!user) {
                return message.channel.send('Please mention a user to mute.');
            }
            const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
            if (!muteRole) {
                return message.channel.send('Mute role not found. Please create a role named "Muted".');
            }
    
            // Check for time argument
            let muteDuration = 0; // Duration in milliseconds
            if (args[1]) {
                const time = parseInt(args[1]);
                if (isNaN(time)) {
                    return message.channel.send('Please specify a valid number for the mute duration.');
                }
                muteDuration = time * 60000; // Convert minutes to milliseconds
            }
    
            await user.roles.add(muteRole);
            message.channel.send(`${user.user.tag} has been muted${muteDuration > 0 ? ` for ${args[1]} minute(s)` : ''}.`);
            await logAction(`Muted${muteDuration > 0 ? ` for ${args[1]} minute(s)` : ''}`, user.user.tag, message.author.tag);
    
            // Unmute after the specified duration
            if (muteDuration > 0) {
                setTimeout(async () => {
                    await user.roles.remove(muteRole);
                    message.channel.send(`${user.user.tag} has been unmuted after ${args[1]} minute(s).`);
                    await logAction(`Unmuted`, user.user.tag, message.author.tag);
                }, muteDuration);
            }
        }
    
        // Unmute command
        if (message.content.startsWith('!unmute')) {
            console.log('Unmute command triggered');
            if (!hasPermission(message, 'MANAGE_ROLES')) {
                return message.channel.send('You do not have permission to use this command.');
            }
            const user = message.mentions.members.first();
            if (!user) {
                return message.channel.send('Please mention a user to unmute.');
            }
            const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
            if (!muteRole) {
                return message.channel.send('Mute role not found. Please create a role named "Muted".');
            }
            await user.roles.remove(muteRole);
            message.channel.send(`${user.user.tag} has been unmuted.`);
            await logAction('Unmuted', user.user.tag, message.author.tag);
        }
    
        // Other commands (Ping, Joke, Roll, 8-Ball, Reminder, Server Info)
        if (message.content.trim() === '!ping') {
            message.channel.send('Pong!');
        }
    
        if (message.content.trim() === '!joke') {
            try {
                const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
                const joke = `${response.data.setup} - ${response.data.punchline}`;
                message.channel.send(joke);
            } catch (error) {
                message.channel.send('Sorry, I could not fetch a joke at the moment.');
            }
        }
    
        if (message.content.trim().startsWith('!roll')) {
            const sides = message.content.split(' ')[1] || 6; // Default to 6 sides
            const roll = Math.floor(Math.random() * sides) + 1;
            message.channel.send(`You rolled a ${roll}!`);
        }
    
        if (message.content.trim() === '!8ball') {
            const responses = [
                "Yes.",
                "No.",
                "Maybe.",
                "Ask again later.",
                "Definitely.",
                "I wouldn't count on it."
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            message.channel.send(response);
        }
    
        if (message.content.trim().startsWith('!remind')) {
            const args = message.content.split(' ').slice(1);
            const time = parseInt(args[0]); // Time in minutes
            const reminderMessage = args.slice(1).join(' ');
    
            if (!time || isNaN(time)) {
                return message.channel.send('Please specify a valid time in minutes.');
            }
    
            setTimeout(() => {
                message.channel.send(`Reminder: ${reminderMessage}`);
            }, time * 60000); // Convert minutes to milliseconds
    
            message.channel.send(`I will remind you in ${time} minute(s)!`);
        }
    
        if (message.content.trim() === '!serverinfo') {
            const serverInfo = `
            **Server Name:** ${message.guild.name}
            **Total Members:** ${message.guild.memberCount}
            **Created On:** ${message.guild.createdAt.toDateString()}
            `;
            message.channel.send(serverInfo);
        }
    });
    
    


    client.on('messageCreate', message => {
        if (message.channel.id === '1314623712758333541') { // Replace with your channel ID
            const ratingPattern = /(\d)\/5/; // Regular expression to find x/5
            const match = message.content.match(ratingPattern);

            let rating = 0;
            let reviewText = message.content;

            if (match) {
                rating = parseInt(match[1], 10); // Extract the numeric rating
                reviewText = message.content.replace(ratingPattern, '').trim(); // Remove the rating from the message
            }

            // Format the date to YYYY-MM-DD
            const date = message.createdAt.toISOString().split('T')[0];

            const review = {
                discordTag: message.author.tag,
                profilePicture: message.author.displayAvatarURL(),
                reviewText: reviewText,
                rating: rating,
                stars: '★'.repeat(rating) + '☆'.repeat(5 - rating), // Convert rating to stars
                date: date // Store only the date part
            };

            // Read existing reviews
            fs.readFile('reviews.json', (err, data) => {
                if (err) throw err;
                const reviews = JSON.parse(data);

                // Add new review
                reviews.push(review);

                // Write updated reviews back to file
                fs.writeFile('reviews.json', JSON.stringify(reviews, null, 2), err => {
                    if (err) throw err;
                    console.log('Review added!');
                });
            });
        }
    });

    client.login(process.env.BOT_TOKEN); // Ensure BOT_TOKEN is set in Heroku
}

module.exports = { startBot };
