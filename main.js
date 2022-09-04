//required classes
const fetch = require('node-fetch');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, ChannelType, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const keepAlive = require('./server');

const { SchoologyAuthenticate } = require('./schoologyListener.js');
const { discordIDSwitcher, config_load } = require('./helper.js');

const { DISCORD_TOKEN } = config_load();

const discord_ids = discordIDSwitcher();

/**
 * Create discord client
 */
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates], partials: [Partials.Channel, Partials.Message, Partials.Reaction] });

//registering commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}


//registering events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

//user commands handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});


// New member handler
client.on('guildMemberAdd', member => {

    // Adding "New Member" role to joiner
    member.roles.add(member.guild.roles.cache.get(discord_ids["roles"]["new-member"]));

    // Ping member in welcome channel
    const channel = member.guild.channels.cache.find(channel => channel.name === "welcome");
    channel.send(`Hakuna Matata! Welcome to nshs.life, ${member}, please check your DMs for steps to join!`)

    // DM new member
    const Embed = new EmbedBuilder()
        .setThumbnail(client.user.displayAvatarURL())
        .setTitle('Welcome to nshs.life!')
        .setColor("#0e3675")
        .addFields({ name: 'Our Mission', value: '[mission.nshs.life](https://docs.google.com/document/u/5/d/e/2PACX-1vToUA9QApqWmo_k5YGaouh1-FexC5tqLzUIZv6fJZGneyBZwM_ImYNDzraq3mT5FzQVS_EGC7Kdk_Oj/pub)' })
        .addFields({ name: 'Our Rules', value: '[rules.nshs.life](https://docs.google.com/document/u/5/d/e/2PACX-1vSJ1NB4b7RmcOWPEiDMXVQtug1nHvnzwaSjTvEBq_keDMVgDrut2aZxN6uGD8ccL8xMnvWFXIS8PT09/pub)' })

        .addFields({ name: 'Join Requirement', value: 'Please message me your school email (example@newton.k12.ma.us) to access the rest of the nshs.life server' });

    member.send({ embeds: [Embed] })
})


// Member leave handler
client.on('guildMemberRemove', member => {

    // Get leave-log
    let guild = client.guilds.cache.get(discord_ids["server"])
    const channel = guild.channels.cache.get(discord_ids["channels"]["leave-log"]);

    // Message "leave-log" that member left
    const leaveEmbed = new EmbedBuilder()
        .setAuthor({ name: `${member.user.tag} just left`, iconURL: member.user.avatarURL() })
        .setColor("#0x76271E");
    channel.send({ embeds: [leaveEmbed] })
})

// Repling to DMs
client.on('messageCreate', msg => {
    // Check if message is in a DM and not from the bot
    if (msg.channel.type == 1 && msg.author != client.user) {

        // Check if member is in guild
        let guild = client.guilds.cache.get(discord_ids["server"]);

        // Onboarding process:
        // Add specific grade role to member
        guild.members.fetch(msg.author.id)
            .then(member => {
                // Check if they have the "New Member" role
                if (member.roles.cache.has(discord_ids["roles"]["new-member"])) {
                    // Verify if they know what a school email is:
                    // Look at first 9 characters of email, check if it's a number
                    // See if last part of email is @newton.k12.ma.us
                    if (msg.content.match(/\d{9}@newton.k12.ma.us/)) {

                        // Create Schoology OAuth Process
                        SchoologyAuthenticate(msg)
                            .then((information) => {

                                let displayName = information[0]
                                let grade = information[1]

                                // set discord username to actual name
                                member.setNickname(displayName)

                                // detect grade
                                let role
                                if (grade == 10) {
                                    role = guild.roles.cache.get(discord_ids["roles"]["sophomore"]);
                                } else if (grade == 11) {
                                    role = guild.roles.cache.get(discord_ids["roles"]["junior"]);
                                } else if (grade == 12) {
                                    role = guild.roles.cache.get(discord_ids["roles"]["senior"]);
                                } else {
                                    role = guild.roles.cache.get(discord_ids["roles"]["freshman"]);
                                }

                                //assign grade role
                                member.roles.remove(guild.roles.cache.get(discord_ids["roles"]["new-member"]))
                            
                                member.roles.add(role)
                                // Send the user our welcome message
                                const welcome = new EmbedBuilder()
                                    .setColor(0x008B6B)
                                    .setTitle('Welcome to nshs.life! You can check out the server now!')
                                    .setDescription('If you would like to change your name, please DM @Admin')
                                    .addFields({ name: 'Additional roles', value: 'Please take a look at the #role-assignment channel' })
                                    .addFields({ name: 'Pumbaa commands', value: 'Use /help anywhere in the server to get slash commands' })
                                    .addFields({ name: 'Server rules', value: '[rules.nshs.life](https://docs.google.com/document/u/5/d/e/2PACX-1vSJ1NB4b7RmcOWPEiDMXVQtug1nHvnzwaSjTvEBq_keDMVgDrut2aZxN6uGD8ccL8xMnvWFXIS8PT09/pub)' });

                                member.send({ embeds: [welcome] })
                                   
                                //session timed out error
                            }).catch(err => {

                                    const errorEmbed = new EmbedBuilder()
                                        .setTitle('Verification Timed Out')
                                        .setColor(0xFF0000)
                                        .setDescription('The Schoology authentication process has timed out (60 seconds). Please message me your school email (example@newton.k12.ma.us) again to re-verify.')
                                    msg.channel.send({ embeds: [errorEmbed] })
                            })
                    }
                    // If they don't know what a school email is, DM them with an error
                    else {
                        const loginReqEmbed = new EmbedBuilder()
                            .setTitle('Please type out your nps email in this dm')
                        msg.channel.send({ embeds: [loginReqEmbed] })
                    }
                    // If they're already a member:
                } else {
                    // Send them a cute quote
                    fetch("https://type.fit/api/quotes")
                        .then(function (response) {
                            return response.json();
                        })
                        .then(function (data) {

                            const quote = data[Math.floor(Math.random() * data.length)]
                            const Embed = new EmbedBuilder()
                                .setTitle("Hello! Here's a quote for you to think about")
                                .setColor("#14499c")
                                .addFields({ name: quote.text, value: `- ${quote.author ? quote.author : 'unknown'} ` })
                            msg.channel.send({ embeds: [Embed] })
                        })
                        // If the quote fails, DM them with a "You're already a member" message
                        .catch(err => {
                            const errorEmbed = new EmbedBuilder()
                                .setTitle("You're already a member!")
                                .setColor("#14499c")
                                .setDescription("You've already authenticated. If you're having trouble, please contact a moderator.")
                            msg.channel.send({ embeds: [errorEmbed] })
                        });
                }
            })
    }
});


// Adding reactions handler
client.on('messageReactionAdd', async (reaction, user) => {
    // Check if the reaction is partial
    if (reaction.partial) {
        try {
            await reaction.fetch(); // Fetches reaction
        } catch (error) {
            console.error('Fetching message failed: ', error);
            return;
        }
    }

    let guild = client.guilds.cache.get(discord_ids["server"]);

    if (user.bot == false) {

        // Role-assignment selection
        if (reaction.message.channelId == discord_ids["channels"]["role-assignment"]) {

            // Developer role
            if (reaction.emoji.name == '👩‍💻') {
                const role = guild.roles.cache.get(discord_ids["roles"]["developer"]);
                guild.members.fetch(user.id)
                    .then(member => {
                        member.roles.add(role)
                    })
            }

            // Tutor role
            if (reaction.emoji.name == '🚸') {
                const role = guild.roles.cache.get(discord_ids["roles"]["tutor"]);
                guild.members.fetch(user.id)
                    .then(member => {
                        member.roles.add(role)
                    })
            }

            // Opportunities role
            if (reaction.emoji.name == '🔎') {
                const role = guild.roles.cache.get(discord_ids["roles"]["opportunities"]);
                guild.members.fetch(user.id)
                    .then(member => {
                        member.roles.add(role)
                    })
            }

            // Club-Seeker role
            if (reaction.emoji.name == '♣') {
                const role = guild.roles.cache.get(discord_ids["roles"]["club-seeker"]);
                guild.members.fetch(user.id)
                    .then(member => {
                        member.roles.add(role)
                    })
            }

            // Club-Seeker role
            if (reaction.emoji.name == '♣') {
                const role = guild.roles.cache.get(discord_ids["roles"]["club-seeker"]);
                guild.members.fetch(user.id)
                    .then(member => {
                        member.roles.add(role)
                    })
            }

            // Memes role
            if (reaction.emoji.name == '😆') {
                const role = guild.roles.cache.get(discord_ids["roles"]["memes"]);
                guild.members.fetch(user.id)
                    .then(member => {
                        member.roles.add(role)
                    })
            }

            // They/Them role
            if (reaction.emoji.name == '💗') {
                const role = guild.roles.cache.get(discord_ids["roles"]["they/them"]);
                guild.members.fetch(user.id)
                    .then(member => {
                        member.roles.add(role)
                    })
            }

            // She/Her role
            if (reaction.emoji.name == '💛') {

                const role = guild.roles.cache.get(discord_ids["roles"]["she/her"]);
                guild.members.fetch(user.id)
                    .then(member => {
                        member.roles.add(role)
                    })
            }

            // He/Him role
            if (reaction.emoji.name == '💚') {
                const role = guild.roles.cache.get(discord_ids["roles"]["he/him"]);
                guild.members.fetch(user.id)
                    .then(member => {
                        member.roles.add(role)
                    })
            }
        }
        // Accepting tutor request
        else if (reaction.message.channelId == discord_ids["channels"]["tutor-requests"] && reaction.emoji.name == '🎓') {
            guild.members.fetch(reaction.message.embeds[0].footer.text)
                .then(member => {
                    // Check if the person reacting to the tutor request is the person requesting it
                    if (member.user.id == user.id) {
                        reaction.users.remove(user.id)
                        // Deny tutor request acceptance since they're the one asking for it
                        return user.send("Sorry, this isn't a self-tutor system")
                    } else {
                        // Note: Emoji count tracks whether or not a tutor request has been accepted or not.

                        const requestorName = reaction.message.embeds[0].description.split(/From: /)[1]

                        // Add in the tutor emojis to the message so people can easily react
                        let emojiCount = 0
                        reaction.message.reactions.cache.forEach((value, key) => {
                            emojiCount += value.count
                        });
                        // Check if there is more then one reaction
                        // That means the request has already been fufilled
                        if (emojiCount > 2) {
                            reaction.users.remove(user.id)
                            return user.send('Somebody already reached out to help ' + requestorName);
                        }

                        // Accepting the tutor request
                        if (reaction.message.reactions.cache.get('🎓').count == 2) {
                            reaction.message.react('✅')

                            // Grab tutor's name
                            guild.members.fetch(user.id)
                                .then(tutor => {
                                    // Send confirmation to tutee
                                    const toTutee = new EmbedBuilder()
                                        .setTitle(`${tutor.nickname ? tutor.nickname : user.username} accepted your tutor request.`)
                                        .setDescription('Estimated meeting length: ' + reaction.message.embeds[0].fields[1].value)
                                        .setColor(0x0099FF)
                                        .addFields(
                                            { name: reaction.message.embeds[0].fields[0].name, value: reaction.message.embeds[0].fields[0].value },
                                            { name: 'To confirm', value: 'React with ✅' },
                                            { name: 'To cancel', value: 'React with ⛔' })
                                        .setTimestamp()
                                        .setFooter({ text: user.id });

                                    member.user.send({ embeds: [toTutee] }).then(message => {
                                        message.react('✅')
                                        message.react('⛔')
                                    })

                                    const toTutor = new EmbedBuilder()
                                        .setTitle('Tutoring confirmation sent to ' + requestorName);
                                    user.send({ embeds: [toTutor] })
                                })
                        }
                    }
                })
            // DM reaction
        } else if (reaction.message.guildId === null && reaction.count == 2) {

            // Tutor confirmation handling
            if (reaction.message.embeds[0].title.toString().includes('accepted your tutor request')) {
                if (reaction.emoji.name == '✅') {
                    // Send the tutee a confirmation message
                    const toTutee = new EmbedBuilder()
                        .setTitle(`Tutoring session confirmed`)
                        .setColor(0x008B6B);
                    user.send({ embeds: [toTutee] })
                    guild.members.fetch(reaction.message.embeds[0].footer.text)
                        .then(member => {
                            guild.members.fetch(user.id)
                                .then(tutee => {
                                    const toTutor = new EmbedBuilder()
                                        .setTitle(`${tutee.nickname ? tutee.nickname : user.username} confirmed the tutoring session`)
                                        .setColor(0x008B6B);
                                    member.user.send({ embeds: [toTutor] })
                                })

                        })

                    guild.members.fetch(user.id)
                        .then(tutee => {

                            // Create a voice channel for the tutoring session
                            guild.channels.create({
                                name: `Tutor - ${reaction.message.embeds[0].title.split(/ accepted your tutor request/)[0]} | Tutee - ${tutee.nickname ? tutee.nickname : user.username}`,
                                type: ChannelType.GuildVoice,
                            }).then(channel => {
                                // Add the newly created VC to "tutoring" category and make it visible to only the tutor and tutee 
                                let category = guild.channels.cache.get(discord_ids["categories"]["tutoring"]);
                                channel.setParent(category.id);

                                //make sure no one other than desired people see new tutor session
                                let templateChannel = guild.channels.cache.get(discord_ids["channels"]["tutor-timestamps"]);
                                channel.permissionOverwrites.set(templateChannel.permissionOverwrites.cache)
                                channel.permissionOverwrites.edit(user.id, { ViewChannel: true });
                                channel.permissionOverwrites.edit(reaction.message.embeds[0].footer.text, { ViewChannel: true });

                                // Send meeting details to a channel to log for tutoring hours later
                                const Embed = new EmbedBuilder()
                                    .setTitle(`Meeting Details`)
                                    .setColor(0x0099FF)
                                    .addFields(
                                        { name: reaction.message.embeds[0].fields[0].name, value: reaction.message.embeds[0].fields[0].value },
                                        { name: 'Estimated meeting length', value: reaction.message.embeds[0].description.split(/Estimated meeting length: /)[1] },
                                        { name: 'Tutor ID', value: reaction.message.embeds[0].footer.text },
                                        { name: 'Tutee ID', value: user.id },
                                        { name: 'Start time', value: 'the session has not started' });
                                channel.send({ embeds: [Embed] })
                                channel.send('@everyone The tutor session will start when both tutor and tutee join the voice call. Once one leaves, the session is "ended" and the channel will be deleted')
                            });

                        })
                } else {
                    user.send('Tutor cancelled. Please create another request to schedule a new tutor')

                    guild.members.fetch(reaction.message.embeds[0].footer.text)
                        .then(member => {
                            guild.members.fetch(user.id)
                                .then(tutee => {
                                    const toTutor = new EmbedBuilder()
                                        .setTitle(`${tutee.nickname ? tutee.nickname : user.username} cancelled the tutoring session`)
                                        .setColor(0xFF0000);
                                    member.user.send({ embeds: [toTutor] })
                                })

                        })
                }
                reaction.message.delete()
            }
        }
    }
});

// Removing reactions handler
client.on('messageReactionRemove', async (reaction, user) => {
    // Check if the reaction is partial
    if (reaction.partial) {
        try {
            await reaction.fetch(); //fetches reaction
        } catch (error) {
            console.error('Fetching message failed: ', error);
            return;
        }
    }

    const { guild } = reaction.message

    // Role-Assignment handling when they remove their role
    if (user.bot == false && reaction.message.channelId == discord_ids["channels"]["role-assignment"]) {

        // Remove Developer role
        if (reaction.emoji.name == '👩‍💻') {
            const role = guild.roles.cache.get(discord_ids["roles"]["developer"]);
            guild.members.fetch(user.id)
                .then(member => {
                    member.roles.remove(role)
                })
        }

        // Remove Tutor role
        if (reaction.emoji.name == '🚸') {

            const role = guild.roles.cache.get(discord_ids["roles"]["tutor"]);
            guild.members.fetch(user.id)
                .then(member => {
                    member.roles.remove(role)
                })
        }

        // Remove opportunities role
        if (reaction.emoji.name == '🔎') {
            const role = guild.roles.cache.get(discord_ids["roles"]["opportunities"]);
            guild.members.fetch(user.id)
                .then(member => {
                    member.roles.remove(role)
                })
        }

        // Remove Club-Seeker role
        if (reaction.emoji.name == '♣') {
            const role = guild.roles.cache.get(discord_ids["roles"]["club-seeker"]);
            guild.members.fetch(user.id)
                .then(member => {
                    member.roles.remove(role)
                })
        }

        // Remove Club-Seeker role
        if (reaction.emoji.name == '😆') {
            const role = guild.roles.cache.get(discord_ids["roles"]["memes"]);
            guild.members.fetch(user.id)
                .then(member => {
                    member.roles.remove(role)
                })
        }

        //they-them
        if (reaction.emoji.name == '💗') {
            const role = guild.roles.cache.get(discord_ids["roles"]["they/them"]);
            guild.members.fetch(user.id)
                .then(member => {
                    member.roles.remove(role)
                })
        }

        //she-her
        if (reaction.emoji.name == '💛') {

            const role = guild.roles.cache.get(discord_ids["roles"]["she/her"]);
            guild.members.fetch(user.id)
                .then(member => {
                    member.roles.remove(role)
                })
        }

        //he-him
        if (reaction.emoji.name == '💚') {
            const role = guild.roles.cache.get(discord_ids["roles"]["he/him"]);
            guild.members.fetch(user.id)
                .then(member => {
                    member.roles.remove(role)
                })
        }
    }
})


client.on('voiceStateUpdate', async (oldState, newState) => {

    let guild = client.guilds.cache.get(discord_ids["server"])

    if (newState.channel !== null) {
        // Get first message (the bot's embed)
        const fetchedMsg = await newState.channel.messages.fetch({ after: 1, limit: 1 })
        const firstMsg = fetchedMsg.first()



        // When the people in the vc are the tutor and tutee, start the session
        const memberIds = Array.from(newState.channel.members.keys())
        if (memberIds.length == 2 && memberIds.includes(firstMsg.embeds[0].fields[2].value) && memberIds.includes(firstMsg.embeds[0].fields[3].value)) {

            guild.channels.fetch(discord_ids["channels"]["tutor-timestamps"]).then(logChannel => {

                //get start time
                const date = new Date();
                startTime = date.getTime()


                // start time
                const startEmbed = new EmbedBuilder()
                    .setTitle(`Meeting Details`)
                    .setColor(0x0099FF)
                    .addFields(
                        { name: firstMsg.embeds[0].fields[0].name, value: firstMsg.embeds[0].fields[0].value },
                        { name: 'Estimated meeting length', value: firstMsg.embeds[0].fields[1].value },
                        { name: 'Tutor ID', value: firstMsg.embeds[0].fields[2].value },
                        { name: 'Tutee ID', value: firstMsg.embeds[0].fields[3].value },
                        { name: 'Start time', value: String(startTime) });
                firstMsg.edit({ embeds: [startEmbed] })

                guild.channels.fetch(newState.channelId).then(channel => {
                    channel.send("@everyone This tutor session has started, only leave when you are sure that you're done")
                })
            })
        }

    } else if (newState.channel === null) {
        try {
            //get first message (the bot's embed)
            const fetchedMsg = await oldState.channel.messages.fetch({ after: 1, limit: 1 })
            const firstMsg = fetchedMsg.first()

            //possible people allowed
            const memberIds = [firstMsg.embeds[0].fields[2].value, firstMsg.embeds[0].fields[3].value]
            //whoever's left (tutee/tutor)
            const personLeft = Array.from(oldState.channel.members.keys())
            if (personLeft.length == 1 && memberIds.includes(oldState.id) && memberIds.includes(personLeft[0])) {

                guild.channels.fetch(discord_ids["channels"]["tutor-timestamps"]).then(logChannel => {

                    //get start time
                    let startTime = parseInt(firstMsg.embeds[0].fields[4].value)

                    //get end time
                    const date = new Date();
                    let endTime = date.getTime()

                    // calculate time in minutes
                    let totalTime = millisToMinutesAndSeconds(endTime - startTime)


                    const tutor = guild.members.cache.get(memberIds[0])
                    const tutee = guild.members.cache.get(memberIds[1])
                    const Embed = new EmbedBuilder()
                        .setTitle(`Tutoring session ended`)
                        .setColor(0x0099FF)
                        .addFields(
                            { name: 'Meeting end time', value: totalTime },
                            { name: 'Tutor', value: tutor.nickname ? tutor.nickname : tutor.user.username },
                            { name: 'Tutee', value: tutee.nickname ? tutee.nickname : tutee.user.username });

                    //log the end time in tutor-timestamps channel
                    logChannel.send({ embeds: [Embed] })

                    guild.channels.fetch(oldState.channelId).then(tutoringChannel => {
                        tutoringChannel.delete()
                    })
                })
            }
        } catch { }
    }
})

function millisToMinutesAndSeconds(millis) {
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

keepAlive()
client.login(DISCORD_TOKEN);
