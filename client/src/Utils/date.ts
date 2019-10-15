import * as moment from 'moment';

export default function getDateByTimestampFromNow(timestamp: number): string {
    return moment.unix(timestamp).format('HH:mm');
}