export class User {
    public username: string;
    public minUsername: string;

    constructor(username?: string, minUsername?: string) {
        this.username = username || '';
        this.minUsername = minUsername || '';
    }
}
