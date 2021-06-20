import React, { useState, useEffect, ChangeEvent } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import fileDownload from 'js-file-download';

import api from '../../services/api';

import HeaderAuth from '../../components/headerAuth';
import { useMediaQuery }from 'react-responsive';
import { FaAngleRight, FaAngleLeft, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import imgBack from '../../assets/report_analysis.png';

const Tools = () => {
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [logsInPage, setLogsInPage] = useState<{
        filename: string,
        repos: string
    }[]>([]);
    const [logs, setLogs] = useState<{
        filename: string,
        repos: string
    }[]>([]);

    const logsPerPage = 100;
    const logsPageMax = Math.ceil(logs.length/logsPerPage);
    const logsPageMin = 1;

    const isMobile = useMediaQuery({ query: "screen and (max-width: 767px) and (orientation: portrait)" });

    function handleChangeQuery(e: ChangeEvent<HTMLInputElement>){
        if(e.currentTarget.value === null || e.currentTarget.value === undefined){
            e.currentTarget.value = '';
        }
        setQuery(e.currentTarget.value);
    }

    function handleChangePage(e: ChangeEvent<HTMLInputElement>){
        setPage(Number(e.target.value));
    }

    function goToPage(num: number, func: string){
        if((num <= logsPageMax && func === "next") || (num >= logsPageMin && func === "back")){
            setPage(num);
        }
    }

    useEffect(() => {
        setSearching(true);
        api.get(`/logs`).then(async function(res){
            setLogs(res.data);
            setSearching(false);
        });
    }, []);

    useEffect(() => {
        let result = [];
        let count = 0;
        for(let i in logs){
            console.log(logs);
            if(logs[i].repos !== undefined && logs[i].repos !== null){
                let repos = logs[i].repos.toLowerCase();

                if(repos.includes(query.toLowerCase())){
                    if(count < logsPerPage){
                        result.push(logs[i]);
                        count++;
                    }else{
                        break;
                    }
                }
            }
        }

        setLogsInPage(result);
    }, [logs, query]);


    return(
        <div>
            <HeaderAuth title='Ferramentas'/>
            <div className="page with-scroll header-is-auth" style={{ backgroundImage: `url(${imgBack})` }}>
                <div className="title">
                    <h1>Buscar logs.</h1>
                    <h2>Procure pelos arquivos de logs de um repositório especifico:</h2>
                </div>
                <>
                    <div className="bar-list bar-list-query">
                        <h1>Pesquisar</h1>
                        <input value={query} onChange={handleChangeQuery}></input>
                        { !isMobile && <button onClick={() => {
                            setQuery('');
                        }}>Limpar</button> }
                        <h1>Página</h1><div className="bar-list-page-query">
                            <button onClick={() => {goToPage(logsPageMin, "back")}} style={{color: (page > logsPageMin)? "white":"rgb(148, 182, 211)"}}><FaAngleDoubleLeft size={18}/></button>
                            <button onClick={() => {goToPage(page - 1, "back")}} style={{color: (page > logsPageMin)? "white":"rgb(148, 182, 211)"}}><FaAngleLeft size={18}/></button>
                                
                            <input min={logsPageMin} max={logsPageMax} type="number" value={page} onChange={handleChangePage}></input>
                        
                            <button onClick={() => {goToPage(page + 1, "next")}} style={{color: (page < logsPageMax)? "white":"rgb(148, 182, 211)"}}><FaAngleRight size={18}/></button>
                            <button onClick={() => {goToPage(logsPageMax, "next")}} style={{color: (page < logsPageMax)? "white":"rgb(148, 182, 211)"}}><FaAngleDoubleRight size={18}/></button>
                        </div>
                    </div>
                </>
                <div className="container-box-list">
                    <ul>
                        {
                           logsInPage && logsInPage.length > 0? logsInPage.map((item, index) => {

                                return(
                                    <li key={index}>
                                        <button className="shadow-theme-lit"
                                            style={{ 
                                                color: 'steelblue', 
                                                paddingBottom: 20 
                                            }} onClick={() => {
                                                api.get(`/log/${item.filename}`).then(async function(res){
                                                    fileDownload(res.data, item.filename.replace("[@]", "."));
                                                });
                                            }}
                                            >
                                            <div className="repos-div-space">
                                                <div>
                                                    <h3 className="repos-name">{item.repos.split(" | ")[1]}</h3>
                                                    <h4 className="repos-description">{item.repos.split(" | ")[0]}</h4>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                );
                            }):searching?
                            <div className="warning-session-title" style={{ backgroundColor: 'steelblue'}}>
                            <h1>Buscando logs...</h1>
                            </div>:<div className="warning-session-title" style={{ backgroundColor: 'steelblue'}}>
                            <h1>Nenhum log disponível</h1>
                            </div>
                        }
                    </ul>
                </div>
                <div className="title">
                    <h1>Calculadora de equilibrio.</h1>
                    <h2>Em produção...</h2>
                </div>
                <div className="title">
                    <h1>Carregar repositório pelo link.</h1>
                    <h2>Em produção...</h2>
                </div>
            </div>
        </div>
    );
}

export default Tools;