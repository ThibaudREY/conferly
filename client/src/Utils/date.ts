import * as moment from 'moment';

export default function getDateByTimestampFromNow(timestamp: number): string {
    return moment.utc(timestamp).format("HH:mm");
}