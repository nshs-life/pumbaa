const { schoologyKey, schoologySecret } = require('./config.json');
const { spawn } = require("child_process");
const { EmbedBuilder } = require('discord.js');
const { url } = require('inspector');

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
		                .setColor(0e3675)
                        .setDescription("Click the link below to verify yourself with Schoology")
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

// SchoologyAuthenticate()
// .then((display_name) => {
//     console.log(display_name);
// }).catch((error) => {
//     console.log(error);
// });

// async function PromiseTest() {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve("Promise resolved");
//         }, 1000);
//     });
// }

// PromiseTest().then(console.log("Print resolved data here"));
// async function welcome() {
//     // Schoology verification
//     const { spawn } = require("child_process");
//     const pythonProcess = spawn('python', ["schoology.py", schoologyKey, schoologySecret]);

//     pythonProcess.stderr.on('data', (data) => {
//         console.log(`${data}`);
//         if (data.includes("timed out")) {
//             console.log("Schoology verification timed out");

//         }
//     }).on('close', (code) => {
//         console.log(`child process exited with code ${code}`);
//     }).on('error', (err) => {
//         console.log(`child process error ${err}`);
//     });
    
//     pythonProcess.stdout.on('data', (data) => {
//             data = data.toString();
//             json = JSON.slparse(data);
//             oauth_url = json.oauth_url;
//             console.log(oauth_url);
//         }
//     );
// }

// async function schoologyVerify(member) {
//     // Schoology verification: Creating authentication URL for user to join schoology
//     const { spawn } = require("child_process");
//     const pythonProcess = spawn('python', ["schoology.py", schoologyKey, schoologySecret]);

//     pythonProcess.stderr.on('data', (data) => {
//         console.log(`${data}`);
//         if (data.includes("timed out")) {
//             console.log("Schoology verification timed out");
//             restartVerify(member);
//             // Do some function that will 
//             // Restart the verification process
//         }
//     });
    
//     var oauth_url = "";
//     pythonProcess.stdout.once('data', (data) => {
//             data = data.toString();
//             info = JSON.parse(data);
//             oauth_url = info.oauth_url;
//         }
//     );

// 	//DMing new member
// 	const verification_embed = new EmbedBuilder()
// 		.setTitle('nshs.life verification')
// 		.setColor(0x18e1ee)
//         .addFields({ name: "To make sure you're a South student, verify through schoology", value: oauth_url })

// 	member.send({ embeds: [verification_embed] })

//     // Check for schoology verification
//     pythonProcess.stdout.once('data', (data) => {
//         data = data.toString();
//         info = JSON.parse(data);
//         if ( info.authorization == true) {
//             console.log("Schoology verification successful");
//             }
//         }
//     );
// }

// async function restartVerify(member) {
//     const restartVerifyEmbed = new EmbedBuilder()
//         .setTitle('Would you like to verify again?')
//         .setColor(0x18e1ee)

//     member.send({ embeds: [restartVerifyEmbed] }).then(message =>{
//         message.react('✅');
//         message.react('⛔');
//     })
// }