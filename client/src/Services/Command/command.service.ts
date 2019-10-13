import { Commands } from './Commands/commands.enum';

export default class CommandService {

    private static commands: Map<Commands, Function> = new Map<Commands, Function>();

    public static async parse(self: any, data: string): Promise<string> {
        const senderId: string = data.substr(0, 10);

        console.log(CommandService.commands.get(data.substr(10, 20) as Commands));

        if (CommandService.commands.get(data.substr(10, 20) as Commands)) {
            (CommandService.commands.get(data.substr(10, 20) as Commands) as Function)(self, data);
        }

        return new Promise(resolve => resolve(senderId));
    }

    public static register(command: Commands, callback: Function) {
        CommandService.commands.set(command, callback);
    }
}
