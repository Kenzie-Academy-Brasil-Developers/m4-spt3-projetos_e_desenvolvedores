import { QueryResult } from "pg"

interface iDeveloperRequest{
    name: string,
    email: string
}

interface iDeveloperResult extends iDeveloperRequest{
    id: number,
    developerInfoId: null
}

type DeveloperResult = QueryResult<iDeveloperResult>
type newData = 'name' | 'email'

export { iDeveloperRequest, DeveloperResult, newData, iDeveloperResult }