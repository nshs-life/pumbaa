const { Client } = require("@notionhq/client");
const { pagespeedonline } = require("googleapis/build/src/apis/pagespeedonline/index.js");

const { config_load } = require('./helper.js');
const { NOTION_KEY, NOTION_DATABASE_ID_CLUBS } = config_load();
const notion = new Client( { auth: NOTION_KEY } );

async function addItem() {
    const pages = []
    let cursor = undefined
    try {
        const { results, next_cursor } = await notion.databases.query( {
            database_id: NOTION_DATABASE_ID_CLUBS,
            start_cursor: cursor
        })
        console.log(results));
        cursor = next_cursor
    }
    catch (error) {
        console.log(error);
    }
}

addItem();