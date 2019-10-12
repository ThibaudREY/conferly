export default class PeerNotFoundException extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, PeerNotFoundException.prototype);
    }
}