export default class RoomNotFoundException extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, RoomNotFoundException.prototype);
    }
}