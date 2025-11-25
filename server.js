const { createServer } = require("http");
const next = require("next");

const dev = false; // production mode on Render
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(3000, () => {
    console.log("🚀 Server running on port 3000 for Render deployment");
  });
});
