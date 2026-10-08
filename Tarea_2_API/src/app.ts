import "dotenv/config";
import { Server } from "./server.ts";
import routes from "./routes/index.ts";

const port = Number(process.env.PORT ?? 3000);

function main() {
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("PORT debe ser un entero entre 1 y 65535.");
    }

    const server = new Server({ port, routes });
    server.start();
}

main();