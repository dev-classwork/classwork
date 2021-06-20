import { Session, History, Location } from '../interfaces/global';

export default async function checkIfIsAuthenticated(session: Session, history: History, location: Location){
    var user = sessionStorage.getItem('user');
    var token = sessionStorage.getItem('token');

    if(user != null && token != null){
        if(location.pathname === "/"){
            history.push('/git/repos');
        }
    }else{
        if(location.pathname !== "/"){
            session.clear();
            history.push('/');
        }
    }
} 