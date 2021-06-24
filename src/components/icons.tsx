import React from 'react';
import { IconsComponent } from '../interfaces/global';
import { 
    FaFolderOpen, 
    FaPowerOff, 
    FaUserCircle,
    FaUserLock, 
    FaAngleRight, 
    FaAngleLeft, 
    FaAngleDoubleLeft, 
    FaAngleDoubleRight, 
    FaCog, 
    FaBell,
    FaChalkboard,
    FaChalkboardTeacher,
    FaEdit,
    FaPlus,
    FaUsers,
    FaLifeRing,
    FaDiscord,
    FaGithubAlt,
    FaTools,
    FaQuestion
} from 'react-icons/fa';

const Icons = (props: IconsComponent) => {
    switch(props.name) {
        case('double-back'): return(<FaAngleDoubleLeft size={props.size} color={props.color}/>);
        case('back'): return(<FaAngleLeft size={props.size} color={props.color}/>);
        case('next'): return(<FaAngleRight size={props.size} color={props.color}/>);
        case('double-next'): return(<FaAngleDoubleRight size={props.size} color={props.color}/>);

        case('folder-open'): return(<FaFolderOpen size={props.size} color={props.color}/>);
        case('user-circle'): return(<FaUserCircle size={props.size} color={props.color}/>);
        case('cog'): return(<FaCog size={props.size} color={props.color}/>);
        case('bell'): return(<FaBell size={props.size} color={props.color}/>);
        case('chalkboard'): return(<FaChalkboard size={props.size} color={props.color}/>);
        case('chalkboard-teacher'): return(<FaChalkboardTeacher size={props.size} color={props.color}/>);
        case('edit'): return(<FaEdit size={props.size} color={props.color}/>);
        case('plus'): return(<FaPlus size={props.size} color={props.color}/>);
        case('users'): return(<FaUsers size={props.size} color={props.color}/>);
        case('life-ring'): return(<FaLifeRing size={props.size} color={props.color}/>);
        case('question'): return(<FaQuestion size={props.size} color={props.color}/>);
        case('discord'): return(<FaDiscord size={props.size} color={props.color}/>);
        case('tools'): return(<FaTools size={props.size} color={props.color}/>);
        case('user-lock'): return(<FaUserLock size={props.size} color={props.color}/>);
        case('user-github'): return(<FaGithubAlt size={props.size} color={props.color}/>);
        case('exit'): return(<FaPowerOff size={props.size} color={props.color}/>);
        default: return null;
    }
}

export default Icons;