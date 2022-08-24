const fs = require('node:fs');

module.exports = {
    config_load: function() {
        if (fs.existsSync("./config.json")) {
            return require('./config.json');
        } else {
            return process.env;
        }
    },

    discordIDSwitcher: function() {
        const { BOTNAME } = process.env
        if (BOTNAME == "Pumbaa") {
            discord_ids = require('./discord-ids.json');
            ids = discord_ids.pumbaa;
            console.log("Pumbaa");
            console.log(ids);
        } else {
            discord_ids = require('./discord-ids.json');
            ids = discord_ids.simba;
            console.log("Simba");
            console.log(ids);
        }

        return ids;
    }
}