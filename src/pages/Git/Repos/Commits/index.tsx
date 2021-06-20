import React, { useState, ChangeEvent } from 'react';
import { PieChart, Pie, Sector, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Brush } from 'recharts';
import { useHistory, useLocation } from "react-router-dom";
import { ActiveShapeInterface, CommitInterface } from '../../../../interfaces/global';

import HeaderAuth from '../../../../components/headerAuth';
import Painel from '../../../../components/painel';
import Directory from './directory';
import Icons from '../../../../components/icons';
import Tooltip1 from './Tooltips/tooltip1';
import Tooltip2 from './Tooltips/tooltip2';
import Tooltip3 from './Tooltips/tooltip3';

import checkIfIsAuthenticated from '../../../../utils/checkIfIsAuthenticated';
import returnNotNullSession from '../../../../utils/returnNotNullSession';

const Commits = () => {
    const history = useHistory();
    const location = useLocation();
    const [indexOfValue, setIndexOfValue] = useState(0);
    const [pieFocus, setPieFocus] = useState(false);
    const [activeAnimation, setActiveAnimation] = useState(true);
    const [page, setPage] = useState(1);

    checkIfIsAuthenticated(sessionStorage, history, location);

    var action = returnNotNullSession('action', '');
    var actionSplit = action.split('-');
    var title = '';

    for(var i in actionSplit){
        if(Number(i) >= actionSplit.length - 1){
            title += actionSplit[i];
        }else{
            title += actionSplit[i] + ' ';
        }
    }

    var actions = JSON.parse(returnNotNullSession('actions@' + action, ''));

    var itemPerPage = 10;
    var pageMax = Math.ceil(actions.commits.length/itemPerPage);
    var pageMin = 1;

    var qtdCommit = actions.commits.length;
    var qtdChange = 0;
    var qtdComplexy = 0;
    var qtdMethods = 0;

    for(var u in actions.rank){
        qtdChange += actions.rank[u].additions + actions.rank[u].deletions;
        qtdComplexy += actions.rank[u].complexity_cyclomatic;
        qtdMethods += actions.rank[u].methods;
        actions.rank[u].changes = actions.rank[u].additions + actions.rank[u].deletions;
    }

    for(var z in actions.rank){
        actions.rank[z].total = (
            typeof Number(actions.rank[z].lines/qtdChange) === "number"?  Number(actions.rank[z].lines/qtdChange):1 +
            typeof Number(actions.rank[z].complexity_cyclomatic/qtdComplexy) === "number"? Number(actions.rank[z].complexity_cyclomatic/qtdComplexy):0 +
            typeof Number(actions.rank[z].methods/qtdMethods) === "number"? Number(actions.rank[z].methods/qtdMethods):0
        );
    }

    var qtdAuthor = actions.rank.length;
    var _commits = [];
    for(var q in actions.commits){
        var _date: Date | string = new Date(actions.commits[q].date);
        _date = _date.toJSON();
        
        var _day = _date.substring(8,10);
        var _month = _date.substring(5,7);
        var _year = _date.substring(2,4)

        _commits[(actions.commits.length - 1) - Number(q)] = {
            author: actions.commits[q].author,
            avatar: actions.commits[q].author_avatar,
            date: _date,
            dateReducer: _day + "/" + _month + "/" + _year,
            total: actions.commits[q].status.total,
            additions: actions.commits[q].status.additions,
            deletions: actions.commits[q].status.deletions,
            message: actions.commits[q].message,
            complexity_cyclomatic: actions.commits[q].complexity_cyclomatic,
            methods: actions.commits[q].methods
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

    let changesTimeline = _commits;
    let lineComplexity = 0;
    let lineMethods = 0;
    for(let t in changesTimeline){
        lineComplexity += Number(changesTimeline[t].complexity_cyclomatic);
        lineMethods += Number(changesTimeline[t].methods);

        changesTimeline[t].complexity_cyclomatic = lineComplexity;
        changesTimeline[t].methods = lineMethods;
    }

    //Grafico de Pizza
    var dataDetails = [
        {id: 0, 
            value: actions.rank[indexOfValue].changes/qtdChange, 
            color: "rgba(197, 164, 91, 0.6)"},
        {id: 1, 
            value: actions.rank[indexOfValue].complexity_cyclomatic/qtdComplexy, 
            color: "rgb(91, 197, 106, 0.6)"},
        {id: 2, 
            value: actions.rank[indexOfValue].methods/qtdMethods, 
            color: "rgba(179, 91, 197, 0.6)"}
    ];
    const COLORS = ['rgba(70, 131, 180, 0.5)','rgba(70, 131, 180, 0.4)','rgba(70, 131, 180, 0.3)','rgba(70, 131, 180, 0.2)','rgba(70, 131, 180, 0.6)'];

    const activeShape = (props: ActiveShapeInterface) => {
        const RADIAN = Math.PI / 180;
        const sin = Math.sin(-RADIAN * props.midAngle);
        const cos = Math.cos(-RADIAN * props.midAngle);
        const sx = props.cx + (props.outerRadius + 10) * cos;
        const sy = props.cy + (props.outerRadius + 10) * sin;
        const mx = props.cx + (props.outerRadius + 30) * cos;
        const my = props.cy + (props.outerRadius + 30) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 45;
        const exp = mx + (cos >= 0 ? 1 : -1) * 53;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';
    
        var _author = props.payload.name;
        if(qtdAuthor === 1 && _author.length > 10){
           _author = _author.substring(0, 8) + "...";
        }

        return (
            <g>
                <defs>
                    <pattern id="avt" width="100%" height="100%">
                        <image href={props.payload.avatar} width="100" height="100"/>
                    </pattern>
                </defs>
                <circle cx={props.cx} cy={props.cy} r={props.innerRadius - 10} fill="url(#avt)"/>
                <Sector
                    className="sector"
                    cx={props.cx}
                    cy={props.cy}
                    innerRadius={pieFocus? (props.innerRadius + 4):props.innerRadius}
                    outerRadius={pieFocus? (props.outerRadius + 4):props.outerRadius}
                    startAngle={props.startAngle}
                    endAngle={props.endAngle}
                    fill={pieFocus? "rgb(23, 81, 129)":"steelblue"}
                />
                <Sector
                    cx={props.cx}
                    cy={props.cy}
                    startAngle={props.startAngle}
                    endAngle={props.endAngle}
                    innerRadius={props.outerRadius + 6}
                    outerRadius={props.outerRadius + 10}
                    fill="steelblue"
                />
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="steelblue" fill="none"/>
    
                <path d={`M${ex + (cos >= 0 ? 1 : -1) * 28},${ey - 40}L${ex + (cos >= 0 ? 1 : -1) * 28},${ey - 25}`} strokeWidth="5" stroke="steelblue" fill="none"/>
                <path d={`M${ex + (cos >= 0 ? 1 : -1) * 28},${ey - 18}L${ex + (cos >= 0 ? 1 : -1) * 28},${ey - 7}`} strokeWidth="5" stroke="rgba(197, 164, 91, 0.6)" fill="none"/>
                <path d={`M${ex + (cos >= 0 ? 1 : -1) * 28},${ey}L${ex + (cos >= 0 ? 1 : -1) * 28},${ey + 11}`} strokeWidth="5" stroke="rgb(91, 197, 106, 0.6)" fill="none"/>
                <path d={`M${ex + (cos >= 0 ? 1 : -1) * 28},${ey + 18}L${ex + (cos >= 0 ? 1 : -1) * 28},${ey + 29}`} strokeWidth="5" stroke="rgba(179, 91, 197, 0.6)" fill="none"/>
    
                <circle cx={exp} cy={ey} r={3} fill="steelblue" stroke="none"/>
                <text className="details-pie-percent" x={ex + (cos >= 0 ? 1 : -1) * -40} y={ey + 10} dy={-18} textAnchor={textAnchor} fill="steelblue">{`${(props.percent * 100).toFixed(2)}%`}</text>
                <text className="details-pie-title " x={ex + (cos >= 0 ? 1 : -1) * 35} y={ey} dy={-25}textAnchor={textAnchor} fill="steelblue">{`${_author}`}</text>
                <text className="details-pie" x={ex + (cos >= 0 ? 1 : -1) * 35} y={ey} dy={-7} textAnchor={textAnchor} fill="rgb(1, 53, 95)">Alt: {props.payload.changes}</text>
                <text className="details-pie" x={ex + (cos >= 0 ? 1 : -1) * 35} y={ey} dy={11} textAnchor={textAnchor} fill="rgb(1, 53, 95)">Com: {props.payload.complexity_cyclomatic}</text>
                <text className="details-pie" x={ex + (cos >= 0 ? 1 : -1) * 35} y={ey} dy={29} textAnchor={textAnchor} fill="rgb(1, 53, 95)">Mth: {props.payload.methods}</text>
            </g>
        );
    };
    
    function openCommitFiles(comm: any){
        sessionStorage.setItem('action-files', JSON.stringify(comm));
        history.push('/git/repos/commits/files');
    }

    return(
        <div>
            <HeaderAuth title={title}/>
            <Painel/>
            <div className="page with-scroll header-is-auth">
            <h1 className="commmits-chart-title first-title-page">{actions.title}</h1>
            <h2 className="commmits-chart-subtitle first-subtitle-page">{actions.description}</h2>
            <div className="piechart-div">
                <PieChart width={700} height={400}>
                    <Pie 
                        activeIndex={indexOfValue}
                        activeShape={activeShape} 
                        labelLine={false}
                        data={actions.rank}
                        cx={300} 
                        cy={200} 
                        innerRadius={60}
                        outerRadius={80} 
                        dataKey="total"
                        paddingAngle={2}
                        onClick={() =>{
                            setPieFocus(!pieFocus);
                        }}
                        onMouseOver={(data, index) => {
                            if(!pieFocus){
                                setIndexOfValue(index);
                            }
                        }}
                    >
                    {
                        actions.rank.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none"/>)
                    }
                    </Pie>
                    <Pie 
                        data={dataDetails} 
                        cx={300} 
                        cy={200}
                        dataKey="value" 
                        innerRadius={45}
                        outerRadius={55} 
                        paddingAngle={2}
                    >
                    {
                        dataDetails.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none"/>)
                    }
                    </Pie>
                </PieChart>
                <div className="piechart-div-title">
                    <div>
                        <h1 className="piechart-title">Repositório</h1>
                        <h2 className="piechart-detail">Complexidade Ciclomatica: <span className="color-theme-text">{qtdComplexy}</span></h2>
                        <h2 className="piechart-detail">Quantidade de métodos: <span className="color-theme-text">{qtdMethods}</span></h2>
                    </div>
                    <div>
                        <h1 className="piechart-title">Commits</h1>
                        <h2 className="piechart-detail">Total de Commits: <span className="color-theme-text">{qtdCommit}</span></h2>
                        <h2 className="piechart-detail">Total de Alterações: <span className="color-theme-text">{qtdChange}</span></h2>
                        <h2 className="piechart-detail">Total de Autores: <span className="color-theme-text">{qtdAuthor}</span></h2>
                        <h2 className="piechart-detail">Commits/Autores: <span className="color-theme-text">{(qtdCommit/qtdAuthor).toFixed(2)}</span></h2>
                        <h2 className="piechart-detail">Alterações/Autores: <span className="color-theme-text">{(qtdChange/qtdAuthor).toFixed(2)}</span></h2>
                        <h2 className="piechart-detail">Alterações/Commit: <span className="color-theme-text">{(qtdChange/qtdCommit).toFixed(2)}</span></h2>
                    </div>
                    <div>
                        <h1 className="piechart-title">Commit Recente</h1>
                        <h2 className="piechart-detail">{actions.commits[0].author} | <span className="color-theme-text">{actions.commits[0].message}</span></h2>
                    </div>
                </div>
            </div>
            <h1 className="commmits-chart-title">Linha do Tempo</h1>
            <h2 className="commmits-chart-subtitle">Visualize o histórico do repositório de forma ampla</h2>
            <div className="timeline-areachart">
                <AreaChart width={1200} height={200} className="areacharts-first" data={changesTimeline} syncId="timeline">
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="dateReducer"/>
                <Brush dataKey="dateReducer"
                    height={50} stroke="rgba(197, 164, 91, 0.6)" travellerWidth={10}
                />
                <YAxis dataKey=""/>
                <Tooltip content={Tooltip1}/>
                <Area isAnimationActive={activeAnimation} animationDuration={6000} type='monotone' dataKey='author' name="Autor" stroke='rgba(197, 164, 91)' activeDot={false}></Area>
                <Area isAnimationActive={activeAnimation} animationDuration={6000} type='monotone' dataKey='message' name="Mensagem" stroke='rgba(197, 164, 91)' activeDot={false}></Area>
                <Area isAnimationActive={activeAnimation} animationDuration={6000} type='monotone' dataKey='avatar' name="Avatar" stroke='rgba(197, 164, 91)' activeDot={false}></Area>
                <Area isAnimationActive={activeAnimation} animationDuration={6000} type='monotone' dataKey='total' name="Alterações" stroke='rgba(197, 164, 91)' fill='rgba(197, 164, 91, 0.6)'/>
                </AreaChart>

                <div className="timeline-areachart-2">
                    <AreaChart width={600} height={200} data={changesTimeline} syncId="timeline">
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="dateReducer"/>
                    <YAxis/>
                    <Tooltip content={Tooltip2}/>
                    <Area isAnimationActive={activeAnimation} animationDuration={7000} type='monotone' name="Complexidade Ciclomatica" dataKey='complexity_cyclomatic' stroke='rgb(91, 197, 106)' fill='rgb(91, 197, 106, 0.5)' />
                    </AreaChart>

                    <AreaChart width={600} height={200} data={changesTimeline} syncId="timeline">
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="dateRecuder"/> 
                    <YAxis/>
                    <Tooltip content={Tooltip3}/>
                    <Area isAnimationActive={activeAnimation} animationDuration={7000} onAnimationEnd={() => {
                        if(activeAnimation){
                            setActiveAnimation(false);
                        }
                    }} type='monotone' name="Métodos" dataKey='methods' stroke='rgba(179, 91, 197)' fill='rgba(179, 91, 197, 0.5)'/>
                    </AreaChart>
                </div>
            </div>
            <h1 className="commmits-chart-title">Diretório</h1>
            <h2 className="commmits-chart-subtitle">Visualize todos os arquivos</h2>
            <Directory _url={actions.commits[0].tree}/>
            <h1 className="commmits-chart-title">Registro Geral</h1>
            <h2 className="commmits-chart-subtitle">Clique em um commit para ver todas as informações</h2>
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
                        <th colSpan={2}>Usuário</th>
                        <th>Alterações</th>
                        <th>Qtd. Linhas</th>
                        <th>Qtd. Métodos</th>
                        <th>C. Ciclomatica</th>
                        <th>Arquivos</th>
                        <th>Data</th>
                        <th>Mensagem</th>
                    </tr>
                </thead>
                <tbody>
                {
                    actions.commits.map(function(item: CommitInterface, index: number){
                        var _date: Date | string =  new Date(item.date);
                        _date = _date.toJSON();
                        
                        var _day = _date.substring(8,10);
                        var _month = _date.substring(5,7);
                        var _year = _date.substring(2,4);
                        
                        let line = Number(item.lines);
                        let method = Number(item.methods);
                        let complexy = Number(item.complexity_cyclomatic);

                        if((index+1) > (itemPerPage*(page-1)) && (index+1) <= (itemPerPage*(page))){
                            return(<tr key={index} className="table-commits-tr" onClick={() => {openCommitFiles(item)}}>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-id">{actions.commits.length - index}</td>
                                <td className="table-commits-tr-td table-commits-tr-td-img table-img"><img src={item.author_avatar} alt="avatar"/></td>
                                <td className="table-commits-tr-td table-commits-tr-td-img-text table-author">{item.author}</td>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-alt">{item.status.total}</td>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-alt">{line > 0? `+${line}`:line}</td>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-alt">{method > 0? `+${method}`:method }</td>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-alt">{complexy > 0? `+${complexy}`:complexy}</td>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-alt">{item.files.length}</td>
                                <td className="table-commits-tr-td table-commits-tr-td-text table-date">{`${_day}/${_month}/${_year}`}</td>
                                <td className="table-commits-tr-td table-msg">{item.message}</td>
                            </tr>);
                        }else{
                            return null;
                        }
                    })
                }
                </tbody>
            </table>
            </div>
        </div>
    );
}

export default Commits;