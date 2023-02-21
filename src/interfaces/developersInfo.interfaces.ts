import { QueryResult } from "pg"

interface iDeveloperInfoRequest{
    developerSince: string,
    preferredOS: string,
}

interface iDeveloperInfo extends iDeveloperInfoRequest{
    id: number
    developerID?: number
}

type DeveloperInfoResult = QueryResult<iDeveloperInfo>
type dataDeveloperInfo = 'developerSince' | 'preferredOS'


export { iDeveloperInfoRequest, iDeveloperInfo, DeveloperInfoResult, dataDeveloperInfo }