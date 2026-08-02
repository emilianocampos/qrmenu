const { client } = require('@gradio/client');

async function test() {
  try {
    const app = await client('stabilityai/TripoSR');
    console.log(JSON.stringify(app.view_api(), null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
