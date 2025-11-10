const getEnv = (key:string,defaultValue?:string):string=>{
    const value=process.env[key] || defaultValue;

    if(value===undefined){
        throw new Error(`Missing environment variable: ${key}`);
    }

    return value;
}

export const MONGO_URI=getEnv("MONGO_URI");
export const PORT=getEnv("PORT","3000");
export const NODE_ENV=getEnv("NODE_ENV","development");
export const APP_ORIGIN=getEnv("APP_ORIGIN");
export const VITE_API_URL=getEnv("VITE_API_URL");
export const JWT_SECRET=getEnv("JWT_SECRET");
export const JWT_REFRESH_SECRET=getEnv("JWT_REFRESH_SECRET");
export const GMAIL_USER=getEnv("GMAIL_USER");
export const GMAIL_APP_PASSWORD=getEnv("GMAIL_APP_PASSWORD");
