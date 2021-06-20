import { Session, History, Location } from '../interfaces/global';

export default function queryToStorage(session: Session, history: History, location: Location, ...querys: string[]){
    var urlSearch = new URLSearchParams(location.search);
    var _canPush = false;
    var _returnsStorages: string[] = [];

    for(var i in querys){
        var query = querys[i];
        var queryValue = urlSearch.get(query);
        var storageValue = session.getItem(query);

        if(storageValue == null && queryValue != null){
            session.setItem(query, queryValue);
            urlSearch.delete(query);
            _canPush = true;
        }else if(storageValue != null && queryValue != null){
            urlSearch.delete(query);
            _canPush = true;
        }
        _returnsStorages[i] =  session.getItem(query);
    }

    if(_canPush){
        history.push(location.pathname);
    }

    return _returnsStorages;
}