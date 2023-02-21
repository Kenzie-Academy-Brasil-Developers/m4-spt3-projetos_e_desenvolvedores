import { Request, Response } from 'express'; 
import { QueryConfig, QueryResult } from 'pg';
import format from 'pg-format';
import { client } from '../database';
import { DeveloperResult, newData } from '../interfaces/developers.interfaces'
import { DeveloperInfoResult, dataDeveloperInfo, iDeveloperInfo } from '../interfaces/developersInfo.interfaces' 
import { keysRequiredProjects, ProjectResult } from '../interfaces/projects.interfaces';

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

const createProject = async (req: Request, res: Response): Promise<Response> => {
    const projectData: any = req.body
    const requiredKeys: Array<keysRequiredProjects> = ['name', 'description', 'estimatedTime', 'repository', 'startDate', 'developerID']
    const keys: Array<string> = Object.keys(projectData)
    const arrayKeysLacking: Array<string> = []

    Object.keys(projectData).map((key: any) => {
        if(key !== 'name' && key !== 'description' && key !== 'estimatedTime' && key !== 'repository' && key !== 'startDate' && key !== 'developerID'){
            return delete projectData[`${key}`]
        }    
    })

    const containsAllRequired: boolean = requiredKeys.every((key: string) => {
        if(keys.includes(key)){
            return true
        }
        else{
            if(!Object.keys(projectData).includes('name')){
                arrayKeysLacking.push('name')
            }
            if(!Object.keys(projectData).includes('description')){
                arrayKeysLacking.push('description')
            }
            if(!Object.keys(projectData).includes('estimatedTime')){
                arrayKeysLacking.push('estimatedTime')
            }
            if(!Object.keys(projectData).includes('repository')){
                arrayKeysLacking.push('repository')
            }
            if(!Object.keys(projectData).includes('startDate')){
                arrayKeysLacking.push('startDate')
            }
            if(!Object.keys(projectData).includes('developerID')){
                arrayKeysLacking.push('developerID')
            }
            return false
        }
    })

    if(!containsAllRequired){
        return res.status(400).json({
            message: `Missing required keys: ${arrayKeysLacking.join(',')}.`
        })
    }

    let queryString: string = format(`
        INSERT INTO
            projects (%I)
        VALUES
            (%L)
        RETURNING *;    
    `,
        Object.keys(projectData),
        Object.values(projectData)
    )
    const queryResult: ProjectResult = await client.query(queryString)

    queryString = `
        INSERT INTO
            projects_technologies ("addedIn", "projectID")
        VALUES
            ($1, $2)    
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [queryResult.rows[0].startDate, queryResult.rows[0].id]
    }
    await client.query(queryConfig)

    return res.status(201).json(queryResult.rows[0])
}

const getProjects = async (req: Request, res: Response): Promise<Response> => {
    const queryString: string = `
        SELECT
            pr."id" AS "projectID",
            pr."name" AS "projectName",
            pr."description" AS "projectDescription",
            pr."estimatedTime" AS "projectEstimatedTime",
            pr."repository" AS "projectRepository",
            pr."startDate" AS "projectStartDate",
            pr."endDate" AS "projectEndDate",
            pr."developerID" AS "projectDeveloperID",
            tech."id" AS "technologyID",
            tech."name" AS "technologyName"
        FROM
            projects pr
        FULL JOIN
            projects_technologies prtech ON pr.id = prtech."projectID"
        FULL JOIN
            technologies tech ON tech.id = pr."developerID";
        ;
    `
    const queryResult: QueryResult = await client.query(queryString)

    return res.status(200).json(queryResult.rows)
}

const getProjectId = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)

    const queryString: string = `
        SELECT
            pr."id" AS "projectID",
            pr."name" AS "projectName",
            pr."description" AS "projectDescription",
            pr."estimatedTime" AS "projectEstimatedTime",
            pr."repository" AS "projectRepository",
            pr."startDate" AS "projectStartDate",
            pr."endDate" AS "projectEndDate",
            pr."developerID" AS "projectDeveloperID",
            tech."id" AS "technologyID",
            tech."name" AS "technologyName"
        FROM
            projects pr
        FULL JOIN
            projects_technologies prtech ON pr.id = prtech."projectID"
        FULL JOIN
            technologies tech ON tech.id = pr."developerID"
        WHERE
            pr.id = $1;
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }
    const queryResult: QueryResult = await client.query(queryConfig)

    return res.status(200).json(queryResult.rows[0])
}

const updateProject = async (req: Request, res: Response): Promise<Response> => {
    const projectId: number = parseInt(req.params.id)
    const projectData: any = req.body

    Object.keys(projectData).map((key: any) => {
        if(key !== 'name' && key !== 'description' && key !== 'estimatedTime' && key !== 'repository' && key !== 'startDate' && key !== 'endDate' && key !== 'developerID'){
            return delete projectData[`${key}`]
        }    
    })

    if(Object.keys(projectData).length <= 0){
        return res.status(400).json({
            message: 'At least one of those keys must be send.',
            keys: [
                'name',
                'description',
                'estimatedTime',
                'repository',
                'startDate',
                'endDate',
                'developerId'
            ]
        })
    }

    const queryString: string = format(`
        UPDATE
            projects
        SET
        (%I) = row(%L)
        WHERE
        id = $1
        RETURNING *; 
    `,
        Object.keys(projectData),
        Object.values(projectData)
    )
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [projectId]
    }
    const queryResult: QueryResult = await client.query(queryConfig)

    return res.status(200).json(queryResult.rows[0])
}

const deleteProject = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)

    const queryString: string = `
        DELETE FROM
            projects
        WHERE
            id = $1;
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }
    await client.query(queryConfig)

    return res.status(204).send()
}

const getDeveloperProjects = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)

    const queryString: string = `
    SELECT
        dv."id" AS "developerID",
        dv."name" AS "developerName",
        dv."email" AS "developerEmail",
        dv."developerInfoID",
        dinfo."developerSince" AS "developerInfoDeveloperSince",
        dinfo."preferredOS" AS "developerInfoPreferredOS",
        pr."id" AS "projectID",
        pr."name" AS "projectName",
        pr."description" AS "projectDescription",
        pr."estimatedTime" AS "projectEstimatedTime",
        pr."repository" AS "projectRepository",
        pr."startDate" AS "projectStartDate",
        pr."endDate" AS "projectEndDate",
        tech."id" AS "technologyID",
        tech."name" AS "technologyName"
    FROM
        developers dv
    FULL JOIN
        developer_infos dinfo ON dinfo.id = dv."developerInfoID"
    JOIN
        projects pr ON dv.id = pr."developerID"
    FULL JOIN
        technologies tech ON tech.id = pr."developerID"
    WHERE
        dv.id = $1;
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }
    const queryResult: QueryResult = await client.query(queryConfig)

    return res.status(200).json(queryResult.rows)
}

const createTechnology = async (req: Request, res: Response): Promise<Response> => {
    const id: number = parseInt(req.params.id)
    const technologyData: any = req.body

    Object.keys(technologyData).map((key: any) => {
        if(key !== 'name'){
            return delete technologyData[`${key}`]
        }    
    })
    
    if(!technologyData.name || technologyData.name.toLowerCase() !== 'javascript' && technologyData.name.toLowerCase() !== 'python' && technologyData.name.toLowerCase() !== 'react' && technologyData.name.toLowerCase() !== 'express.js' && technologyData.name.toLowerCase() !== 'html' && technologyData.name.toLowerCase() !== 'css' && technologyData.name.toLowerCase() !== 'django' && technologyData.name.toLowerCase() !== 'postgresql' && technologyData.name.toLowerCase() !== 'mongodb'){
        return res.status(400).json({
            message: "Technology not supported.",
            options: [
                "JavaScript",
                "Python",
                "React",
                "Express.js",
                "HTML",
                "CSS",
                "Django",
                "PostgreSQL",
                "MongoDB"
            ]
        })
    }

    let queryString: string = format(`
        INSERT INTO
            technologies (%I)
        VALUES
            (%L);    
    `,
        Object.keys(technologyData),
        Object.values(technologyData)
    )
    await client.query(queryString)

    queryString = format(`
        UPDATE
            projects_technologies
        SET
            "technologyID" = $1
        WHERE
            "projectID" = $1; 
    `)
    let queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }
    await client.query(queryConfig)

    queryString = `
        SELECT
            tech."id" AS "technologyID",
            tech."name" AS "technologyName",
            pr."id" AS "projectID",
            pr."name" AS "projectName",
            pr."description" AS "projectDescription",
            pr."estimatedTime" AS "projectEstimatedTime",
            pr."repository" AS "projectRepository",
            pr."startDate" AS "projectStartDate",
            pr."endDate" AS "projectEndDate"
        FROM
            projects_technologies prtech
        JOIN
            technologies tech ON tech.id = prTech."technologyID"
        JOIN
            projects pr ON pr.id = prtech."projectID"
        WHERE
            prTech."projectID" = $1;
    `
    queryConfig = {
        text: queryString,
        values: [id]
    }
    const queryResult: QueryResult = await client.query(queryConfig)

    return res.status(201).json(queryResult.rows[0])
}

const deleteTechnology = async (req: Request, res: Response): Promise<Response> => {
    const id: number= parseInt(req.params.id)
    const name: string = req.params.name

    if(!name || name.toLowerCase() !== 'javascript' && name.toLowerCase() !== 'python' && name.toLowerCase() !== 'react' && name.toLowerCase() !== 'express.js' && name.toLowerCase() !== 'html' && name.toLowerCase() !== 'css' && name.toLowerCase() !== 'django' && name.toLowerCase() !== 'postgresql' && name.toLowerCase() !== 'mongodb'){
        return res.status(404).json({
            message: "Technology not supported",
            options: [
                "JavaScript",
                "Python",
                "React",
                "Express.js",
                "HTML",
                "CSS",
                "Django",
                "PostgreSQL",
                "MongoDB"
            ]
        
        })
    }

    let queryString: string = `
        SELECT
            * 
        FROM
            projects_technologies
        WHERE
            "projectID" = $1
    `
    let queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }
    let queryResult: QueryResult = await client.query(queryConfig)
    const techId = queryResult.rows[0].technologyID === null ? 'vazio' : parseInt(queryResult.rows[0].technologyID)

    queryString = `
        DELETE FROM
            technologies tech
        WHERE
            tech.name = $1 AND tech.id = $2;
    `
    queryConfig= {
        text: queryString,
        values: [name, techId]
    }
    queryResult = await client.query(queryConfig)

    if(queryResult.rowCount <= 0){
        return res.status(404).json({
            message: `Technology '${name}' not found on this Project.`
        })
    } 
    
    return res.status(204).send()
}

export { createDeveloper, getDeveloper, getDeveloperId, createDeveloperInfo, updateDeveloper, deleteDeveloper, 
updateDeveloperInfo, createProject, getProjects, getProjectId, updateProject, getDeveloperProjects, deleteProject,
createTechnology, deleteTechnology }