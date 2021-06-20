import React, { useState, useEffect } from 'react';
import { DynamicColorElementComponent } from '../../../interfaces/global'; 

const DynamicColorElements: React.FC<DynamicColorElementComponent> = (props) => {
    const [color, setColor] = useState(props.primaryColor);
    const [backgrounColor, setBackgroundColor] = useState(props.secundaryColor);

    useEffect(() => {
        function changeInitialState(){
            if(props.selected !== null && props.selected !== undefined && props.selected){
                setColor(props.primaryColor);
                setBackgroundColor(props.secundaryColor);
            }else{
                if((props.selected !== null && props.selected !== undefined && !props.selected) || props.type === "input" || 
                props.type === "button" || props.type === "reload-div" || props.type === "input-number"){
                    setColor('white');
                    setBackgroundColor(props.primaryColor);
                }
            }
        }
        
        changeInitialState();
    }, [props.primaryColor, props.secundaryColor, props.selected, props.type]);

    useEffect(() => {
        if(props.disable){
            setColor('white');
            setBackgroundColor(props.primaryColor);
        }
    }, [props.disable, props.primaryColor]);

    function handleChangeLimit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>){
        localStorage.setItem('defaultCommitsLimit', e.currentTarget.value);
        if(props.onCommitsChange !== null && props.onCommitsChange !== undefined){
            props.onCommitsChange(Number(e.currentTarget.value), Number(e.currentTarget.name));
        }
    }

    function handleOnClickButton(e: any) {
        if(props.onClickButton !== null && props.onClickButton !== undefined){
            props.onClickButton(e);
        }
    }

    function handleHover() {
        setColor(props.primaryColor);
        setBackgroundColor(props.secundaryColor);
    }

    function handleNotHover() {
        if((props.selected !== null && props.selected !== undefined && !props.selected) || props.type === "input" || 
        props.type === "button" || props.type === "reload-div" || props.type === "input-number" || props.type === "input-date"){
            setColor('white');
            setBackgroundColor(props.primaryColor);
        }
    }

    function handleOnChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
        if(props.onChangeInput !== null && props.onChangeInput !== undefined){
            props.onChangeInput(e);
        }
    }

    switch(props.type){
        case('button-commit'): 
            return <button
                style={{ color: color, backgroundColor: backgrounColor }}
                value={props.value}
                name={props.name}
                onClick={handleChangeLimit}
                onMouseEnter={handleHover}
                onMouseLeave={handleNotHover}
            >{props.children}</button>;
        case('button'):
            return <button
                style={{ color: color, backgroundColor: backgrounColor, opacity: props.disable? 0.5:1 }}
                onClick={handleOnClickButton}
                disabled={props.disable}
                onMouseEnter={handleHover}
                onMouseLeave={handleNotHover}
            >{props.children}</button>;
        case('input'):
            return <input 
                style={{ color: color, backgroundColor: backgrounColor }}
                value={props.value} 
                onChange={handleOnChangeInput}
                onMouseEnter={handleHover}
                onMouseLeave={handleNotHover}
            >{props.children}</input>;
        case('input-date'):
            return <input 
                type="date"
                style={{ color: color, backgroundColor: backgrounColor }}
                value={props.value} 
                onChange={handleOnChangeInput}
                onMouseEnter={handleHover}
                onMouseLeave={handleNotHover}
            >{props.children}</input>;
        case('input-number'):
            return <input
                type="number"
                min={0}
                style={{ color: color, backgroundColor: backgrounColor, width: 150, opacity: props.disable? 0.5:1 }}
                value={props.value}
                disabled={props.disable}
                onChange={handleOnChangeInput}
                onMouseEnter={handleHover}
                onMouseLeave={handleNotHover}
            >{props.children}</input>;
        case('reload-div'):
            return <div className="teams-repos-button-reload"><div
                style={{ color: color, backgroundColor: backgrounColor }}
                onClick={handleOnClickButton}
                onMouseEnter={handleHover}
                onMouseLeave={handleNotHover}
            >{props.children}</div></div>;
        default:
            return null;
    }
}

export default DynamicColorElements;