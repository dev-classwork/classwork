import React from 'react';
import { TooltipTeamInterface } from '../../interfaces/global';

const CustomTooltip = (props: TooltipTeamInterface) => {
    if (props.active && props.payload[0]) {
        let details = props.payload[0].payload.actions.rank;

        details.sort(function(a, b){
            return (b.complexity_cyclomatic + b.methods * 0.8 + b.lines * 0.2)/2 - (a.complexity_cyclomatic + a.methods * 0.8 + a.lines * 0.2)/2;
        });

        console.log(props);

        return (
            <div className="custom-tooltip-group">
                <div className="custom-tooltip custom-tooltip-team">
                    <div>
                        <h3>{props.payload[0].payload.name}</h3>
                        <h4>{props.payload[0].payload.repos}</h4>
                        <h4>Equilibrio: {props.payload[0].value}{props.payload[0].unit}</h4>
                        <h4>Pontuação: {(props.payload[1].value).toFixed(2)}{props.payload[1].unit}</h4>
                        <h4>Complexidade: {props.payload[1].payload.cc}{props.payload[1].unit}</h4>
                        <h4>Métodos: {props.payload[1].payload.mt}{props.payload[1].unit}</h4>
                        <h4>Linhas: {props.payload[1].payload.li}{props.payload[1].unit}</h4>
                    </div>
                </div>
                {details.map(function(item, index){
                    if(index <= 2){
                        let points = "0";
                        let pointsPorcent = "0";

                        if(item.complexity_cyclomatic !== 0 || item.methods !== 0 || item.lines !== 0){
                            points = Number((item.complexity_cyclomatic + item.methods * 0.8 + item.lines * 0.2/2)).toFixed(2);

                            pointsPorcent = (Number(((item.complexity_cyclomatic + item.methods * 0.8 + item.lines * 0.2)/
                            2)/props.payload[1].value) * 100).toFixed(2);
                        }

                        return(<div className="custom-tooltip custom-tooltip-team" key={index}>
                            <div>
                                <h3>{item.name}</h3>
                                {
                                    item.name.includes("[bot]")? <h4>[Contagem pulada]</h4>:(<>
                                    <h4>Fez: {points} ({Number(pointsPorcent) > 100? 100:Number(pointsPorcent) < 0? 0:pointsPorcent}%)</h4>
                                    <h4>[cc: {item.complexity_cyclomatic} | mt: {item.methods} | li: {item.lines}]</h4>
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