import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Login from './pages/Login';

import Repos from './pages/Git/Repos';
import Commits from './pages/Git/Repos/Commits';
import CommitsFiles from './pages/Git/Repos/Commits/Files';

import Class from './pages/Classroom';
import ClassRegister from './pages/Classroom/Create';
import ClassProfile from './pages/Classroom/Profile';

import TeamsRegister from './pages/Classroom/Teams/Create';

import Tools from './pages/Tools';
import ErrorStatus from './pages/ErrorStatus';

const Routes = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact component={Login}/>

                <Route path="/tools" component={Tools}/>

                <Route path="/error" component={ErrorStatus}/>

                <Route path="/git/repos" exact component={Repos}/>  
                <Route path="/git/repos/commits" exact component={Commits}/>
                <Route path="/git/repos/commits/files" component={CommitsFiles}/>

                <Route path="/class" exact component={Class}/>  
                <Route path="/class/create" exact component={ClassRegister}/>
                <Route path="/class/:key" exact component={ClassProfile}/>
                <Route path="/class/:key/edit" component={ClassRegister}/>

                <Route path="/class/:key/teams/commits" exact component={Commits}/>
                <Route path="/class/:key/teams/commits/files" component={CommitsFiles}/>
                <Route path="/class/:key/teams/create" component={TeamsRegister}/> 
                <Route path="/class/:key/teams/edit/:id" component={TeamsRegister}/> 
            </Switch>
        </BrowserRouter>
    );
}

export default Routes;