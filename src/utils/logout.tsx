import { Session, History, Location } from '../interfaces/global';

import checkIfIsAuthenticated from './checkIfIsAuthenticated' 

export default function logoutGit(session: Session, history: History, location: Location) {
    sessionStorage.removeItem('user');
    checkIfIsAuthenticated(session, history, location);
}