import React from 'react';
import { HeaderComponent } from '../interfaces/global';

const Header = (props: HeaderComponent) => {
    return(
        <div> 
            <div className="div-header-container">
                <div className="second-div-header-container">
                <h1 className="header-title">{props.title}</h1>
                </div>
            </div>
        </div>
    );
}

export default Header;