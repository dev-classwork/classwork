import React from 'react';
import { TooltipTeamInterface } from '../../interfaces/global';

const CustomTooltip = (props: TooltipTeamInterface) => {
    if (props.active && props.payload[0]) {
        let details = props.payload[0].payload.actions.rank;

        details.sort(function(a, b){
            let _a = Number((((a.additions + a.deletions) * 0.5)
            + (a.complexity_cyclomatic * 4.5))/5);
            let _b = Number((((b.additions + b.deletions) * 0.5)
            + (b.complexity_cyclomatic * 4.5))/5)
            return _b - _a;
        });


        return (
            <div className="custom-tooltip-group">
                <div className="custom-tooltip custom-tooltip-team">
                    <div>
                        <h3>{props.payload[0].payload.name}</h3>
                        <h4>{props.payload[0].payload.repos}</h4>
                        <h4>Pontuação: {(props.payload[0].value).toFixed(2)}{props.payload[0].unit}</h4>
                        <h4>Complexidade: {props.payload[0].payload.cc}{props.payload[0].unit}</h4>
                        <h4>Métodos: {props.payload[0].payload.mt}{props.payload[0].unit}</h4>
                        <h4>Alterações: {(props.payload[0].payload.changes)}{props.payload[0].unit}</h4>
                    </div>
                </div>
                {details.map(function(item, index){
                    if(index <= 2){
                        let points = "0";
                        let pointsPorcent = "0";

                        if(item.complexity_cyclomatic !== 0 || item.methods !== 0 || item.lines !== 0){
                            let _points = Number((((item.additions + item.deletions) * 0.5)
                            + (item.complexity_cyclomatic * 4.5))/5);

                            points = _points.toFixed(2);

                            console.log(((item.additions + item.deletions) * 0.5), (item.complexity_cyclomatic * 4.5), _points, props.payload[0].value)
                            pointsPorcent = ((_points/props.payload[0].value) * 100).toFixed(2);
                        }

                        return(<div className="custom-tooltip custom-tooltip-team" key={index}>
                            <div>
                                <h3>{item.name}</h3>
                                {
                                    item.name.includes("[bot]")? <h4>[Contagem pulada]</h4>:(<>
                                    <h4>Fez: {points} ({Number(pointsPorcent) > 100? 100:Number(pointsPorcent) < 0? 0:pointsPorcent}%)</h4>
                                    <h4>[alt: {item.additions + item.deletions} | cc: {item.complexity_cyclomatic} | mt: {item.methods} ]
                                    </h4>
                                    </>)
                                }
                            </div>
                        </div>)
                    }else if(index === 3){
                        return(<div className="custom-tooltip custom-tooltip-team" key={index}>
                            <div>
                                <h3>E mais {details.length - 3}...</h3>
                            </div>
                        </div>)
                    };

                    return null;
                })}
            </div>
        );
    }

    return null;
};

export default CustomTooltip;