import axios from 'axios';
import {Pushover} from 'pushover-js'

import dotenv from 'dotenv';

dotenv.config();

import dayjs from 'dayjs';

const pushover = new Pushover(process.env.PUSHOVER_USER!, process.env.PUSHOVER_TOKEN!)
const CHECK_INTERVAL_SEC = Number(process.env.CHECK_INTERVAL_SEC) || 60; // check every X seconds
const QUERY_PARAMS = process.env.QUERY_PARAMS;


// partial data
interface doctolibData {
    total: number,
    reason?: string,
    next_slot?:Date;
    next_slot_datetime?:Date;
    availabilities: Array<{
        date:Date;
        slots:Array<Date>
    }>
}

// avoid send twice the same message (using a specified ID)
const alreadySend = new Set<string>();

async function check(link: string) {
    try{
        console.log(`fetching link ${link}...`);
        const {data}: { data: doctolibData } = await axios.get(link);
        console.log(`fetched db ${link}`);

        if(data.total > 0 || data.next_slot || data.next_slot_datetime){
            const next_availabilitie_brut:Date | undefined = data.next_slot_datetime ?? data.availabilities.find(e => e.slots.length > 0)?.slots[0];
            const next_availabilitie = dayjs(next_availabilitie_brut).format("DD/MM/YYYY HH:mm") ?? "N/A"
            // don't send twice the same info
            const id = `${data.total}-${next_availabilitie_brut}-${dayjs().format("DD/MM/YYYY")}`
            console.log(id);
            if (alreadySend.has(id)) {
                return;
            }
            alreadySend.add(id);

            const message = "RDV Dispo. Total " + data.total + " Next : " + next_availabilitie
            console.log(message);
            await pushover.send('Nouveau créneau de RDV', message)
        }
    }
    catch (e) {
        console.error(e);
    }
}

function main() {
    try{
        const link = "https://www.doctolib.fr/availabilities?start_date="+dayjs().format("YYYY-MM-DD")+"&"+ QUERY_PARAMS
        check(link);
    }
    catch (e) {
        console.error(e);
    }
}

main();
setInterval(() => main(), CHECK_INTERVAL_SEC * 1000)