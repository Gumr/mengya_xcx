type Method='GET'|'POST'|'PUT'

type Params={
    [index:string]:string
}

type Options={
    loadingMsg?:string,
    url?:string
}

type ResponseVo={
    data?:any,
    info?:any,
    status?:any
}

declare function request (method:Method,api:string,params?:Params,options?:Options):Promise<ResponseVo>

declare function get (api:string,params?:Params,options?:Options) :Promise<ResponseVo>

declare function post (api:string,params?:Params,options?:Options):Promise<ResponseVo>

declare function put (api:string,params?:Params,options?:Options) :Promise<ResponseVo>




