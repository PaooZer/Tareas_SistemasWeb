import express from "express";
import type { Router } from "express";

interface ServerOptions {
    port: number;
    routes: Router;
}

export class Server {
    private readonly server = express();
    private readonly port: number;
    private readonly routes: Router;

    constructor(options: ServerOptions) {
        this.port = options.port;
        this.routes = options.routes;
    }

    start() {
        this.server.use(express.json());
        this.server.use("/", this.routes);

        this.server.listen(this.port, () => {
            console.log(`Servidor disponible en http://localhost:${this.port}`);
        });
    }
}