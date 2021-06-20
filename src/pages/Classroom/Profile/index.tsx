import React, { useEffect, useState } from 'react';
import { useParams, Link, useHistory, useLocation } from 'react-router-dom';

import HeaderAuth from '../../../components/headerAuth';
import Painel from '../../../components/painel';
import DynamicColorElement from './dynamicColorElements';
import ConfirmBox from '../../../components/confirmBox';
import TeamsAnalytics from '../teamsAnalytics';

import api from '../../../services/api';
import axios from 'axios';
import colorConvert from 'color-convert';

import { ClassInfoItem, ClassTeacherItem, TeamsItem, ActionInterface, ConfirmBoxContent, TeamWithValues } from '../../../interfaces/global';
import { FaSync, FaHammer, FaTimes } from 'react-icons/fa';
import returnNotNullSession from '../../../utils/returnNotNullSession';

const ClassroomProfile = () => {
    const history = useHistory();
    const location = useLocation();
    const user = JSON.parse(returnNotNullSession('user', ''));
    const { key } = useParams<{ key: string }>();
    const date = Date.now(); 
    const [colorLightHSL, setColorLightHSL] = useState('hsl(0, 0, 0)');
    const [colorSuperLightHSL, setColorSuperLightHSL] = useState('hsl(0, 0, 0)');
    const [query, setQuery] = useState('');
    const [classInfo, setClassInfo] = useState<ClassInfoItem>();
    const [classTeacher, setClassTeacher] = useState<ClassTeacherItem>();
    const [classTeams, setClassTeams] = useState<TeamsItem[]>([]);
    const [classTeamsQuery, setClassTeamsQuery] = useState<TeamsItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadCount, setLoadCount] = useState(0);
    const [loadStage, setLoadState] = useState("Calculando quantidade de commits...");
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
    
    useEffect(() => {
        async function getClassInfo(){
            var _data;
            var _teacherData;
            await api.get(`/classes?key=${key}`, {
                headers: {
                    auth: process.env.REACT_APP_DB_IDENTITY
                }
            }).then(async function(res){
                _data = res.data as ClassInfoItem;
                await api.get(`/users?id=${_data.teacher_id}`, {
                    headers: {
                        auth: process.env.REACT_APP_DB_IDENTITY
                    }
                }).then(function(res){
                    _teacherData = {
                        git_id: res.data.git_id,
                        id_auth: res.data.id_auth,
                        real_name: res.data.real_name,
                        name: res.data.name,
                        avatar: res.data.avatar
                    };
                }).catch(function(err){
                    history.push('/error');
                });
            }).catch(function(err){
                history.push('/error');
            });

            setClassTeacher(_teacherData);
            setClassInfo(_data);
        }

        async function getClassTeams(){
            await api.get(`/teams?key=${key}`, {
                headers: {
                    auth: process.env.REACT_APP_DB_IDENTITY
                }
            }).then(async function(res){
                setClassTeams(res.data);
                sessionStorage.setItem('teams', JSON.stringify(res.data));
            }).catch(function(){
                history.push('/error');
            });
        }

        getClassInfo();
        getClassTeams();
    }, [key, history]);

    useEffect(() => {
        if(classInfo !== null && classInfo !== undefined){
            const colorHSL = colorConvert.hex.hsl(classInfo.color.replace('#', ''));
            setColorLightHSL(`hsl(${colorHSL[0]}, ${colorHSL[1] + 23}%, ${colorHSL[2] + 5}%)`);
            setColorSuperLightHSL(`hsl(${colorHSL[0]}, ${colorHSL[1] + 34}%, ${colorHSL[2] + 14}%)`);
        }
    }, [classInfo]);

    useEffect(() => {
        var result = [];
        for(var i in classTeams){
            let repos = classTeams[i].repos.toLowerCase().split('https://github.com/')[1];
            let reposUserName = repos.split('/')[0];
            let reposName = repos.split('/')[1];
            if(classTeams[i].name.toLowerCase().includes(query.toLowerCase()) ||
            reposUserName.includes(query.toLocaleLowerCase()) ||
            reposName.includes(query.toLocaleLowerCase())){
                result.push(classTeams[i]);
            }
        }

        setClassTeamsQuery(result);
    }, [classTeams, query]);

    function handleChangeQuery(e: React.ChangeEvent<HTMLInputElement>){
        if(e.currentTarget.value === null || e.currentTarget.value === undefined){
            e.currentTarget.value = '';
        }
        setQuery(e.currentTarget.value);
    }

    function handleResetAction(e: React.MouseEvent<HTMLDivElement, MouseEvent>, 
        actionAuthor: string, actionTitle: string, actionName: string){
        e.preventDefault();
        e.stopPropagation();
        sessionStorage.removeItem(actionName);
        getCommits(actionAuthor, actionTitle, actionName);
    }

    function handleExecuteIdEvent(value: any, callbackFunction: Function | undefined, index?: string | number){
        if(value && callbackFunction && index){
            callbackFunction(value, index);
        }else if(value && callbackFunction){
            callbackFunction(value);
        }

        setConfirmBoxIsEnable(false);
    }

    function handleUpdateTeamsToPlaceValues(teamsWithValues: TeamWithValues[]){

        console.log(teamsWithValues, "teamsWithValues");
        
        let lastTeamsUpdate = classTeams.map((item) => {
            for(let w in teamsWithValues){
                if(item.repos.toLowerCase() === "https://github.com/" + teamsWithValues[w].repos.toLowerCase()){
                    console.log("achou", item.repos);
                    return {
                        id: item.id,
                        name: item.name,
                        repos: item.repos,
                        points: teamsWithValues[w].points,
                        porcent: teamsWithValues[w].porcent
                    }
                }
            }

            return item;
        });

        console.log(lastTeamsUpdate, "returnedValues");
         
        setClassTeams(lastTeamsUpdate);
    }

    async function deleteTeam(isConfirmed: boolean, index?: string | number){
        if(!isConfirmed){
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
                    setClassTeams(res.data);

                    if(res.data.length === 0){
                        localStorage.removeItem(`classwork@${key}#effort`);
                        localStorage.removeItem(`classwork@${key}#lastUpdate`);
                    }

                    sessionStorage.setItem('teams', JSON.stringify(res.data));
                }).catch(function(){
                    history.push('/error');
                });
            }).catch(function(){
                history.push('/error');
            });
        }
    }

    async function deleteClass(isConfirmed: boolean, key?: string | number){
        if(!isConfirmed){
            setConfirmBoxContent({
                index: key,
                callbackFunction: deleteClass,
                description: "Você tem absoluta certeza de que quer desfazer essa turma? Isso a excluirá permanentemente." +
                "\n\nTodas as suas equipes relacionadas a essa turma serão apagadas!!!",
                title: "Confirmação",
                options: [
                    { title: "Deletar Turma", returnValue: true },
                    { title: "Cancelar", returnValue: false }
                ]
            });
            setConfirmBoxIsEnable(true);
        }else{
            let teacher_id = 1;
        
            await api.get(`/users?git_id=${user.git_id}`, {
                headers: {
                    auth: process.env.REACT_APP_DB_IDENTITY
                }
            }).then(function(res) {
                localStorage.removeItem(`classwork@${key}#effort`);
                localStorage.removeItem(`classwork@${key}#lastUpdate`);
                teacher_id = res.data.id;
            }).catch(function(err) {
                console.log(err.response.data.message)
                history.push('/error');
            });

            await api.delete(`/class/delete?teacher_id=${teacher_id}&key=${key}`, {
                headers: {
                    auth: process.env.REACT_APP_DB_IDENTITY
                }
            }).then(async function(){
                await api.get(`/users?git_id=${user.git_id}`, {
                    headers: {
                        auth: process.env.REACT_APP_DB_IDENTITY
                    }
                }).then(function(res) {
                    sessionStorage.setItem('user', JSON.stringify(res.data));
                    history.push('/class');
                }).catch(function(err) {
                    console.log(err.response.data.message)
                    history.push('/error');
                });
            }).catch(function(err){
                console.log(err.response.data.message)
                history.push('/error');
            });
        }
    }

    async function checkTeam(isReturned: string[], index?: string | number){
        switch(isReturned[0]){
            case("reload"): 
                getCommits(isReturned[1], isReturned[2], isReturned[3], index);
                break;
            case("delete"): 
                deleteTeam(true, index);
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

    async function getCommits(url: string, actionTitle: string, actionAuthor: string, index?: string | number){
        url = url.toLowerCase();

        setLoadState("Calculando quantidade de commits...");
        setLoading(true);
        var _loadCount = loadCount + 1; 
        const token = sessionStorage.getItem('token');

        let primaryUrl = `https://api.github.com/repos/${actionAuthor}/${actionTitle}`;
        let actionDescription = '';

        primaryUrl = primaryUrl.toLowerCase();
  
        setLoadCount(loadCount + 1);
        
        let urlIsValid = true;
        let urlError = '';
        await axios.get(primaryUrl, {
            headers: {
                'Authorization': 'token ' + token
            }
        }).then(async function(res){
            actionDescription = res.data.description;
            url = res.data.commits_url.toLowerCase();
        }).catch(function(err){
            urlError = err.response.data.message;
            urlIsValid = false;
        });

        if(!urlIsValid){
            let textDescription = "Ocoreu um erro ao tentar carregar as informações do repositório! " + 
            "Por favor, verifique se o link existe. Caso esse problema continue, cheque sua conexão ou tente mais tarde. \n\n" +
            "Mensagem retornada: " + urlError;

            let _options = urlError === "Not Found"? [
                { title: "Recarregar", returnValue: ["reload", primaryUrl, actionTitle, actionAuthor] },
                { title: "Checar", returnValue: ["check", `https://github.com/${actionAuthor}/${actionTitle}`] },
                { title: "Deletar", returnValue: ["delete"] },
                { title: "Editar", returnValue: ["edit"] },
                { title: "Cancelar", returnValue: ["cancel"] }
            ]:[
                { title: "Recarregar", returnValue: ["reload", primaryUrl, actionTitle, actionAuthor] },
                { title: "Checar", returnValue: ["check", `https://github.com/${actionAuthor}/${actionTitle}`] },
                { title: "Cancelar", returnValue: ["cancel"] }
            ]
            setConfirmBoxContent({
                index,
                callbackFunction: checkTeam,
                description: textDescription,
                title: "Aviso",
                options: _options
            });
            setConfirmBoxIsEnable(true);
            setLoading(false);
            return;
        }

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
                history.push(`/class/${key}/teams/commits`);
            }
        }else{
            setLoading(false);
        }
    }

    return(
        <div>
            <HeaderAuth title="" headerBarTop={false} primaryButtonColor={colorLightHSL} 
                secundaryButtonColor={classInfo?.color}
            />
            <Painel haveBarTop={false} color={colorLightHSL} forceReturn="/class"/>
            { classInfo && classTeacher && <ConfirmBox
                primaryColor={classInfo.color} 
                secundaryColor={colorLightHSL}
                enable={confirmBoxIsEnable}
                description={confirmBoxContent.description}
                title={confirmBoxContent.title}
                callbackFunction={confirmBoxContent.callbackFunction}
                index={confirmBoxContent.index}
                options={confirmBoxContent.options}
                onChoose={handleExecuteIdEvent}
            />}
            <div className="page with-scroll header-is-auth full-height current-theme" style={{ color: classInfo?.color }}>
                <div style={{ display: "flex", justifyContent: "center" }} className="fade-in">
                { classInfo && classTeacher && <>
                <div style={{ display: 'flex', flexDirection: 'column', width: '50%'}}>
                    <div className="class-profile shadow-theme-lit-current-color" style={{ color: classInfo.color }}>
                        <div>
                            <div className='class-profile-banner'
                            style={{ backgroundImage: `url(${process.env.REACT_APP_URL_BACK}/classes/uploads/${classInfo.image}?${date})`}}>
                            </div>
                        </div>
                        <div className='class-profile-banner-info'>
                            <img src={user.avatar} alt="professor"/>
                            <div>
                                <h1>{classInfo.name}</h1>
                                <h3>{classTeacher.real_name !== null? classTeacher.real_name + " | ":""}{classTeacher.name}</h3>
                                <div className="info-painel-class">
                                    <p style={{ backgroundColor: classInfo.color }}>Equipes: {classTeams.length}/25</p>
                                    
                                    <span><div><DynamicColorElement
                                        primaryColor={colorLightHSL}
                                        secundaryColor={"whitesmoke"}
                                        type="button"
                                        onClickButton={() => { deleteClass(false, key) }}
                                    >Apagar Turma</DynamicColorElement>
                                    </div></span>

                                    <p style={{ backgroundColor: classInfo.color }}> Mantenha em cima</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {classInfo.description && <div className='class-profile-banner-info-description theme-color-scrollbar shadow-theme-lit-current-color' style={{ color: classInfo.color }}>
                        <p>{classInfo.description}</p>
                    </div>}
                </div>
                <div className='class-profile-area' style={{ color: classInfo.color }}>
                    <div>
                        <Link style={{ color: classInfo.color }} to={`/class/${key}/teams/create`} className="classses-info-block-item shadow-theme-lit-current-color plus-button-teams">
                            <div className="block-item-text">
                                <h1>Nova Equipe</h1>
                                <h2>Forme uma nova equipe na sua turma!</h2>
                            </div>
                        </Link>
                        <Link style={{ color: classInfo.color }} to={`/class/${key}/edit`} className="classses-info-block-item shadow-theme-lit-current-color plus-button-teams">
                            <div className="block-item-text">
                                <h1>Editar Turma</h1>
                                <h2>Altere as informações dessa turma.</h2>
                            </div>
                        </Link>
                    </div>
                    <div>
                        <div className="bar-list bar-list-query">
                            <h1 style={{ backgroundColor: colorLightHSL }}>Pesquisar</h1>
                            <DynamicColorElement value={query}
                                type="input"
                                onChangeInput={handleChangeQuery}
                                primaryColor={classInfo.color}
                                secundaryColor={'whitesmoke'}
                            ></DynamicColorElement>
                            <DynamicColorElement 
                                type="button"
                                primaryColor={classInfo.color}
                                secundaryColor={'whitesmoke'}
                                onClickButton={() => {
                                setQuery('');
                            }}>Limpar</DynamicColorElement>
                        </div>
                    </div>
                    <div className="query-list">
                        {classTeamsQuery && classTeamsQuery.map(function(item, index){
                            let repos = item.repos.split('https://github.com/')[1];
                            let reposUserName = repos.split('/')[0];
                            let actionTitle = repos.split('/')[1];
                            let actionComplete = 'teamsActions@'+ actionTitle;
                            let haveActionSave = sessionStorage.getItem(actionTitle)? true:false;
                            let reposNameWithSpace = actionTitle.replace(/-/g, ' ');

                            return(<div key={index} className="classses-info-block-item-div">
                                <div className="classses-info-block-item shadow-theme-lit-current-color"
                                onClick={() => {
                                    if(sessionStorage.getItem('token') != null){
                                        getCommits(item.repos, actionTitle, reposUserName, item.id);
                                    }
                                }}>
                                    <div className="block-item-text">
                                        <h1>{item.name}{ item.points && item.porcent? `: [${item.points} | ${item.porcent}%]`:null}</h1>
                                        <h2>{reposUserName} | {reposNameWithSpace}</h2>
                                    </div>
                                    {haveActionSave && (<DynamicColorElement
                                        type="reload-div"
                                        primaryColor={colorLightHSL}
                                        secundaryColor={'whitesmoke'}
                                        onClickButton={(e) => {handleResetAction(
                                            e, reposUserName, actionTitle, actionComplete
                                    )}}><FaSync/>Atualizar dados e abrir</DynamicColorElement>)}
                                </div>
                            <div className="classses-info-block-item-edit-div">
                                <FaHammer 
                                    className="classses-info-block-item-edit" 
                                    size={23} 
                                    color={classInfo.color}
                                    onClick={() => {
                                        history.push(`/class/${key}/teams/edit/${item.id}`);
                                    }}
                                />
                                <FaTimes 
                                    className="classses-info-block-item-edit " 
                                    style={{ marginLeft: -3 }} 
                                    size={28} 
                                    color={classInfo.color}
                                    onClick={() => { deleteTeam(false, item.id) }}
                                />
                            </div>
                        </div>); 
                        })}
                        {classTeams && classTeams.length === 0? (<div className="classses-info-block-item shadow-theme-lit-current-color">
                            <div className="block-item-text">
                                <h1>Não há nenhuma equipe registrada!</h1>
                                <h2>Por favor, crie uma.</h2>
                            </div>
                        </div>):null}
                        {classTeams.length !== 0 && classTeamsQuery.length === 0? (<div className="classses-info-block-item shadow-theme-lit-current-color">
                            <div className="block-item-text">
                                <h1>Equipe não encontrada!</h1>
                                <h2>Confirme se digitou corretamente.</h2>
                            </div>
                        </div>):null}
                    </div>
                </div></>}
            </div>
                {classTeams && classInfo && classTeacher && classTeams.length !== 0 && 
                <TeamsAnalytics
                    returnedValues={(e) => handleUpdateTeamsToPlaceValues(e)}
                    primaryColor={classInfo.color} 
                    secundaryColor={colorLightHSL}
                />}
        </div>
        
        {loading && classInfo? (<><div className="box-alert load-bar">
            <h3 style={{ backgroundColor: colorLightHSL }}>Carregando dados... Por favor, aguarde. Esse evento pode demorar conforme a quantidade de commits!</h3>
            <div>
                <div className="load-bar-div">
                    <div style={{ backgroundColor: classInfo?.color }}>
                        <FaSync size={18} className="rotate" color="white"/>
                        <h2>{loadStage}</h2>
                    </div>
                </div>
                <div className="load-bar-div-deco" style={{ backgroundColor: colorSuperLightHSL }}/>
            </div>
        </div><div className="load-bar-background"></div></>):null}
    </div>);
}

export default ClassroomProfile;
