import React from 'react';
import { TooltipTeamInterface } from '../../interfaces/global';

const CustomTooltip = (props: TooltipTeamInterface) => {
    if (props.active && props.payload[0]) {
        return (
            <div className="custom-tooltip-group">
                <div className="custom-tooltip custom-tooltip-team">
                    <div>
                        <h3>{props.payload[0].payload.name}</h3>
                        <h4>{props.payload[0].payload.repos}</h4>
                        <h4>Equilibrio: {props.payload[0].value}{props.payload[0].unit}</h4>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default CustomTooltip;