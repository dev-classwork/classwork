import React from 'react';
import { ConfirmBoxComponent } from '../interfaces/global';
import DynamicColorElements from '../pages/Classroom/Profile/dynamicColorElements';
import { FaTimes } from 'react-icons/fa';

const confirmBox = (props: ConfirmBoxComponent) => {

    function onPressOptionButton(value: any){
        props.onChoose(value, props.callbackFunction, props.index);
    }

    if(props.enable){
        return(<div className="confirm-box">
            <div className="confirm-box-content">
                <div id="header" style={{ backgroundColor: props.secundaryColor }}>
                    <h1>{props.title}</h1>
                    <DynamicColorElements 
                        type="button" 
                        primaryColor={props.primaryColor}
                        secundaryColor={"whitesmoke"}
                        onClickButton={() => { onPressOptionButton(false) }}
                    ><FaTimes size={25}/></DynamicColorElements>
                </div>
                <div id="content" style={{ color: props.primaryColor }}>
                    <p>{props.description}</p>
                </div>
                <div id="footer">
                    {props.options.map(function(item, index) {
                        return(<DynamicColorElements 
                            key={index}
                            type="button" 
                            primaryColor={props.primaryColor}
                            secundaryColor={"whitesmoke"}
                            onClickButton={() => { onPressOptionButton(item.returnValue) }}
                        >{item.title}</DynamicColorElements>);
                    })}
                </div>
            </div>
        </div>);
    }else{
        return(null);
    }
}

export default confirmBox;