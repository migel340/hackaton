import { api } from "@api/api";

export const RadarLoader = async () =>{

    const response = await api.get('/signals/me');
    console.log(response)
    if(response){
        const signals = response.signals;

        if(signals && signals.length > 0){
            const signal = signals[0];

            const matchSignal = await api.get(`/signals/match/${signal.id}`);

            return {matchSignal}
            

        }

    }


}

