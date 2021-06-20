import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DropzoneComponent } from '../../interfaces/global';
import { FaFileImport } from 'react-icons/fa';

const MyDropzone: React.FC<DropzoneComponent> = ({ onFileUploaded, template, reset, errors }) => {
    const [imageUrl, setImageUrl] = useState('');
    
    useEffect(() => {
        if(reset){
            setImageUrl('');
        }
    }, [reset]);

    const onDrop = useCallback((acceptedFiles) => {
        const files = acceptedFiles[0];
        setImageUrl(URL.createObjectURL(files));
        onFileUploaded(files, {
            url: "default",
            filename: "default"
        }, false);
    }, [onFileUploaded]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: 'image/*'
    })
    
    var haveError = errors.includes('haveImage')? "dropzone-red":"dropzone";
    
    return (
        <div className={imageUrl || template !== 'default'? "dropzone-image shadow-theme":haveError} {...getRootProps()}>
            <input {...getInputProps()} accept="image/*"/>
            {(imageUrl || template !== 'default') && (<div>
                <img src={template === 'default'? imageUrl:template} alt="dropzone"/>
            </div>)}
            {(isDragActive && (!imageUrl && template === 'default')) && (<div>
                <FaFileImport size={65}/>
                <p>Solte o arquivo e veja a mágica!</p>
            </div>)}
            {(!isDragActive && (!imageUrl && template === 'default')) && (<div>
                <FaFileImport size={65}/>
                <p>Arraste seus arquivos aqui, os selecione manualmente 
                ou escolha um de nossos templates.</p>
            </div>)}
        </div>
    )
}

export default MyDropzone;