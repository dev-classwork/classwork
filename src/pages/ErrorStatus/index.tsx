import React from 'react';
import { FaHeartBroken } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import Header from '../../components/header';
import HeaderAuth from '../../components/headerAuth';

const ErrorStatus = () => {
    var _auth = sessionStorage.getItem('user');
    return(
            <div>
                {_auth? <HeaderAuth title="Error"/>:<Header title="Error"/>}
                <div className={_auth? "page-double with-scroll header-is-auth":"page-double with-scroll"}>
                    <div className="page">
                        <div className="title">
                            <h1>Tsc... Ocorreu um erro inesperado.</h1>
                            <h2>Por favor, se acontecer novamente siga essas etapas: </h2>
                        </div>
                        <div className="login-page-button shadow-theme">
                            <Link to="/">
                                <FaHeartBroken size={35}/>
                                <h3>Ok, tudo bem</h3>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
}

export default ErrorStatus;