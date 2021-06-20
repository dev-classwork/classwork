import React from 'react';
import { TooltipInterface } from '../../../../../interfaces/global';

const CustomTooltip = (props: TooltipInterface) => {
    if (props.active) {
        return (
            <div className="custom-tooltip">
                <img src={props.payload[2].value} alt="avatar"/>
                <div>
                    <h3>{`${props.label} - ${props.payload[0].value}`}</h3 >
                    <h4>{props.payload[1].value}</h4>
                    <h4>{`Alterações: ${props.payload[3].value}`}</h4>
                </div>
            </div>
        );
    }

    return null;
};

export default CustomTooltip;