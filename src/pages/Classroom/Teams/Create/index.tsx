import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useHistory, useLocation, useParams } from "react-router-dom";
import { TeamsItem } from '../../../../interfaces/global';
import { FaAward, FaMarker } from 'react-icons/fa';

import HeaderAuth from '../../../../components/headerAuth';
import Painel from '../../../../components/painel';

import checkIfIsAuthenticated from '../../../../utils/checkIfIsAuthenticated';

import api from '../../../../services/api';

const TeamsRegister = () => {
    const history = useHistory();
    const location = useLocation();
    const { key, id } = useParams<{ key: string, id: string }>();

    async function loadTeam(){
        await api.get(`/teams?key=${key}&id=${id}`, {
            headers: {
                auth: process.env.REACT_APP_DB_IDENTITY
            }
        }).then(async function(res){
            setTeams({
                name: res.data.name,
                repos: res.data.repos
            });
        }).catch(function(){
            setTeams({
                name: "",
                repos: "https://github.com/"
            });
        });
    }

    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [teamId, setTeamId] = useState(-1);
    const [teams, setTeams] = useState<TeamsItem>({
        name: "",
        repos: "https://github.com/"
    });

    if(id !== null && id !== undefined && !isNaN(Number(id)) && teamId === -1){
        setTeamId(Number(id));
        loadTeam();
    }

    function handleChangeInputValues(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if(e.target.name === "name" && e.target.value.length >= 3 && e.target.value.length <= 20 && 
        errors.includes('name')){
            let _errors = errors;
            _errors.splice(_errors.indexOf('name'), 1);
            setErrors(_errors);
        }

        if(e.target.name === "repos" && !e.target.value.startsWith('https://github.com/')){
            return;
        }else if(e.target.name === "repos" && teams.repos.length > "https://github.com/".length &&
        teams.repos.split('https://github.com/')[1].includes('/') && 
        teams.repos.split('https://github.com/')[1].length >= 2 &&
        errors.includes('repos')){
            let _errors = errors;
            _errors.splice(_errors.indexOf('repos'), 1);
            setErrors(_errors);
        }
        setTeams({
            ...teams,
            [e.target.name]: e.target.value
        });
    }

    async function handleForm(e: FormEvent){
        e.preventDefault();
    }

    async function handleSubmitForm(e: React.MouseEvent<HTMLButtonElement, MouseEvent>){
        e.preventDefault();

        setIsLoading(true);

        let haveError = false;
        let _errors = errors;

        if(!teams.repos.startsWith('https://github.com/') || teams.repos.length <= "https://github.com/".length
        || !teams.repos.split('https://github.com/')[1].includes('/') || teams.repos.split('https://github.com/')[1].length < 3){
            if(!_errors.includes('repos')){
                _errors = [
                    ..._errors,
                    "repos"
                ];
            }
            haveError = true;
        }

        if(teams.name.length < 3 || teams.name.length > 20){
            if(!_errors.includes('name')){
                _errors = [
                    ..._errors,
                    "name"
                ];
            }
            haveError = true;
        }

        if(haveError){
            setErrors(_errors);
            setIsLoading(false);
            return;
        }

        if(teamId === -1){
            await api.post('teams/create', {
                key,
                name: teams.name,
                repos: teams.repos
            }, {
                headers: {
                    auth: process.env.REACT_APP_DB_IDENTITY
                }
            }).then(function() {
                history.push(`/class/${key}`);
            }).catch(function(err) {
                setIsLoading(false);
                setErrors(err.response.data.validation.keys);
            });
        }else{
            await api.post(`/teams/update?key=${key}&id=${teamId}`, {
                name: teams.name,
                repos: teams.repos
            }, {
                headers: {
                    auth: process.env.REACT_APP_DB_IDENTITY
                }
            }).then(function() {
                history.push(`/class/${key}`);
            }).catch(function(err) {
                setIsLoading(false);
                setErrors(err.response.data.validation.keys);
            });
        }
        
        setIsLoading(false);
    }

    checkIfIsAuthenticated(sessionStorage, history, location);

    return(
        <div>
            <HeaderAuth title=""/>
            {!isLoading && <Painel/>}
            <div className="page with-scroll header-is-auth">
                <div className="title">
                    <h1>{teamId === -1? "Mais":"Editar"} uma equipe? Certo, é bem simples!</h1>
                    <h2>Você só precisa dos...</h2>
                </div>
                <form className="form-create-class" onSubmit={handleForm}>
                    <fieldset>
                        <legend className={errors.includes('name')? "legend-red":""}>
                            Dados importantes
                        </legend>
                        <div className={errors.includes('name')? "multform-imput multform-imput-red":"multform-imput"}>
                            <label htmlFor="name">
                                <div>
                                    <FaAward size={25}/>
                                    <p>Nome da equipe{errors.includes('name')? ". Por favor, use ao menos 3 letras e no máximo 20.":" *"}</p>
                                </div>
                            </label>
                            <input required className={errors.includes('name')? "shadow-theme-red":"shadow-theme"} id="name" type="name" name="name" value={teams.name || ""} onChange={handleChangeInputValues}/>
                        </div>
                        <div className={errors.includes('repos')? "multform-imput multform-imput-red":"multform-imput"}>
                            <label htmlFor="repos">
                                <div>
                                    <FaMarker size={21}/>
                                    <p>Endereço do repositório{errors.includes('repos')? ". Por favor, use um link válido.":" *"}</p>
                                </div>
                            </label>
                            <input required className={errors.includes('repos')? "shadow-theme-red":"shadow-theme"} id="repos" type="name" name="repos" value={teams.repos || "https://github.com/"} onChange={handleChangeInputValues}/>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>
                            Pronto? Já pode {teamId === -1? "enviar":"salvar"}!
                        </legend>
                        
                        <div style={{display: 'flex'}}><div className="multform-imput-button-submit shadow-theme">
                            {!isLoading? <button type="submit" onClick={handleSubmitForm}>
                                <h3>{teamId === -1? "Criar":"Salvar"} Equipe</h3>
                            </button>:<button disabled>
                                <h3>Enviando...</h3>
                            </button>}
                        </div>
                        {errors.length > 0 && <div className="warning-session-title" style={{ margin: 0, marginLeft: 10}}>
                            <h1>Um ou mais campos estão incompletos!</h1>
                        </div>}</div>
                    </fieldset>
                </form>
            </div>
        </div>
        );
}

export default TeamsRegister;