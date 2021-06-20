import { NotNullUser } from '../interfaces/global';

export default function returnNotNullSession(sessionName: string, defaultValue: string){
    var _session = sessionStorage.getItem(sessionName);
    if(_session === null || _session === undefined){
        switch(sessionName){
            case('user'): return JSON.stringify(NotNullUser);
            case('action'): return "";
            default: return defaultValue;
        }
    }
    return _session;
}
