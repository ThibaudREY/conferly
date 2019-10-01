import { SignalingServer } from "./server";

import "reflect-metadata";

const PORT = process.env.PORT || 9000;

new SignalingServer(PORT);