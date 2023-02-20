import { Request, Response, NextFunction } from 'express'; 
import { DeveloperResult } from '../interfaces/developers.interfaces'
import { ProjectResult } from '../interfaces/projects.interfaces'
import { client } from '../database';
import { QueryConfig } from 'pg';

const ensureIdExist = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const id: number = parseInt(req.params.id)

    const queryString: string = `
        select
            *
        from
            developers
        where
            id = $1;
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }
    const queryResult: DeveloperResult = await client.query(queryConfig)

    if(!queryResult.rowCount){
        return res.status(404).json({
            message: 'Developer not found.'
        })
    }

    return next()
}

const ensureIdProjectExist = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const idRequest: number = parseInt(req.body.developerID)
    const idParams: number = parseInt(req.params.id)
    
    if(idRequest){
        const queryString: string = `
            SELECT
                *
            FROM
                developers
            WHERE
                id = $1;
        `
        const queryConfig: QueryConfig = {
            text: queryString,
            values: [idRequest]
        }
        const queryResult: DeveloperResult = await client.query(queryConfig)

        if(!queryResult.rowCount){
            return res.status(404).json({
                message: 'Developer not found.'
            })
        }
    }
    if(idParams){
        const queryString: string = `
            SELECT
                *
            FROM
                projects
            WHERE
                id = $1;
        `
        const queryConfig: QueryConfig = {
            text: queryString,
            values: [idParams]
        }
        const queryResult: ProjectResult = await client.query(queryConfig)

        if(!queryResult.rowCount){
            return res.status(404).json({
                message: 'Project not found.'
            })
        }
    }

}

export { ensureIdExist, ensureIdProjectExist }