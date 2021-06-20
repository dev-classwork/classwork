import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';

import { ClassItem } from '../../interfaces/global';

import HeaderAuth from '../../components/headerAuth';

import api from '../../services/api';

import checkIfIsAuthenticated from '../../utils/checkIfIsAuthenticated';
import returnNotNullSession from '../../utils/returnNotNullSession';
import imgBack from '../../assets/team_work.png';

const Classroom = () => {
    const history = useHistory();
    const location = useLocation();
    const user = JSON.parse(returnNotNullSession('user', ''));
    const date = Date.now();
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [classesKey, setClassesKey] = useState<string[]>([]);

    checkIfIsAuthenticated(sessionStorage, history, location);

    useEffect(() => {
        setClassesKey(JSON.parse(returnNotNullSession('user', '')).classes);
    }, []);

    useEffect(() => {
        async function loadClasses(){
            var allClasses: ClassItem[] = [];
            for(var t in classesKey){
                await api(`classes?key=${classesKey[t]}`, {
                    headers: {
                        auth: process.env.REACT_APP_DB_IDENTITY
                    } 
                }).then(async(res) => {
                    var teacher = await api(`users?id=${res.data.teacher_id}`, {
                        headers: {
                            auth: process.env.REACT_APP_DB_IDENTITY
                        }
                    });

                    const data = {
                        name: res.data.name,
                        description: res.data.description,
                        key: res.data.key,
                        image: res.data.image,
                        avatar: teacher.data.avatar,
                        color: res.data.color
                    }
                    allClasses.push(data);  
                }).catch();
            }
            setClasses(allClasses);
        }

        loadClasses();
    }, [classesKey]);

    function navigateToClassProfile(key: string) {
        history.push(`/class/${key}`);
    }

    const ListClasses = classes.map(function(item, index){
        var name = item.name;
        var description = item.description;

        if(description === null || description === ""){
            description = "Sem descrição";
        }else if(description.length >= 128){
            description = description.substr(0, 125) + "...";
        }

        if(name.length > 24){
            name = name.substr(0, 24) + '...';
        }

        return (<li key={index}><button style={{ color: item.color }} className="shadow-theme-lit-current-color class-info-display" 
        onClick={() => {navigateToClassProfile(item.key)}}>
                <div className="box-list-div-image">
                    <div className="box-list-div-class-image remove-color-transition" style={{ backgroundImage: `url(${process.env.REACT_APP_URL_BACK}/classes/uploads/${item.image}?${date})`}}>
                        <img src={user.avatar} alt="professor"/>
                    </div>
                </div>
                <div className="class-info-content">
                    <h3>{name}</h3>
                    <h4>{description}</h4>
                </div>
            </button>
        </li>);
    });

    return(
        <div>
            <HeaderAuth title="Error"/>
            <div className="page with-scroll header-is-auth" style={{ backgroundImage: `url(${imgBack})` }}>
                <div className="title">
                    <h1>Turmas.</h1>
                    <h2>Lista de todas as turmas em que participa ou administra: </h2>
                </div>
                <div className="container-box-list container-box-list-within-padding">
                <ul>
                    {classes && classes.length > 0? ListClasses:null}
                    <li>
                    <Link to="/class/create" className="dropzone plus-button">
                        <div>
                            <h1><span>+</span> Criar / Adicionar</h1>
                        </div>
                    </Link>
                    </li>
                </ul>
            </div>
            </div>
        </div>
        );
}

export default Classroom;