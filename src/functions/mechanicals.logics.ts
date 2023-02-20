import { Request, Response } from 'express'; 
import { QueryConfig } from 'pg';
import format from 'pg-format';
import { client } from '../database';
import { DeveloperResult, newData } from '../interfaces/developers.interfaces'
import { DeveloperInfoResult, dataDeveloperInfo, iDeveloperInfo } from '../interfaces/developersInfo.interfaces' 

const createDeveloper = async (req: Request, res: Response): Promise<Response | void> => {
    const developerData: any = req.body

    const keys: Array<string> = Object.keys(developerData)
    const requiredKeys: Array<newData> = ['name', 'email']

    const email: string = developerData.email
    const queryString: string = `
        select
            *
        from
            developers
        where
            email = $1;    
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [email]
    }
    const queryResult: DeveloperResult = await client.query(queryConfig)

    const arrayKeysLacking: Array<string> = []
    const containsAllRequired: boolean = requiredKeys.every((key: string) => {
        if(keys.includes(key)){
            return true
        }
        else{
            if(!Object.keys(req.body).includes('name')){
                arrayKeysLacking.push('name')
            }
            if(!Object.keys(req.body).includes('email')){
                arrayKeysLacking.push('email')
            }
            return false
        }
    })
    Object.keys(req.body).map((key: any) => {
        if(key !== 'name' && key !== 'email'){
           return delete req.body[`${key}`]
        }
    })

    if(!containsAllRequired){
        return res.status(400).json({
            message: `Missing required keys: ${arrayKeysLacking.join(', ')}.`
        })
    }
    if(queryResult.rowCount >= 1){
        return res.status(409).json({
            message: 'Email already exists.'
        })
    }

    try{
        const queryString: string = format(`
            insert into 
                developers (%I)
            values 
                (%L)	
            returning *;
        `,
            Object.keys(req.body),
            Object.values(req.body)
        )
    
        const queryResult: DeveloperResult = await client.query(queryString)
    
        return res.status(201).json(queryResult.rows[0])
    }
    catch(error){
        if(error instanceof Error){
            return res.status(400).json({
                message: error.message
            })
        }
    }
}

const getDeveloper = async (req: Request, res: Response): Promise<Response> => {
    const queryString: string = `
        SELECT
            *
        FROM
            developers;
    `
    const queryResult: DeveloperResult = await client.query(queryString)

    return res.status(200).json(queryResult.rows)
}

const getDeveloperId = async (req: Request, res: Response): Promise<Response | void> => {
    const id: number = parseInt(req.params.id)

    if(id){
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

    return res.status(200).json(queryResult.rows[0])
    }

}

const createDeveloperInfo = async (req: Request, res: Response): Promise<Response> => {
    const developerId: number = parseInt(req.params.id) 
    let developerInfo: any = req.body

    const requiredKeys: Array<dataDeveloperInfo> = ['developerSince', 'preferredOS']
    const keys: Array<string> = Object.keys(developerInfo)
    const arrayKeysLacking: Array<string> = []

    Object.keys(developerInfo).map((key: any) => {
        if(key !== 'developerSince' && key !== 'preferredOS'){
            return delete developerInfo[`${key}`]
        }
    })
    const containsAllRequired: boolean = requiredKeys.every((key: string) => {
        if(keys.includes(key)){
            return true
        }
        else{
            if(!Object.keys(developerInfo).includes('developerSince')){
                arrayKeysLacking.push('developerSince')
            }
            if(!Object.keys(developerInfo).includes('preferredOS')){
                arrayKeysLacking.push('preferredOS')
            }
            return false
        }
    })

    if(!containsAllRequired){
        return res.status(400).json({
            message: `${arrayKeysLacking.length > 1 ? arrayKeysLacking.join(',') + '.' : arrayKeysLacking.join('')}`
        })
    }

    developerInfo = {
        ...developerInfo,
        developerID: developerId
    }

    let queryString: string = format(`
        insert into
            developer_infos (%I)
        values 
            (%L)
        returning *;           
    `,
        Object.keys(developerInfo),
        Object.values(developerInfo)
    )
    let queryResult: DeveloperInfoResult = await client.query(queryString)

    queryString = `
        update
            developers
        set
            "developerInfoID" = $1
        where
            id = $2
        returning *;            
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [queryResult.rows[0].id, developerId]
    }
    await client.query(queryConfig)

    const result: iDeveloperInfo = {
        ...queryResult.rows[0]
    }

    if(result.developerID){
        await delete result.developerID
    }

    return res.status(201).json(result)
}

const updateDeveloper = async (req: Request, res: Response): Promise<Response> => {
    const developerData: any = req.body
    const id: number = parseInt(req.params.id)
    
    Object.keys(developerData).map((key: any) => {
        if(key !== 'name' && key !== 'email'){
            return delete developerData[`${key}`]
         }
    })

    if(!Object.keys(developerData).includes('name') && !Object.keys(developerData).includes('email')){
        return res.status(400).json({
            message: 'At least one of those keys must be send.',
            keys: ['name', 'email']
        })
    }

    const queryString: string = format(`
        update
            developers 
        set
            (%I) = row(%L)
        where 
            id = $1
        returning *;
    `,
        Object.keys(developerData),
        Object.values(developerData)
    )
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }
    const queryResult: DeveloperResult = await client.query(queryConfig)

    return res.status(200).json(queryResult.rows[0])
}

const updateDeveloperInfo = async (req: Request, res: Response): Promise<Response> => {
    const developerId: number = parseInt(req.params.id) 
    const developerInfo: any = req.body

    Object.keys(developerInfo).map((key: any) => {
        if(key !== 'developerSince' && key !== 'preferredOS'){
            return delete developerInfo[`${key}`]
        }
    })

    if(!Object.keys(developerInfo).includes('developerSince') && !Object.keys(developerInfo).includes('preferredOS')){
        return res.status(400).json({
            message: 'At least one of those keys must be send.',
            keys: ['developerSince', 'preferredOS']
        })
    }

    const queryString: string = format(`
        update
            developer_infos
        set
            (%I) = row(%L)
        where
            id = $1
        returning *;        
    `,
        Object.keys(developerInfo),
        Object.values(developerInfo)
    )
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [developerId]
    }
    const queryResult = await client.query(queryConfig)

    return res.status(200).json(queryResult.rows[0])
}

const deleteDeveloper = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)

    const queryString = `
        delete from
            developers
        where
            id = $1;
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }
    await client.query(queryConfig)

    return res.status(204).send()
}

export { createDeveloper, getDeveloper, getDeveloperId, createDeveloperInfo, updateDeveloper, deleteDeveloper, 
updateDeveloperInfo }
