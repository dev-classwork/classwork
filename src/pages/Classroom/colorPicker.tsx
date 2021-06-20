import React, { useState, useEffect } from 'react';
import { TwitterPicker, SliderPicker, ColorResult } from 'react-color';
import { ColorPickerComponent } from '../../interfaces/global'; 

const ColoPicker = (props: ColorPickerComponent) => {
    const [color, setColor] = useState('#4682b4');
    const [previewColor, setPreviewColor] = useState(color);
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        setColor(props.color);
    },[props.color]);

    function handleHoverColor(houverColor: ColorResult, e: MouseEvent) {
        e.preventDefault();
        setPreviewColor(houverColor.hex);
        props.onColorChange(color, houverColor.hex);
    }

    function handleColorSlider(_color: ColorResult) {
        if(_color.hsl.l <= 0.6){
            setPreviewColor(_color.hex);
            setColor(_color.hex);
            props.onColorChange(_color.hex, _color.hex);
            setIsBlocked(false);
        }else{
            setIsBlocked(true);
        }
    }

    function handleSetColor(color: ColorResult){
        if(color.hsl.l <= 0.6){
            setColor(color.hex);
            props.onColorChange(color.hex, previewColor);
            setIsBlocked(false);
        }else{
            setIsBlocked(true);
        }
    }

    return(
        <div style={{ marginTop: '10px'}}>
            <TwitterPicker colors={[
            '#4682B4',
            '#BF4063',
            '#BF4099',
            '#9A40BF',
            '#5540BF',
            '#4046BF', 
            '#40BFB2', 
            '#47BF40', 
            '#7DBF40', 
            '#B3BF40', 
            '#BF9940', 
            '#BF6340', 
            '#BF4040',
            ]} color={color} triangle="hide" width="100%" onSwatchHover={handleHoverColor} onChange={handleSetColor} onChangeComplete={handleSetColor}/>
            <div className="slider-picker-color">
            <SliderPicker color={color} onChange={handleColorSlider} onChangeComplete={handleSetColor}/>
            </div>
            {isBlocked && <p className="picker-color-alert">Cores muito fracas podem forçar sua visão!!!</p>}
        </div>
    );
}

export default ColoPicker;