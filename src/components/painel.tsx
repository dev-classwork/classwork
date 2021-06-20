import React from 'react';
import { useHistory } from 'react-router-dom';
import { PainelComponent } from '../interfaces/global';
import { isNullOrUndefined } from 'util';

import Icons from './icons';

const Painel = (props: PainelComponent) => {
    const history = useHistory();
    const haveBarTop = !isNullOrUndefined(props.haveBarTop)? props.haveBarTop:true;
    const color = !isNullOrUndefined(props.color)? props.color:'rgb(114, 182, 238)';
    const forceReturn = props.forceReturn;

    function handleBack(){
        if(!isNullOrUndefined(forceReturn)){
            history.push(forceReturn);
        }else{
            history.goBack();
        }
    }

    return(
        <div className="painel-div" style={{ top: haveBarTop? 37:13 }}> 
            <button className="shadow-theme-lit-current-color" onClick={handleBack} style={{ backgroundColor: color, color: color }}>
                <Icons name="back" size={25} color="white"/>
                <h1 style={{ color: 'white'}}>Voltar</h1>
            </button>
        </div>
    );
}

export default Painel;