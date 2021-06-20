import React from 'react';
import { TooltipInterface } from '../../../../../interfaces/global';

const CustomTooltip = (props: TooltipInterface) => {
    if (props.active) {
        return (
            <div className="custom-tooltip tooltip-methods">
                <h3>{`Métodos no código: ${props.payload[0].value}`}</h3 >
            </div>
        );
    }

    return null;
};

export default CustomTooltip;