import PeerService from '../../Peer/peer.service';
import { injector } from '../../..';
import AppService, { appServices } from '../../Manager/app-service.service';

export async function onNewService(self: PeerService, data: string) {

    const service = JSON.parse(data.substr(30));
    const appService: AppService = injector.get(AppService);

    if (service) {
        appService.saveOrUpdateService(service.appKey, service.token, service.name);
    }
}

export async function getAllServices(self: PeerService, data: string) {

    const appService: AppService = injector.get(AppService);

    const services = new Map<string, string>(JSON.parse(data.substr(30)));

    if (services) {

        services.forEach((token: string, appKey: string) => {
            appService.setService(appKey, token);
            localStorage.setItem(appKey, token);
        });

        appServices.next(services);
    }
}
