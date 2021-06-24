import React, { useState } from 'react';
import Icons from './icons';

export interface BarChartHelpProps {
 itens: {
  title: string,
  description: string,
  formula?: string,
 }[],
 maxWidth?: number,
 maxHeight?: number,
 color: string,
};

const BarChartHelp = (props: BarChartHelpProps) => {
 const [needHelp, setNeedHelp] = useState(false);

 if (needHelp) {
  return (
   <>
    <div className="bar-chart-modal" style={{ color: props.color }}>
     {props.itens.map((item, index) => {
      return (
       <div key={`help-${index}`} style={{ maxWidth: props.itens.length <= 1? "96%":"48%"}}>
        <h1>{item.title}</h1>
        <p>{item.description}</p>
        {item.formula && <p className="calc">{item.formula}</p>}
       </div>
      );
     })}
    </div>
    <button className="bar-chart-modal-button" style={{ color: props.color }} onClick={() => setNeedHelp(!needHelp)}>
     <Icons name="question"/>
    </button>
   </>
  );
 } else {
  return (
   <>
    <h3 className="bar-chart-modal-button-notf">Não esta entendendo? {'>>>'} </h3>
    <button className="bar-chart-modal-button" style={{ color: props.color }} onClick={() => setNeedHelp(!needHelp)}>
     <Icons name="question"/>
    </button>
   </>
  );
 };
};

export default BarChartHelp;