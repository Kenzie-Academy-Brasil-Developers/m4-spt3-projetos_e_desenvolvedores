import { QueryResult } from "pg"

interface iProjectRequest {
    name:  string,
    description: string,
    estimatedTime: string,
    repository: string,
    startDate: string,
    developerId: number | string,
}

interface iProject extends iProjectRequest{
    id: number,
    endDate: null | string
}

type ProjectResult = QueryResult<iProject>

export { iProjectRequest, iProject, ProjectResult }