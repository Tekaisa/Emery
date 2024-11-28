const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

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

client.on('messageCreate', message => {
    if (message.channel.id === '1310835818608201739') { // Replace with your channel ID
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

client.login('MTMxMTc5NTgyMTQ0ODI2NTg1MQ.GgGkdD.b_Y3r9kqUH9Ytd-1CqvIcfZiLPpJRnPO-CWxxM'); // Replace with your bot token
