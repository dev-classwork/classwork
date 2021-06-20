import React, { useState, useEffect, ChangeEvent } from 'react';
import { useHistory, useLocation } from "react-router-dom";

import HeaderAuth from '../../../components/headerAuth';
import IconsLanguage from '../../../components/iconsLanguage';

import axios from 'axios';
import api from '../../../services/api';

import checkIfIsAuthenticated from '../../../utils/checkIfIsAuthenticated';
import returnNotNullSession from '../../../utils/returnNotNullSession';
import { Repos, ActionInterface } from '../../../interfaces/global';
import { useMediaQuery }from 'react-responsive';
import { FaSync, FaAngleRight, FaAngleLeft, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import queryToStorage from '../../../utils/queryToStorage';
import imgBack from '../../../assets/group_presentation.png';

const ReposPublic = () =>{
    const history = useHistory();
    const location = useLocation();
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [reposGitHubInPage, setReposGitHubInPage] = useState<Repos[]>([]);
    const [reposGitHub, setReposGitHub] = useState<Repos[]>([]);
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadCount, setLoadCount] = useState(0);
    const [loadStage, setLoadState] = useState("Calculando quantidade de commits...");
    const reposPerPage = 100;
    const reposPageMax = Math.ceil(reposGitHub.length/reposPerPage);
    const reposPageMin = 1;

    const isMobile = useMediaQuery({ query: "screen and (max-width: 767px) and (orientation: portrait)" });

    queryToStorage(sessionStorage, history, location, 'user', 'token');
    checkIfIsAuthenticated(sessionStorage, history, location);

    useEffect(() => {
        async function getReposGitHub(){
            var url = JSON.parse(returnNotNullSession('user', '')).urls[1];
            var token = returnNotNullSession('token', '');
    
            var pages = [] as any[];
            await api.get(process.env.REACT_APP_URL_BACK + `/git/user/repos?token=${token}&page=${1}&url=${url}`)
            .then(async function(res){
                pages.push(res.data);
                for(var j = 0; j < pages.length; j++){
                    if(pages[j].length === reposPerPage){
                        var _continuosData = await axios.get(process.env.REACT_APP_URL_BACK + `/git/user/repos?token=${token}&page=${Number(j) + 2}&url=${url}`);
                        pages[Number(j) + 1] = _continuosData.data;
                    }
                }
    
                var result = [] as any[];
                for(var k in pages){
                    for(var u in pages[k]){
                        result.push(pages[k][u]);
                    }
                }
                
                setReposGitHub(result);
                setSearching(false);
            }).catch(function(err){
                history.push('/error');
            });
        }

        setSearching(true);
        getReposGitHub();
    }, [history]);

    useEffect(() => {
        var result = [];
        var startIndex = reposPerPage * (page - 1);
        var endIndex = (reposPerPage * (page));
        for(var i = startIndex; i < endIndex; i++){
            if(reposGitHub[i] !== null && reposGitHub[i] !== undefined){
                result.push(reposGitHub[i]);
            }
        }
        setReposGitHubInPage(result);
    }, [page, reposGitHub]);

    useEffect(() => {
        var result = [];
        var count = 0;
        for(var i in reposGitHub){
            if(reposGitHub[i].name.toLowerCase().includes(query.toLowerCase())){
                if(count < reposPerPage){
                    result.push(reposGitHub[i]);
                    count++;
                }else{
                    break;
                }
            }
        }

        setReposGitHubInPage(result);
    }, [query, reposGitHub]);

    var reposListGitHub = (reposGitHubInPage && reposGitHubInPage.length > 0) && reposGitHubInPage.map(function(item) {
        var namePart = item.name.split('-');

        var description = item.description;
        var name = '';

        for(var i in namePart){
            if(Number(i) >= namePart.length - 1){
                name += namePart[i];
            }else{
                name += namePart[i] + ' ';
            }
        }

        if(name.length > 24){
            name = name.substr(0, 24) + '...';
        }

        if(description === null || description === ""){
            description = "Sem descrição";
        }else if(description.length >= 128){
            description = description.substr(0, 125) + "...";
        }

        let actionName = 'actions@'+ item.commits_url.split('/')[5];
        let haveActionSave = sessionStorage.getItem(actionName.toLowerCase())? true:false;

        return (<li key={item.id}><button className="shadow-theme-lit"
            style={{ color: 'steelblue', 
                paddingBottom: haveActionSave? 0:20
            }} onClick={() => {
            if(sessionStorage.getItem('token') != null){
                getCommits(item.commits_url, name, item.description);
            }}
        }>
                <div className="repos-div-space">
                    <div>
                        <h3 className="repos-name">{name}</h3>
                        <h4 className="repos-description">{description}</h4>
                    </div>
                    <div className="repos-div-language">
                        <IconsLanguage name={item.language} size={25}/>
                        <h5 className="repos-language">{item.language}</h5>
                    </div>
                </div>
                {haveActionSave && (<div className="repos-button-reload" onClick={(e) => {handleResetAction(
                    e, actionName, item.commits_url, name, item.description
                )}}><FaSync/>Atualizar dados e abrir</div>)}
            </button>
        </li>);
    })

    function handleResetAction(e: React.MouseEvent<HTMLDivElement, MouseEvent>, 
        actionName: string, url: string, actionTitle: string, actionDescription: string){
        e.preventDefault();
        e.stopPropagation();
        sessionStorage.removeItem(actionName.toLowerCase());
        getCommits(url, actionTitle, actionDescription);
    }

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
        if((num <= reposPageMax && func === "next") || (num >= reposPageMin && func === "back")){
            setPage(num);
        }
    }

    async function getCommits(url: string, actionTitle: string, actionDescription: string){
        url = url.toLowerCase();
        setLoadState("Calculando quantidade de commits...");
        setLoading(true);
        var _loadCount = loadCount + 1; 
        const token = sessionStorage.getItem('token');
        setLoadCount(loadCount + 1);
        const reposName = url.split('/')[5];
        var actionCheck = sessionStorage.getItem('actions@'+ reposName);
        if(actionCheck == null){
            const actions: ActionInterface = {
                title: actionTitle,
                description: actionDescription,
                shas: [],
                commits: [],
                rank: [],
            };

            url = url.replace('{/sha}','');

            await axios.get(url + `?per_page=100`, {
                headers: {
                    'Authorization': 'token ' + token
                }
            }).then(async function(res){
                var pages = [res.data];
                for(var j in pages){
                    if(pages[j].length === 100*(Number(j)+1)){
                        var _continuosData = await axios.get(url + `?per_page=100&page=${Number(j)+2}`, {
                            headers: {
                                'Authorization': 'token ' + token
                            }
                        });
                        pages[Number(j) + 1] = _continuosData.data;
                    }
                }
        
                for(var k in pages){
                    if(Number(k) !== 0){
                        for(var u in pages[k]){
                            res.data.push(pages[k][u]);
                        }
                    }
                }
                
                setLoadState("Coletando dados do github...");

                const reposCommitInfo = await api.post(process.env.REACT_APP_URL_BACK + `/directory/load`, {
                    data: res.data, 
                    actions, 
                    url, 
                    token
                });


                reposCommitInfo.data.commits = reposCommitInfo.data.commits.reverse();

                async function getUniqueCommit(n: number, max: number, commits: any[], err: number){
                    setLoadState(`Extraindo informações. ${n} de ${max} commits processados.`);
                    await api.post(process.env.REACT_APP_URL_BACK + `/directory/complexy?token=${token}`, 
                        { url, commit_number: Number(n) + 1, commit: commits[n]}
                    ).then(async function(res: any){
                        reposCommitInfo.data.commits[n] = res.data.commit;

                        if(res.data.n === max){
                            commits[n] = res.data.commit;
                        }else{
                            commits[n] = res.data.commit;
                            let _commit = await getUniqueCommit(res.data.n, max, commits, err);
                            commits[res.data.n] = _commit[res.data.n];
                        }
                    }).catch(async(e) => {
                        if(err < 3){
                            commits[res.data.n] = await getUniqueCommit(n, max, commits, err + 1);
                        }else{
                            history.push('/error');
                        }
                    });

                    return commits;
                }

                reposCommitInfo.data.commits = await getUniqueCommit(0, res.data.length, reposCommitInfo.data.commits, 0);
                reposCommitInfo.data.commits = reposCommitInfo.data.commits.reverse();

                await api.get(process.env.REACT_APP_URL_BACK + `/directory/rank?repos_url=${url}`).then(async function(res: any){
                    reposCommitInfo.data.rank = res.data;
                });
                
                sessionStorage.setItem('actions@'+ reposName, JSON.stringify(reposCommitInfo.data));
            }).catch(function(){
                history.push('/error');
            });
        }
    

        if(location.pathname !== "/error"){
            sessionStorage.setItem('action',  reposName);
            setLoading(false);
            if(loadCount === _loadCount - 1){
                history.push('/git/repos/commits');
            }
        }else{
            setLoading(false);
        }
    }

    return(
        <div>
            <HeaderAuth title='Repositório'/>
            <div className="page with-scroll header-is-auth" style={{ backgroundImage: `url(${imgBack})` }}>
                <div className="title">
                    <h1>Repositórios públicos.</h1>
                    <h2>Lista de todos os seus repositórios públicos do Github:</h2>
                </div>
                <>
                    <div className="bar-list bar-list-query">
                        <h1>Pesquisar</h1>
                        <input value={query} onChange={handleChangeQuery}></input>
                        { !isMobile && <button onClick={() => {
                            setQuery('');
                        }}>Limpar</button> }
                        <h1>Página</h1><div className="bar-list-page-query">
                            <button onClick={() => {goToPage(reposPageMin, "back")}} style={{color: (page > reposPageMin)? "white":"rgb(148, 182, 211)"}}><FaAngleDoubleLeft size={18}/></button>
                            <button onClick={() => {goToPage(page - 1, "back")}} style={{color: (page > reposPageMin)? "white":"rgb(148, 182, 211)"}}><FaAngleLeft size={18}/></button>
                                
                            <input min={reposPageMin} max={reposPageMax} type="number" value={page} onChange={handleChangePage}></input>
                        
                            <button onClick={() => {goToPage(page + 1, "next")}} style={{color: (page < reposPageMax)? "white":"rgb(148, 182, 211)"}}><FaAngleRight size={18}/></button>
                            <button onClick={() => {goToPage(reposPageMax, "next")}} style={{color: (page < reposPageMax)? "white":"rgb(148, 182, 211)"}}><FaAngleDoubleRight size={18}/></button>
                        </div>
                    </div>
                </>
                <div className="container-box-list">
                    <ul>
                        {(reposGitHub && reposGitHub.length > 0)? reposListGitHub:(searching)? 
                        <div className="warning-session-title" style={{ backgroundColor: 'steelblue'}}>
                        <h1>Buscando repositórios...</h1>
                        </div>:<div className="warning-session-title" style={{ backgroundColor: 'steelblue'}}>
                        <h1>Você não possui nenhum repositório</h1>
                        </div>}
                    </ul>
                </div>
            </div>
            {loading? (<><div className="box-alert load-bar">
                    <h3>Carregando dados... Por favor, aguarde. Esse evento pode demorar conforme a quantidade de commits!</h3>
                    <div>
                        <div className="load-bar-div">
                            <div>
                                <FaSync size={18} className="rotate" color="white"/>
                                <h2>{loadStage}</h2>
                            </div>
                        </div>
                        <div className="load-bar-div-deco"/>
                    </div>
            </div><div className="load-bar-background"></div></>):null}
        </div>
    );
}

export default ReposPublic;