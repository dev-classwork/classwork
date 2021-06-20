import { isString } from 'util'

export default function jsonParseCheck(value: any){
    if(process.env.NODE_ENV === "development"){
        return isString(value)? JSON.parse(value):value;
    }else{
        return value;
    }
}