import { Client } from "@notionhq/client"

const { config_load } = require('./helper.js');
const { NOTION_KEY, NOTION_DATABASE_ID } = config_load();
const notion = new Client( { auth: NOTION_KEY } );

async function addItem(text) {
    try {
        const response = await notion.pages.retrieve( {
            auth: NOTION_KEY,
        })
        console.log(response);
    }
}