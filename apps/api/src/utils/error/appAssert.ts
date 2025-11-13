import assert from 'assert';
import AppError  from '../error/appError';
import { HttpStatusCode } from '../../constants/http';

type AppAssert = (
    condition : any,
    httpStatusCode:HttpStatusCode,
    message:string,
    appErrorCode?: string
)=>asserts condition;

const appAssert:AppAssert = (
    condition,
    httpStatusCode,
    message,
    appErrorCode
)=> assert(condition,new AppError(httpStatusCode,message,appErrorCode));

export default appAssert;