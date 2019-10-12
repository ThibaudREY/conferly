export default class SocketJoinException extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, SocketJoinException.prototype);
    }
}