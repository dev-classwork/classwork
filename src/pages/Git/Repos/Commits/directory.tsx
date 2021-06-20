  
import React, { useState } from 'react';
import { DirectoryComponent, TreeItem } from '../../../../interfaces/global';
import Icons from '../../../../components/iconsLanguage';

import base64 from 'base-64';
import utf8 from 'utf8';
import axios from 'axios';
import api from '../../../../services/api';

interface DataResult {
    qtdLines: number,
	qtdMethods: number,
	cyclomaticComplexity: number,
	token: number,
	methods: {
		name: string,
		longName: string,
		cyclomaticComplexity: number,
		startLine: number,
		endLine: number,
		parameters: string[],
		filename: string,
		topNestingLevel: number,
		length: number,
		fanIn: number,
		fanOut: number,
		generalFanOut: number,
	}[],
	source: string,
}

const Directory = (props: DirectoryComponent) => {
    const [tree, setTree] = useState([]);
    const [treeUrl, setTreeUrl] = useState("");
    const [loadTree, setLoadTree] = useState(true);
    const [oldTreeUrlIndex, setOldTreeUrlIndex] = useState(0);
    const [oldUrlTree, setOldUrlTree] = useState<string[]>([]);
    const [canUpdate, setCanUpdate] = useState(true);
    const [nameFile, setNameFile] = useState("");
    const [indFile, setIndFile] = useState(-1);
    const [contFile, setContFile] = useState("");
    const [readme, setReadme] = useState("");
    const [canOpenReadme, setCanOpenReadme] = useState(false);
    const [dataResult, setDataResult] = useState<DataResult>({
        qtdLines: 0,
        qtdMethods: 0,
        methods: [],
        cyclomaticComplexity: 0,
        token: 0,
        source: ""
    });

    function HandleReturnTreeFolder(){
        setLoadTree(false);
        setOldTreeUrlIndex(oldTreeUrlIndex - 1);
        setTreeUrl(_oldUrlTree[oldTreeUrlIndex - 1]);
        setCanUpdate(true);
        setContFile("");
        setIndFile(-1);
        setNameFile("");
    }

    async function changeTreeFolder(url: string, type: string, item: TreeItem, ind: number){
        var _type = item.path.split('.')
        var _typeItem = _type[_type.length- 1];

        if(type === "tree"){
            setLoadTree(false);
            setOldTreeUrlIndex(oldTreeUrlIndex + 1);
            setTreeUrl(url);
            setCanUpdate(true);
            setContFile("");
            setIndFile(-1);
            setNameFile("");
        }else if(type === "blob" && _typeItem !== "ico" && _typeItem !== "lock"){
            axios.get(url, {
                headers: {
                    "Authorization": "token " + sessionStorage.getItem('token')
                }
            }).then(async function(response){
                try{
                    var _blob = base64.decode(response.data.content);
                    _blob = utf8.decode(_blob);
                }catch{
                    return null;
                }
                if(_blob !== contFile){     
                    setContFile(_blob);
                    setNameFile(item.path);
                    setIndFile(ind);

                    console.log(item.path, "content");

                    const _dataResult = await api.post('/linter', {
                        text: _blob,
                        filename: item.path,
                    }).then((res) => {
                        return res.data;
                    }).catch((err) => {
                        console.log(err);
                        return {
                            qtdLines: 0,
                            qtdMethods: 0,
                            methods: [],
                            cyclomaticComplexity: 0,
                            token: 0,
                            source: ""
                        };
                    });

                    console.log(_dataResult);
                    setDataResult(_dataResult);
                }else{
                    setContFile("");
                    setIndFile(-1);
                    setNameFile("");
                }  
            }).catch();
        }
    }

    function renderReadme(url: string, type: string, item: TreeItem){
        var _type = item.path.split('.')
        var _typeItem = _type[_type.length- 1];

        if(type === "blob" && _typeItem !== "ico" && _typeItem !== "lock"){
            axios.get(url, {
                headers: {
                    "Authorization": "token " + sessionStorage.getItem('token')
                }
            }).then(async function(response){
                var _blob = base64.decode(response.data.content);
                _blob = utf8.decode(_blob);
                if(_blob !== contFile){
                    setReadme(_blob);
                }else{
                    setReadme("");
                }  
            }).catch();
        }
    }

    var _oldUrlTree = oldUrlTree;

    if(oldTreeUrlIndex < 0){
        setOldTreeUrlIndex(0);
    }

    if(treeUrl === "" && props._url !== ""){
        setTreeUrl(props._url);
    }

    if(treeUrl !== ""){
        if(canUpdate){
            _oldUrlTree[oldTreeUrlIndex] = treeUrl;
            setOldUrlTree(_oldUrlTree);
            setCanUpdate(false);
            axios.get(treeUrl, {
                headers: {
                    "Authorization": "token " + sessionStorage.getItem('token')
                }
            }).then(async function(response){
                setTree(response.data.tree);
                setLoadTree(true);
            }).catch();
        }


        return(<div className="directory-div">
            {(oldTreeUrlIndex !== 0)? <button onClick={() => {HandleReturnTreeFolder()}}>
                <div>
                    <Icons name="folder-open" size={25} color="currentColor"/>
                    ..
                </div>
            </button>:null}
            {loadTree?
                tree.map(function(item: TreeItem, index){
                    var _type = item.path.split('.');
                    var _typeItem = _type[_type.length- 1];
                    return(<button className={(item.type === "blob")? "shadow-theme no-focus-shadow-theme":"shadow-theme"}  key={index} onClick={async() => {await changeTreeFolder(item.url, item.type, item, index)}}>
                        <div>
                            <Icons name={(item.type === "blob")? _typeItem:"folder"} size={25} color="currentColor"/>
                            {item.path}
                        </div>
                        {(contFile !== null && index === indFile)? <Icons name="eye" size={25} color="currentColor"/>:null}
                    </button>);
                }):<div className="shadow-theme alt">
                    Carregando...
                </div>
            }
            {(contFile !== "")? <div> 
                <h1 className="commmits-chart-title">{nameFile}</h1>
                <h2 style={{
                    textAlign: "center",
                    paddingBottom: "0.5rem"
                }}>
                    Quantidade de métodos: {dataResult.methods? dataResult.methods.length:0} | 
                    Complexidade ciclomatica: {dataResult.cyclomaticComplexity}
                </h2>
                <table className="code">
                    <tbody>	           
                        {contFile.split('\n').map(function(item, index){
                            let _haveError = false;
                            let _error = "";

                            //Para um futuro onde possa ter tratamento de erros
                            
                            return(<tr key={index}>	
                                <td style={(index === contFile.split('\n').length - 1)? {borderBottom: 'none'}:{}}
                                className={_haveError? "have-error-in-line":""}
                                >{index}</td>	
                                <td><pre>{item}<span className="have-error-in-line-text">{_haveError? `//Error: ${_error}`:""}</span></pre></td>	
                            </tr>)	
                        })}	
                    </tbody>
                </table>
            </div>:null}
            {loadTree?
                tree.map(function(item: TreeItem, index){
                    var _type = item.path.split('.');
                    var _typeItem = _type[0];
                    if(_typeItem === "README"){
                        if(readme === ""){
                            renderReadme(item.url, item.type, item);
                        }

                        var imageSelected = `<img src="${require("../../../../assets/list-icons-selected.png")}" width="25" height="25"/>`;
                        var imageNoSelected = `<img src="${require("../../../../assets/list-icons.png")}" width="25" height="25"/>`;

                        var stringReadme = String(require('render-readme')(readme));
                        stringReadme = stringReadme.replace(/<li>\[ ]/g, '<li class="checkbox">' + imageNoSelected)
                        .replace(/<li>\[]/g, '<li class="checkbox">' + imageNoSelected)
                        .replace(/<li>\[x]/g, '<li class="checkbox">' + imageSelected)
                        .replace(/<li>\[X]/g, '<li class="checkbox">' + imageSelected)
                        .replace(/<ul>\n<li>/g, '<ul><li>')
                        .replace(/<a href="/g, '<a target="_blank" href=');

                        if(canOpenReadme){
                            return(<div key={index}><button className="shadow-theme alt no-focus-shadow-theme" 
                                style={{ textAlign: 'center', display: 'block', width: '100%'}} 
                                onClick={() => {
                                    setCanOpenReadme(false);
                                }}
                                >
                                    OCULTAR README
                                </button>
                                <div className="no-hover-effect" onClick={async() => {await changeTreeFolder(item.url, item.type, item, index)}}>
                                    <div className="readme-div" dangerouslySetInnerHTML={{ __html: stringReadme}}/>
                                </div>
                            </div>);
                        }else{
                            return(<button key={index} className="shadow-theme alt no-focus-shadow-theme" 
                            style={{ textAlign: 'center', display: 'block',  width: '100%'}} 
                            onClick={() => {
                                setCanOpenReadme(true);
                            }}
                            >
                                LER README
                            </button>)
                        }
                    }else{
                        return null;
                    }
                }):null
            }
        </div>);
    }else{
        return(null);
    }
}

export default Directory;