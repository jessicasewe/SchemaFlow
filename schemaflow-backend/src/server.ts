import app from "./app";
import http from "http";
import logger from "./utils/logger";

const port = process.env.PORT || 5000;
const server = http.createServer(app);

async function startServer() {
  try {
    server.listen(port, () => {
      logger.info(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    logger.error("Error starting server", { error });
    process.exit(1);
  }
}

startServer();
