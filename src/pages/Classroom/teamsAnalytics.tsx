import React, { useState, useEffect, ChangeEvent } from 'react';
import { TeamsAnalyticsComponent, TeamsAnalyticsDataItem, ConfirmBoxContent, ClassInfoItem } from '../../interfaces/global';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Brush, ReferenceLine, Label } from 'recharts';
import axios from 'axios';
import moment from 'moment';
import colorConvert from 'color-convert';
import DataTable from 'react-data-table-component';

import Tooltip1 from './tooltip';
import Tooltip2 from './tooltipBalance';
import DynamicColorElement from './Profile/dynamicColorElements';

import { useHistory, useParams } from 'react-router-dom';
import { FaSync } from 'react-icons/fa';
import api from '../../services/api';
import ConfirmBox from '../../components/confirmBox';
import Icons from '../../components/icons';

const TeamsAnalytics = (props: TeamsAnalyticsComponent) => {
    const { key } = useParams<{ key: string }>();
    const history = useHistory();
    const [page, setPage] = useState(1);
    const [teams, setTeams] = useState<TeamsAnalyticsDataItem[]>([]);
    const [lastUpdate, setLastUpdate] = useState(localStorage.getItem(`classwork@${key}#lastUpdate`)? localStorage.getItem(`classwork@${key}#lastUpdate`):"Nunca");
    const [canActive, setCanActive] = useState(true);
    const [canUpdate, setCanUpdate] = useState(false);
    const [colorLightHSL, setColorLightHSL] = useState('hsl(0, 0, 0)');
    const [loadStage, setLoadState] = useState("Necessário atualizar os dados!");
    const [classInfo, setClassInfo] = useState<ClassInfoItem>();
    const [dateOfInactivity, setDateOfInactivity] = useState(
        localStorage.getItem(`classwork@${key}#dateActivity`) !== null? 
        localStorage.getItem(`classwork@${key}#dateActivity`) as string
        :moment().subtract(1, "weeks").format('YYYY-MM-DD')
    );
    const [lastDateOfInactivity, setLastDateOfInactivity] = useState(
        localStorage.getItem(`classwork@${key}#lastDateActivity`) !== null? 
        localStorage.getItem(`classwork@${key}#lastDateActivity`) as string
        :moment().format('YYYY-MM-DD')
    );
    const [confirmBoxIsEnable, setConfirmBoxIsEnable] = useState(false);
    const [confirmBoxContent, setConfirmBoxContent] = useState<ConfirmBoxContent>({
        callbackFunction: undefined,
        title: '',
        description: '',
        options: [
            { title: "Sim", returnValue: true },
            { title: "Cancelar", returnValue: false }
        ]
    })

    const initTeams = JSON.parse(String(sessionStorage.getItem('teams')));
    
    const haveOldEffort = localStorage.getItem(`classwork@${key}#effort`) !== null && localStorage.getItem(`classwork@${key}#effort`) !== undefined;
    

    var itemPerPage = 10;
    var pageMax = Math.ceil(teams.length/itemPerPage);
    var pageMin = 1;

    useEffect(() => {
        async function startLoad(){
            setCanActive(false);

            let _teams: TeamsAnalyticsDataItem[] = initTeams as any;

            async function loadTeamsEffort(i: number, i_max: number, _teams: any[], err: number){
                setLoadState(`Calculando quantidade de commits da equipe: ${i+1}/${i_max}`);
                const token = sessionStorage.getItem('token');

                _teams[i] = {
                    id: _teams[i].id,
                    repos: _teams[i].repos,
                    name: _teams[i].name,
                    commitInWeek: false,
                    details: [],
                    actions: {
                        title: "",
                        description: "",
                        shas: [],
                        commits: [],
                        rank: [],
                    },
                    balance: 1,
                    cc: 0,
                    changes: 0,
                    li: 0,
                    mt: 0,
                    value: 0,
                };

                let name = _teams[i].repos.split('/')[0];
                let repos = _teams[i].repos.split('/')[1];
                let url = `https://api.github.com/repos/${name}/${repos}/commits`;
                url = url.toLowerCase();         

                await axios.get(url + `?per_page=1&since=${dateOfInactivity}&until=${lastDateOfInactivity}`, {
                    headers: {
                        'Authorization': 'token ' + token
                    }
                }).then(async function(res){
                    if(res.data.length >= 1){
                        _teams[i].commitInWeek = true;
                    }
                })

                _teams[i].actions.title = repos;
                const actions =  _teams[i].actions;

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
                    
                    const reposCommitInfo = await api.post(process.env.REACT_APP_URL_BACK + `/directory/load`, {
                        data: res.data, 
                        actions, 
                        url, 
                        token
                    });

                    reposCommitInfo.data.commits = reposCommitInfo.data.commits.reverse();

                    async function getUniqueCommit(n: number, max: number, commits: any[], err: number){
                        setLoadState(`Extraindo informações. ${n} de ${max} commits processados. ${i} de ${i_max} equipes concluídas.`);
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
                    
                    if(i === i_max - 1){
                        _teams[i].actions = reposCommitInfo.data;
                        
                        let _teamsWithValues = _teams;

                        for(let o in _teamsWithValues){
                            if(_teamsWithValues[o].actions.commits.length >= 1){
                                for(let c in _teamsWithValues[o].actions.commits){
                                    _teamsWithValues[o].cc += _teamsWithValues[o].actions.commits[c].complexity_cyclomatic;
                                    _teamsWithValues[o].li += _teamsWithValues[o].actions.commits[c].lines;
                                    _teamsWithValues[o].mt += _teamsWithValues[o].actions.commits[c].methods;
                                    _teamsWithValues[o].changes += _teamsWithValues[o].actions.commits[c].status.total;
                                }
                               
                                
                            }

                            let qtdBots = 0;
                            for(let r in _teamsWithValues[o].actions.rank){
                                if(_teamsWithValues[o].actions.rank[r].name.includes("[bot]") || _teamsWithValues[o].actions.rank[r].name.includes("Não processado")){
                                    qtdBots++;
                                };
                            }

                            _teamsWithValues[o].value = ((
                                    ((_teamsWithValues[o].changes) * 0.5) +
                                    ((_teamsWithValues[o].cc) * 4.5)
                                )/5);
                            let qtd = _teamsWithValues[o].actions.rank.length - qtdBots;

                            let perfectRank = _teamsWithValues[o].value/qtd;
                            let totalScore = 0;
                            let scores: number[] = [];

                            for(let r in _teamsWithValues[o].actions.rank){
                                let item = _teamsWithValues[o].actions.rank[r];

                                let score = 0;

                                if(!item.name.includes("[bot]") && !item.name.includes("Não processado")){
                                    score = (
                                        (item.additions + item.deletions) * 0.5 + 
                                        (item.complexity_cyclomatic * 4.5)/5
                                    );
                                }

                                let maxScore = perfectRank;

                                if(score >= maxScore){
                                    score = maxScore;
                                }
                                

                                totalScore += score;
                                scores[Number(r)] = score;
                            }

                            
                            let lastScore = Number(((totalScore/qtd)/perfectRank).toFixed(2));
                            _teamsWithValues[o].balance = lastScore * 100;
                        }

                        localStorage.setItem(`classwork@${key}#effort`, JSON.stringify(_teamsWithValues));
                        return _teamsWithValues;
                    }else{
                        _teams[i].actions = reposCommitInfo.data;
                        let _t = await loadTeamsEffort(i + 1, i_max, _teams, err);
                        _teams[i + 1].actions = _t[i + 1];
                    }
                }).catch(async function(){
                    if(err < 3){
                        _teams[i].actions = await loadTeamsEffort(i, i_max, _teams, err + 1);
                    }else{
                        history.push('/error');
                    }
                });                    

                return _teams;
            }

            async function deleteTeam(isConfirmed: boolean, index?: string | number){
                if(!isConfirmed){
                    index = index as string | number;
                    setConfirmBoxContent({
                        index,
                        callbackFunction: deleteTeam,
                        description: "Você tem absoluta certeza de que quer desfazer essa equipe? Isso a excluirá permanentemente.",
                        title: "Confirmação",
                        options: [
                            { title: "Sim", returnValue: true },
                            { title: "Cancelar", returnValue: false }
                        ]
                    });
                    setConfirmBoxIsEnable(true);
                }else{
                    await api.delete(`/teams/delete?id=${index}&key=${key}`, {
                        headers: {
                            auth: process.env.REACT_APP_DB_IDENTITY
                        }
                    }).then(async function(){
                        await api.get(`/teams?key=${key}`, {
                            headers: {
                                auth: process.env.REACT_APP_DB_IDENTITY
                            }
                        }).then(async function(res){
                            if(res.data.length === 0){
                                localStorage.removeItem(`classwork@${key}#effort`);
                                localStorage.removeItem(`classwork@${key}#lastUpdate`);
                            }
        
                            sessionStorage.setItem('teams', JSON.stringify(res.data));

                            window.location.reload();
                        }).catch(function(){
                            history.push('/error');
                        });
                    }).catch(function(){
                        history.push('/error');
                    });
                }
            }

            async function validateTeams(){
                const token = sessionStorage.getItem('token');

                for(let i = 0; i < initTeams.length; i++){
                    initTeams[i] = {
                        id: initTeams[i].id,
                        repos: initTeams[i].repos.split('https://github.com/')[1],
                        name: initTeams[i].name + " | " + (Number(i) + 1),
                    }

                    let name = initTeams[i].repos.split('/')[0];
                    let repos = initTeams[i].repos.split('/')[1];
                    let url = `https://api.github.com/repos/${name}/${repos}/commits`;

                    let urlIsValid = true;
                    let urlError = '';

                    await axios.get(url + `?per_page=1`, {
                        headers: {
                            'Authorization': 'token ' + token
                        }
                    }).catch(function(err){
                        urlError = err.response.data.message;
                        urlIsValid = false;
                    });
            
                    if(!urlIsValid){
                        let textDescription = "Ocoreu um erro ao tentar carregar as informações do repositório! " + 
                        "Por favor, verifique se o link existe. Caso esse problema continue, cheque sua conexão ou tente mais tarde. \n\n" +
                        "Mensagem retornada: " + urlError;
            
                        let _options = urlError === "Not Found"? [
                            { title: "Recarregar", returnValue: ["reload", url.replace("/commits", ""), repos, name] },
                            { title: "Checar", returnValue: ["check", `https://github.com/${name}/${repos}`] },
                            { title: "Deletar", returnValue: ["delete"] },
                            { title: "Editar", returnValue: ["edit"] },
                            { title: "Cancelar", returnValue: ["cancel"] }
                        ]:[
                            { title: "Recarregar", returnValue: ["reload", url.replace("/commits", ""), repos, name] },
                            { title: "Checar", returnValue: ["check", `https://github.com/${name}/${repos}`] },
                            { title: "Cancelar", returnValue: ["cancel"] }
                        ]

                        localStorage.removeItem(`classwork@${key}#effort`);

                        let index = initTeams[i].id;

                        setConfirmBoxContent({
                            index,
                            callbackFunction: checkTeam,
                            description: textDescription,
                            title: "Aviso",
                            options: _options
                        });
                        setConfirmBoxIsEnable(true);

                        return false;
                    }
                };

                return true;
            };

            async function checkTeam(isReturned: string[], index?: string | number){
                switch(isReturned[0]){
                    case("reload"): 
                        await checkTeamsStorage();
                        break;
                    case("delete"):
                        await deleteTeam(true, index);
                        break;
                    case("edit"):
                        history.push(`/class/${key}/teams/edit/${index}`);
                        break;
                    case("check"): 
                        window.open(isReturned[1], "_blank noopener noreferrer");
                        break;
                    case("cancel"):                   
                        break;
                }
            }

            async function checkTeamsStorage(){
                let isValidate = await validateTeams();
                if(haveOldEffort && isValidate){
                    let _oldTeams: TeamsAnalyticsDataItem[] = await JSON.parse(String(localStorage.getItem(`classwork@${key}#effort`)));
                    setTeams(_oldTeams);

                    let returnedValues = _oldTeams.map((item) => {
                        return {
                            repos: item.repos,
                            points: Number((item.cc + item.mt * 0.8 + item.li * 0.2/2)).toFixed(2),
                            porcent: item.balance
                        };
                    });

                    props.returnedValues(returnedValues);
                }else if(isValidate){
                    let _newTeams: TeamsAnalyticsDataItem[] = await loadTeamsEffort(0, _teams.length, _teams, 0) as TeamsAnalyticsDataItem[];
                    setTeams(_newTeams);

                    let returnedValues = _newTeams.map((item) => {
                        return {
                            repos: item.repos,
                            points: Number((item.cc + item.mt * 0.8 + item.li * 0.2/2)).toFixed(2),
                            porcent: item.balance
                        };
                    });

                    props.returnedValues(returnedValues);

                    let today = moment().format('DD/MM/YYYY HH:mm');
                    localStorage.setItem(`classwork@${key}#lastUpdate`, today);
                    setLastUpdate(today);
                }
            }
            
            await checkTeamsStorage();
            setCanActive(true);
        }

        let initTeams = JSON.parse(String(sessionStorage.getItem('teams')));

        if((initTeams !== undefined && localStorage.getItem(`classwork@${key}#effort`) !== null) || canUpdate){
            startLoad();
            setCanUpdate(false);
        }
    }, [haveOldEffort, canUpdate]);

    useEffect(() => {
        async function getClassInfo(){
            var _data;
            await api.get(`/classes?key=${key}`, {
                headers: {
                    auth: process.env.REACT_APP_DB_IDENTITY
                }
            }).then(async function(res){
                _data = res.data as ClassInfoItem;
            }).catch(function(err){
                history.push('/error');
            });

            setClassInfo(_data);
        }

        getClassInfo();
    }, [key, history]);

    useEffect(() => {
        if(classInfo !== null && classInfo !== undefined){
            const colorHSL = colorConvert.hex.hsl(classInfo.color.replace('#', ''));
            setColorLightHSL(`hsl(${colorHSL[0]}, ${colorHSL[1] + 23}%, ${colorHSL[2] + 5}%)`);
        }
    }, [classInfo]);

    function handleExecuteIdEvent(value: any, callbackFunction: Function | undefined, index?: string | number){
        if(value && callbackFunction && index !== null){
            callbackFunction(value, index);
        }else if(value && callbackFunction){
            callbackFunction(value);
        }

        setConfirmBoxIsEnable(false);
    }

    function handleReset(){
        localStorage.removeItem(`classwork@${key}#effort`);
        setCanUpdate(true);
        setCanActive(false);
    }

    let inactiveTeamCount = 0;
    let haveInactiveTeam = false;

    for(let q = 0; q < teams.length; q++){
        if(!teams[q].commitInWeek && teams[q].commitInWeek !== undefined){
            haveInactiveTeam = true;
            inactiveTeamCount++;
        }
    }

    function handleChangePage(e: ChangeEvent<HTMLInputElement>){
        setPage(Number(e.target.value));
    }

    function goToPage(num: number, func: string){
        if((num <= pageMax && func === "next") || (num >= pageMin && func === "back")){
            setPage(num);
        }
    }

    return(<div className="fade-in">
        {classInfo && <ConfirmBox
            primaryColor={classInfo.color} 
            secundaryColor={colorLightHSL}
            enable={confirmBoxIsEnable}
            description={confirmBoxContent.description}
            title={confirmBoxContent.title}
            callbackFunction={confirmBoxContent.callbackFunction}
            index={confirmBoxContent.index as string | number}
            options={confirmBoxContent.options}
            onChoose={handleExecuteIdEvent}
        />}
        {initTeams && <div className="fade-in">
            <h1 className="commmits-chart-title" 
            style={{ color: props.primaryColor }}
            >Empenho das equipes</h1>
            <h2 className="commmits-chart-subtitle"
                style={{ whiteSpace: 'pre-wrap', color: props.primaryColor, marginBottom: 10 }}
            >Visualize o empenho de todas as suas equipes com facilidade.
            Também é possivel averiguar o quanto os maiores autores contribuiram no código.
            </h2>
            <div className="bar-list bar-list-query" style={{ justifyContent: "center" }}>
                <DynamicColorElement 
                    primaryColor={props.primaryColor}
                    secundaryColor={'whitesmoke'}
                    type="button"
                    disable={!canActive}
                    onClickButton={handleReset}
                >
                    Atualizar
                </DynamicColorElement>
                <h1 style={{ backgroundColor: props.secundaryColor }}>Data da última atualização</h1>
                <p style={{ backgroundColor:props.primaryColor }}>{lastUpdate}</p>
                <h1 style={{ backgroundColor: props.secundaryColor }}>Equipes carregadas</h1>
                <p style={{ backgroundColor:props.primaryColor }}>{teams.length}</p>
            </div>
            <div className="bar-list bar-list-query" style={{ justifyContent: "center" }}>
                <h1 style={{ backgroundColor: props.secundaryColor }}>Equipes inativas</h1>
                <p style={{ backgroundColor:props.primaryColor }}>{inactiveTeamCount}</p>
                <h1 style={{ backgroundColor: props.secundaryColor }}>Checar inatividade de </h1>
                <DynamicColorElement value={dateOfInactivity}
                    primaryColor={props.primaryColor}
                    secundaryColor={'whitesmoke'}
                    type="input-date"
                    disable={!canActive}
                    onChangeInput={(e) => {
                        setDateOfInactivity(e.currentTarget.value);
                        localStorage.setItem(`classwork@${key}#dateActivity`, e.currentTarget.value);
                    }}
                ></DynamicColorElement>
                <h1 style={{ backgroundColor: props.secundaryColor }}>ate</h1>
                <DynamicColorElement value={lastDateOfInactivity}
                    primaryColor={props.primaryColor}
                    secundaryColor={'whitesmoke'}
                    type="input-date"
                    disable={!canActive}
                    onChangeInput={(e) => {
                        setLastDateOfInactivity(e.currentTarget.value);
                        localStorage.setItem(`classwork@${key}#lastDateActivity`, e.currentTarget.value);
                    }}
                ></DynamicColorElement>
                <DynamicColorElement 
                    type="button"
                    primaryColor={props.primaryColor}
                    secundaryColor={'whitesmoke'}
                    onClickButton={() => {
                        setDateOfInactivity(moment().format('YYYY-MM-DD'));
                        setLastDateOfInactivity(moment().format('YYYY-MM-DD'));
                }}>Limpar</DynamicColorElement>
            </div>
            <div className="teams-analytics-grafic">
                { teams && teams?.length > 0 && canActive? <BarChart
                    className="fade-in"
                    width={1100}
                    height={450}
                    data={teams}
                    margin={{
                        top: 20, right: 30, left: 20, bottom: 5,
                    }}
                    barSize={20}
                >
                    <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }}/>
                    <YAxis dataKey="value" yAxisId="left" orientation="left" stroke={props.primaryColor} tickMargin={10}/> 
                    <Tooltip content={Tooltip1}/>
                    <CartesianGrid strokeDasharray="3 3" />
                    <Bar dataKey="value" yAxisId="left"  fill={props.primaryColor}/>
                </BarChart>:<div className="load-teams-screen">
                    { loadStage !== "Necessário atualizar os dados!"? 
                    <FaSync size={30} className="rotate" color={props.primaryColor}/>:null }
                    <h1>{loadStage}</h1>
                </div>}
            </div>
            { teams && teams?.length > 0 && canActive && <div className="teams-analytics-grafic">
                <BarChart
                    className="fade-in"
                    width={1100}
                    height={270}
                    data={teams}
                    margin={{
                        top: 20, right: 30, left: 20, bottom: 5,
                    }}
                    barSize={20}
                >
                    <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }}/>
                    <YAxis dataKey="balance" yAxisId="left" orientation="left" stroke={props.secundaryColor} tickMargin={10} unit="%"/>
                    <Tooltip content={Tooltip2}/>
                    <CartesianGrid strokeDasharray="3 3" />
                    <Bar dataKey="balance" yAxisId="left" fill={props.secundaryColor} unit="%"/>
                    <ReferenceLine yAxisId="left" label={
                        <Label value="60%" position="insideBottomLeft"/>
                    } y={60} stroke={'black'}/>
                </BarChart>
            </div> }
            {teams && teams?.length > 0 && canActive &&  <>
            <h1 className="commmits-chart-title">Registro Geral</h1>
            <h2 className="commmits-chart-subtitle">Veja todas as informações</h2>
            <div className="table-page-control-div">
                <button onClick={() => {goToPage(pageMin, "back")}} style={{color: (page > pageMin)? "rgb(70, 130, 180)":"rgb(148, 182, 211)"}}><Icons name="double-back" size={25} color="white"/></button>
                <button onClick={() => {goToPage(page - 1, "back")}} style={{color: (page > pageMin)? "rgb(70, 130, 180)":"rgb(148, 182, 211)"}}><Icons name="back" size={25} color="white"/></button>
                    
                <input min={pageMin} max={pageMax} type="number" value={page} onChange={handleChangePage}></input>
            
                <button onClick={() => {goToPage(page + 1, "next")}} style={{color: (page < pageMax)? "rgb(70, 130, 180)":"rgb(148, 182, 211)"}}><Icons name="next" size={25} color="white"/></button>
                <button onClick={() => {goToPage(pageMax, "next")}} style={{color: (page < pageMax)? "rgb(70, 130, 180)":"rgb(148, 182, 211)"}}><Icons name="double-next" size={25} color="white"/></button>
            </div>
            <table className="table-commits">
                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Nome</th>
                        <th>Repositório</th>
                        <th>Qtd. Alterações</th>
                        <th>Qtd. Métodos</th>
                        <th>C. Ciclomatica</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                {
                    teams.map(function(item: TeamsAnalyticsDataItem, index: number){
                        if((index+1) > (itemPerPage*(page-1)) && (index+1) <= (itemPerPage*(page))){
                            return(<tr key={index} className="table-commits-tr">
                                <td className="table-commits-tr-td table-commits-tr-td-text table-id">{index + 1}</td>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-alt">{item.name.split("|")[0]}</td>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-alt">{item.repos}</td>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-alt">{item.changes}</td>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-alt">{item.mt}</td>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-alt">{item.cc}</td>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-alt">{item.commitInWeek? "Ativo":"Inativo"}</td>
                            </tr>);
                        }else{
                            return null;
                        }
                    })
                }
                </tbody>
            </table>
            <h1 className="commmits-chart-title" 
                style={{ color: props.primaryColor }}
            >Equipes inativas</h1>
            <h2 className="commmits-chart-subtitle"
                style={{ whiteSpace: 'pre-wrap', color: props.primaryColor, marginBottom: 10 }}
            >Equipes que não commitaram nada no github.
            </h2>
            { teams && teams?.length > 0 && canActive && <div className="container-box-list">
                <ul>
                    {teams.map(function(item, index){
                        
                        if(!item.commitInWeek && item.commitInWeek !== undefined){
                            return(<li key={index}>
                                <div className="shadow-theme-lit-current-color">
                                    <div className="not-commit-in-week-team">
                                        <h3>{item.name}</h3>
                                        <h4>{item.repos}</h4>
                                    </div>
                                </div>
                            </li>);
                        }

                        return null;
                    })}
                </ul>
            </div>}
            
            {(canActive && (!teams || !haveInactiveTeam)) && <div className="load-teams-screen"
                style={{
                    height: 50
                }}
            >
                <h1>Todas as suas equipes estão ativas!!!</h1>
            </div>}
            </>}
        </div>}
    </div>);
}

export default TeamsAnalytics;