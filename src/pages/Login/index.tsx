import React from 'react';
import { FaGithubAlt } from 'react-icons/fa';
import { useLocation, useHistory } from 'react-router-dom';

import Header from '../../components/header';

import queryToStorage from '../../utils/queryToStorage';
import checkIfIsAuthenticated from '../../utils/checkIfIsAuthenticated';
import imgBack from '../../assets/report_analysis.png';

const Login = () => {
    const history = useHistory();
    const location = useLocation();
    const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
    const STATE_APP = process.env.REACT_APP_STATE;
    const CLIENT_ID = (process.env.NODE_ENV === "development")? 
    process.env.REACT_APP_GH_BASIC_CLIENT_ID_DEV : 
    process.env.REACT_APP_GH_BASIC_CLIENT_ID;
    console.log(process.env.REACT_APP_GH_BASIC_CLIENT_ID_DEV, process.env.REACT_APP_GH_BASIC_CLIENT_ID_DEV, process.env.NODE_ENV)
    const URL = `${GITHUB_AUTH_URL}?client_id=${CLIENT_ID}&state=${STATE_APP}&scope=read:public_repo%20read:user`;

    queryToStorage(sessionStorage, history, location, 'user', 'error');

    if(sessionStorage.getItem('error') === "true"){
        sessionStorage.removeItem('user');
        alert("Dados incorretos!");
        sessionStorage.removeItem('error');
    }

    checkIfIsAuthenticated(sessionStorage, history, location);

    return( 
            <div>
                <Header title="Classwork"/>
                <div className="page-double" style={{ backgroundImage: `url(${imgBack})` }}>
                    <div className="page">
                        <div className="title">
                            <h1>Não sabe o que é o Classwork?</h1>
                            <h2>É uma ferramenta poderosa feita por um aluno para os professores! Extraia com
                                facilidade as informações dos repositórios de cada estudante, saiba o quanto
                                eles trabalharam no código, visualize varios gráficos gerados dos dados recebidos
                                do Github e muito mais!
                            </h2>
                        </div>
                        <div className="title">
                            <h1>Tem muitas dúvidas?</h1>
                            <h2>Experimente explorar um pouco nossa página de ajuda.
                            </h2>
                        </div>
                            <div className="login-page-button shadow-theme">
                                <a href="https://dev-classwork.gitbook.io/classwork/" target="_blank" rel="noopener noreferrer">
                                    <h3 style={{ marginLeft: 0 }}>Preciso de ajuda!!!</h3>
                                </a>
                            </div>
                        <div className="title">
                            <h1>Já possui conta no Github?</h1>
                            <h2>O que está esperando? Entre com uma agora mesmo e crie sua turma!
                            Se não possuir uma conta, saiba que é fácil e rápido criar uma.</h2>
                        </div>
                        <div className="login-page-button git-button shadow">
                            <a href={URL}>
                                <FaGithubAlt size={35}/>
                                <h3>Entrar com Github</h3>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
}

export default Login;