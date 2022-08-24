const fs = require('node:fs');
const { spawn } = require("child_process");
const { EmbedBuilder } = require('discord.js');
const { config_load } = require('./helper.js');

const { schoologyKey, schoologySecret } = config_load();

module.exports = {
    SchoologyAuthenticate: async function (msg) {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', ["schoologyListener.py", schoologyKey, schoologySecret]);

            // Open up a listener for data
            pythonProcess.stdout.on('data', (data) => {
                let listener_data = JSON.parse(data.toString());
                // console.log(listener_data);

                if (listener_data['start'] == 'true') {
                    // console.log("Sending the oauth link to the user: " + listener_data['oauth_url']);
                    let oauth_url = listener_data['oauth_url'];

                    const OAuthEmbed = new EmbedBuilder()
                        
                        .setAuthor({ name: 'Schoology', iconURL: 'https://images-na.ssl-images-amazon.com/images/I/51b+eOYTduL.png', url: oauth_url })
                        .setTitle("User Verification")
		                .setColor("#14499c")
                        .setDescription("Please click the link to verify yourself with Schoology")
			.addFields({ name: "Disclamer!!!", value: `We are not able to access any personal information like class grades. We only use Schoology OAuth to assign your nickname on the nshs.life server` })
                        .addFields({ name: "Verify Here:", value: `[Schoology OAuth](${oauth_url})` })
                        msg.channel.send( { embeds: [OAuthEmbed] } );
                }

                if (listener_data['authorization'] == 'true') {
                    // console.log('Authorization successful!');
                    let display_name = listener_data['display_name'];
                    return resolve(display_name)
                }
            });
            
            // Open up a listener for errors
            pythonProcess.stderr.on('data', (data) => {
                let listener_data = JSON.parse(data.toString());
                
                if (listener_data['timeout'] == 'true') {
                    return reject('Authorization timed out.');
                    // Go through the restart process
                }
            });
        });
    }
}