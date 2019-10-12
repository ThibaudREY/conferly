export default class RoomAlreadyExistException extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, RoomAlreadyExistException.prototype);
    }
}