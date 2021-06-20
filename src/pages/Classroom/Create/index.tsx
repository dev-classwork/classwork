import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useHistory, useLocation, useParams } from "react-router-dom";
import { ClassItem, TemplateItem } from '../../../interfaces/global';
import { FaAward, FaMarker } from 'react-icons/fa';

import HeaderAuth from '../../../components/headerAuth';
import Painel from '../../../components/painel';
import Dropzone from '../dropzone';
import ColorPicker from '../colorPicker';

import crypto from 'crypto';

import checkIfIsAuthenticated from '../../../utils/checkIfIsAuthenticated';
import returnNotNullSession from '../../../utils/returnNotNullSession';
import jsonParseCheck from '../../../utils/jsonParseCheck';

import imgClasswork from '../../../assets/templates/classwork.png';
import imgCss from '../../../assets/templates/css.png';
import imgHtml from '../../../assets/templates/html.png';
import imgJava from '../../../assets/templates/java.png';
import imgJavascript from '../../../assets/templates/javascript.png';
import imgPython from '../../../assets/templates/python.png';
import imgTypescript from '../../../assets/templates/typescript.png';
import { isNullOrUndefined } from 'util';
import api from '../../../services/api';

const ClassroomRegister = () => {
    const history = useHistory();
    const location = useLocation();
    const timestamp = Date.now().toString();
    const hash = crypto.randomBytes(8).toString('hex');
    const [isEditPage, setIsEditPage] = useState(false);
    const [oldImageIsChanged, setOldImageIsChanged] = useState(false);
    const [oldImage, setOldImage] = useState('');

    let { key } = useParams();
    if(isNullOrUndefined(key)){
        key = timestamp.substr(0,3) + hash.substr(3,6) + timestamp.substr(6, 9) + hash.substr(9,12);
    }else if(!isEditPage){
        setIsEditPage(true);
        loadCurrenteClass()
    } 

    const user = JSON.parse(returnNotNullSession('user', ''));
    const [errors, setErrors] = useState<string[]>([]);
    const [reset, setReset] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [template, setTemplate] = useState<TemplateItem>({
        url: 'default',
        filename: 'default'
    });
    const [image, setImage] = useState<File | null | undefined>();
    const [previewColor, setPreviewColor] = useState('#4682b4');
    const [classes, setClasses] = useState<ClassItem>({
        description: '',
        name: '',
        image: '',
        key: key,
        color: '#4682b4',
        avatar: user.avatar
    });

    useEffect(() => {
        if(image){
            let _errors = errors;
            _errors.splice(_errors.indexOf('haveImage'), 1);
            setErrors(_errors);
        }
    }, [image, errors]);

    async function loadCurrenteClass(){
        await api.get(`/classes?key=${key}`, {
            headers: {
                auth: process.env.REACT_APP_DB_IDENTITY
            }
        }).then(function(res) {
            setClasses({
                description: res.data.description,
                name: res.data.name,
                image: '',
                key: key,
                color: res.data.color,
                avatar: user.avatar
            });
            setTemplate({
                url: `${process.env.REACT_APP_URL_BACK}/classes/uploads/${res.data.image}`,
                filename: `old`
            });
            setOldImage(res.data.image);
        }).catch(function(err) {
            console.log(err.response.data.message)
            history.push('/error');
        });
    }

    function handleChangeTemplate(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        setOldImageIsChanged(true);
        if(e.currentTarget.name === "default"){
            setImage(null);
            setReset(true);
        }else{
            let _errors = errors;
            _errors.splice(_errors.indexOf('haveImage'), 1);
            setErrors(_errors);
        }
        setTemplate({
            url: e.currentTarget.name,
            filename: e.currentTarget.value
        });
    }

    function handleFileUpload(file: File, template: { url: string, filename: string}, reset: boolean) {
        setOldImageIsChanged(true);
        setImage(file);
        setTemplate(template);
        setReset(reset);
    }

    function handleColorChange(color: string, previewColor: string){
        if(color !== classes.color){
            setPreviewColor(color);
        }else{
            setPreviewColor(previewColor);
        }
        setClasses({
            ...classes,
            color: color
        });
    }

    function handleChangeInputValues(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if(e.target.name === "name" && e.target.value.length >= 3 && e.target.value.length <= 28){
            let _errors = errors;
            _errors.splice(_errors.indexOf('name'), 1);
            setErrors(_errors);
        }

        setClasses({
            ...classes,
            [e.target.name]: e.target.value
        });
    }

    async function handleForm(e: FormEvent){
        e.preventDefault();
    }

    async function handleSubmitForm(e: React.MouseEvent<HTMLButtonElement, MouseEvent>){
        e.preventDefault();

        setIsLoading(true);

        const data = new FormData();
        const { name, description, color, key } = classes;
        var withTemplate = false;
        var teacher_id = 1;
        
        await api.get(`users?git_id=${user.git_id}`, {
            headers: {
                auth: process.env.REACT_APP_DB_IDENTITY
            }
        }).then(function(res) {
            teacher_id = res.data.id;
        }).catch(function(err) {
            history.push('/error');
        });

        data.set('key', key);
        data.set('oldImage', oldImage);
        data.set('name', name);
        data.set('description', description);
        data.set('color', color);
        data.set('teacher_id', String(teacher_id));
        data.set('teacher_id_auth', user.id_auth);
        
        if((image && template.url === 'default') ||
        (image && template.url === `${process.env.REACT_APP_URL_BACK}/classes/uploads/${oldImage}`)){
            withTemplate = false;
            data.append('haveImage', 'true');
            data.append('image', image);
        }else if(template.url !== 'default'){
            data.append('haveImage', 'true');
            withTemplate = true;
        }
        
        var _userNewData = '';
        
        if(!withTemplate && !isEditPage){
            data.delete('oldImage');
            
            await api.post('/class/create', data, {
                headers: {
                    auth: process.env.REACT_APP_DB_IDENTITY
                }
            }).then(function(res) {
                _userNewData = res.data;
                var _user = jsonParseCheck(_userNewData);
                _user.urls = jsonParseCheck( _user.urls);
                _user.classes = jsonParseCheck( _user.classes);
                _user.repos = jsonParseCheck( _user.repos);
                _user.teams = jsonParseCheck( _user.teams);
                _userNewData = _user;
            }).catch(function(err) {
                setIsLoading(false);
                setErrors(err.response.data.validation.keys);
            });
        }else if(!isEditPage){
            await api.post('/class/create/template', {
                key,
                name,
                description,
                teacher_id,
                teacher_id_auth: user.id_auth,
                color,
                filename: template.filename
            }, {
                headers: {
                    auth: process.env.REACT_APP_DB_IDENTITY
                }
            }).then(function(res) {
                _userNewData = res.data;
            }).catch(function(err) {
                setIsLoading(false);
                setErrors(err.response.data.validation.keys);
            });;
        }else if(isEditPage && !oldImageIsChanged){
            await api.post(`/class/update`, {
                key,
                name,
                description,
                color
            }, {
                headers: {
                    auth: process.env.REACT_APP_DB_IDENTITY
                }
            }).then(function() {
                history.push(`/class/${key}`);
            }).catch(function(err) {
                setIsLoading(false);
                setErrors(err.response.data.validation.keys);
            });;
        }else if(isEditPage && oldImageIsChanged && !withTemplate){
            data.delete('teacher_id');
            data.delete('teacher_id_auth');

            await api.post(`/class/updateAll`, data, {
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
            await api.post(`/class/update/template?key=${key}`, {
                name,
                description,
                color,
                filename: template.filename
            }, {
                headers: {
                    auth: process.env.REACT_APP_DB_IDENTITY
                }
            }).then(function(res) {
                history.push(`/class/${key}`);
            }).catch(function(err) {
                setIsLoading(false);
                setErrors(err.response.data.validation.keys);
            });;
        }

        setIsLoading(false);

        if(_userNewData !== ''){
            sessionStorage.setItem('user', JSON.stringify(_userNewData));
            history.push(`/class/${key}`);
        }
    }

    checkIfIsAuthenticated(sessionStorage, history, location);

    var _previewImage = '';
    if(template.url === 'default' && !isNullOrUndefined(image)){
        _previewImage = URL.createObjectURL(image);
    }else {
        _previewImage = template.url;
    }

    var preName = classes.name;
    var preDescription = classes.description;

    if( preDescription.length >= 128){
        preDescription = preDescription.substr(0, 125) + "...";
    }

    if(preName.length >= 24){
        preName = classes.name.substr(0, 24) + '...';
    }

    return(
        <div>
            <HeaderAuth title=""/>
            {!isLoading && <Painel/>}
            <div className="page with-scroll header-is-auth">
                <div className="title">
                    <h1>{isEditPage? 'Quer editar essa turma?':'Opa, será este um novo professor?'}</h1>
                    <h2>Não perca tempo, reponda ao formulário e {isEditPage? 'volte retorne suas aulas!':'começe suas aula!'}</h2>
                </div>
                <form className="form-create-class" onSubmit={handleForm}>
                    <fieldset>
                        <legend className={errors.includes('haveImage')? "legend-red":""}>
                            Que tal uma {isEditPage && 'nova '}capa para sua turma, ein? {errors.includes('haveImage')? "Ela é obrigatória!":"*"}
                        </legend>
                        <Dropzone errors={errors} onFileUploaded={handleFileUpload} template={template.url} reset={reset}/>
                        <div>
                            <ul className="template-list">
                                <li className="template-list-reset">
                                    <button name="default" value="default" onClick={e => handleChangeTemplate(e)}>Resetar</button>
                                </li>
                                <li>
                                    <button name={imgClasswork} value={'templates/classwork.png'} onClick={e => handleChangeTemplate(e)}>Classwork</button>
                                </li>
                                <li>
                                    <button name={imgJava} value={'templates/java.png'} onClick={e => handleChangeTemplate(e)}>Java</button>
                                </li>
                                <li>
                                    <button name={imgJavascript} value={'templates/javascript.png'} onClick={e => handleChangeTemplate(e)}>Javascript</button>
                                </li>
                                <li>
                                    <button name={imgTypescript} value={'templates/typescript.png'} onClick={e => handleChangeTemplate(e)}>Typescript</button>
                                </li>
                                <li>
                                    <button name={imgPython} value={'templates/python.png'} onClick={e => handleChangeTemplate(e)}>Python</button>
                                </li>
                                <li>
                                    <button name={imgHtml} value={'templates/html.png'} onClick={e => handleChangeTemplate(e)}>HTML</button>
                                </li>
                                <li>
                                    <button name={imgCss} value={'templates/css.png'} onClick={e => handleChangeTemplate(e)}>CSS</button>
                                </li>
                            </ul>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend className={errors.includes('name')? "legend-red":""}>
                            Agora os dados importantes! {errors.includes('name')? "O nome é obrigatório!":""}
                        </legend>
                        <div className={errors.includes('name')? "multform-imput multform-imput-red":"multform-imput"}>
                            <label htmlFor="name">
                                <div>
                                    <FaAward size={25}/>
                                    <p>Nome da turma{errors.includes('name')? ". Por favor, use ao menos 3 letras e no máximo 28.":" *"}</p>
                                </div>
                            </label>
                            <input required className={errors.includes('name')? "shadow-theme-red":"shadow-theme"} id="name" type="name" name="name" value={classes.name} onChange={handleChangeInputValues}/>
                        </div>
                        <div className="multform-imput">
                            <label htmlFor="description">
                                <div>
                                    <FaMarker size={21}/>
                                    <p>Descrição da turma</p>
                                </div>
                            </label>
                            <textarea required className="shadow-theme" id="description" name="description" value={classes.description} onChange={handleChangeInputValues}/>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>
                            Prévia do cartão
                        </legend>
                        <p style={{ marginTop: -5 }}>Evite cores fracas!!!</p>
                        <div className="container-box-list container-box-list-within-padding">
                            <ul className="remove-box-list-padding ul-box-list-preview">
                                <li>
                                    <button className="shadow-theme-lit-current-color class-info-display" style={{ color: `${classes.color}`}}>
                                        <div className="box-list-div-image">
                                            <div className="box-list-div-class-image remove-color-transition" style={{ backgroundImage: `url(${_previewImage})`}}>
                                                <img src={user.avatar} alt="professor"/>
                                            </div>
                                        </div>
                                        <div className="class-info-content">
                                            <h3>{preName}</h3>
                                            <h4>{preDescription !== ""? preDescription:"Sem descrição"}</h4>
                                        </div>
                                    </button>
                                </li>
                                <li>
                                    <button className="shadow-theme-lit-current-color class-info-display" style={{ color: `${previewColor}` }}>
                                        <div className="box-list-div-image">
                                            <div className="box-list-div-class-image remove-color-transition" style={{ backgroundImage: `url(${_previewImage})`}}>
                                                <img src={user.avatar} alt="professor"/>
                                            </div>
                                        </div>
                                        <div className="class-info-content">
                                            <h3>Prévia do título</h3>
                                            <h4>Prévia da descrição</h4>
                                        </div>
                                    </button>
                                </li>
                            </ul>
                            <ColorPicker onColorChange={handleColorChange} color={classes.color}/>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>
                            Pronto? Já pode enviar!
                        </legend>
                        
                        <div style={{display: 'flex'}}><div className="multform-imput-button-submit shadow-theme">
                            {!isLoading? <button type="submit" onClick={handleSubmitForm}>
                                <h3>{isEditPage? 'Salvar':'Criar'} turma</h3>
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

export default ClassroomRegister;