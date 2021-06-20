import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useMediaQuery }from 'react-responsive';
import { ClassworkMenu, HeaderComponent } from '../interfaces/global';

import Icons from './icons';

import logoutGit from '../utils/logout';

const HeaderAuth = (props: HeaderComponent) => {
    const history = useHistory();
    const location = useLocation();

    const [isLoaded, setIsLoaded] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [expandedKey, setExpandedKey] = useState('');
    const [gitHub, setGitHub] = useState<ClassworkMenu[]>([]);
    const [canTry, setCanTry] = useState(true);
    
    const canHeaderBarTop = !(props.headerBarTop === null || props.headerBarTop === undefined)? props.headerBarTop:true;
    const isMobile = useMediaQuery({ query: "screen and (max-width: 767px) and (orientation: portrait)" });
    const _route = location.pathname;

    let _sessionUser = sessionStorage.getItem('user');

    if(!(_sessionUser === null || _sessionUser === undefined)){
        var user = JSON.parse(_sessionUser);
    }else{
        history.push('/');
    }
    
    getGitHubUrls();

    var listOptions = gitHub.map(function(item){
        const isSelected = _route === String(item.route);

        return (<div key={item.id} onClick={() => {openUrl(item.route)}}
        style={{ color: props.secundaryButtonColor? 
        props.secundaryButtonColor:"steelblue" }}
        onMouseEnter={() => { if(!isSelected){ handleMouseEnter(String(item.id)) }}}
        onMouseLeave={handleMouseLeave}>
            <div id="icon" style={{ backgroundColor: (expandedKey === String(item.id) || isSelected)? 
            "whitesmoke":props.primaryButtonColor as string
            }}>
                <Icons name={item.icon} size={25} color={(expandedKey !== String(item.id)) && !isSelected? 
                "white":""    
                }/>     
            </div>
            { !isSelected && <div id="content" style={{ borderColor: props.secundaryButtonColor?  
            props.secundaryButtonColor:"steelblue" }}>
                <h2>{item.name}</h2>
            </div> }
        </div>);
    })
    var listOptionsMobile = gitHub.map(function(item){
        const isSelected = _route === String(item.route);

        return (<div key={item.id} onClick={() => {
            openUrl(item.route)
        }}
        style={{ color: props.secundaryButtonColor? 
        props.secundaryButtonColor:"steelblue" }}>

            <div id="icon" style={{ backgroundColor: isSelected? 
            "whitesmoke":props.primaryButtonColor as string
            }}>
                <Icons name={item.icon} size={25} color={!isSelected? 
                "white":""    
                }/>     
            </div>
        </div>);
    })

    async function getGitHubUrls(){
        if(canTry){
            setCanTry(false);

            var _urls = [
                {
                    id: 1,
                    name: 'Repositórios',
                    session: 'git',
                    route: '/git/repos',
                    url: user.urls[1],
                    icon: 'folder-open'
                },
                {
                    id: 2,
                    name: 'Turmas',
                    route: '/class',
                    session: 'classwork',
                    url: user.urls[0],
                    icon: 'users'
                },
                {
                    id: 3,
                    name: 'Ferramentas',
                    route: '/tools',
                    session: 'classwork',
                    url: user.urls[0],
                    icon: 'tools'
                },
                {
                    id: 4,
                    name: 'Ajuda',
                    route: 'https://dev-classwork.gitbook.io/classwork/',
                    session: 'classwork',
                    url: user.urls[0],
                    icon: 'life-ring'
                },
            ]

            setGitHub(_urls);
        }
    }

    function openUrl(route: string){
        if(route.includes('https://')){
            window.open(route);
        }else{
            history.push(route);
        };
    }
    
    function handleMouseEnter(value: string){
        setIsLoaded(true);
        setExpanded(true);
        setExpandedKey(value);
    }

    function handleMouseLeave(){
        setExpanded(false);
        setExpandedKey('');
    }

    if(!isMobile){
        return(
            <div>
                {canHeaderBarTop && <div className="div-header"></div>}
                <div className="expansive-lateral">
                    <div className="expansive-box" style={{ backgroundColor: props.secundaryButtonColor as string }}>
                        <div className="div-item-expansive-list shadow-theme-scroll">
                            <div style={{ color: props.secundaryButtonColor? 
                            props.secundaryButtonColor:"steelblue" }}
                            onMouseEnter={() => { handleMouseEnter("user-info") }}
                            onMouseLeave={handleMouseLeave}>
                                <img id="image" src={user.avatar} alt="Classwork Avatar"/>
                                <div id="content" style={{ borderColor: props.secundaryButtonColor?  
                                props.secundaryButtonColor:"steelblue" }}>
                                    {user.real_name !== "null"? <>
                                        <h3>{user.real_name}</h3>
                                        <h5>{user.name}</h5>
                                    </>:<h3>{user.name}</h3>}
                                </div>
                            </div>
                            {listOptions}
                        </div>
                        <div onClick={() => {
                            logoutGit(sessionStorage, history, location);
                        }} className="div-item-expansive-list-button red"
                        onMouseEnter={() => { handleMouseEnter("exit") }}
                        onMouseLeave={handleMouseLeave}>
                            <div id="icon" style={{ backgroundColor: (expandedKey === "exit")? 
                            "whitesmoke":props.primaryButtonColor  as string
                            }}>
                                <Icons name="exit" size={30} color={(expandedKey !== "exit")? 
                                "white":"rgb(228, 141, 141)"    
                                }/>
                            </div>
                            <div id="content" style={{ borderColor: "rgb(228, 141, 141)" }}>
                                <h2>Sair</h2>
                            </div>
                        </div>
                    </div>
                </div>
                {expanded? <div className="expanded-background"/>:
                <div className="expanded-background expanded-background-disable"
                    style={{ backgroundColor: !isLoaded? "transparent":"" }}
                />}
            </div>
        );
    }else{
        return(
            <div>
                {canHeaderBarTop && <div className="div-header"></div>}
                <div className="expansive-lateral">
                    <div className="expansive-box" style={{ backgroundColor: props.secundaryButtonColor as string }}>
                        <div className="div-item-expansive-list shadow-theme-scroll">
                            {listOptionsMobile}
                        </div>
                        <div onClick={() => {
                            logoutGit(sessionStorage, history, location);
                        }} className="div-item-expansive-list-button red">
                            <div id="icon" style={{ backgroundColor: (expandedKey === "exit")? 
                            "whitesmoke":props.primaryButtonColor as string
                            }}>
                                <Icons name="exit" size={30} color={(expandedKey !== "exit")? 
                                "white":"rgb(228, 141, 141)"    
                                }/>
                            </div>
                        </div>
                    </div>
                </div>
                {expanded? <div className="expanded-background"/>:
                <div className="expanded-background expanded-background-disable"
                    style={{ backgroundColor: !isLoaded? "transparent":"" }}
                />}
            </div>
        );
    }
}

export default HeaderAuth;