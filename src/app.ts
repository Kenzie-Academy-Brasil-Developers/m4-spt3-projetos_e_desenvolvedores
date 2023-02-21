import express, { Application } from 'express'
import { startDataBase } from './database'
import { createDeveloper, createDeveloperInfo, createProject, createTechnology, deleteDeveloper, deleteProject, deleteTechnology, getDeveloper, getDeveloperId, getDeveloperProjects, getProjectId, getProjects, updateDeveloper, updateDeveloperInfo, updateProject } from './functions/mechanicals.logics'
import { ensureIdExist, ensureIdProjectExist } from './middlewares/middlewares'

const app: Application = express()
app.use(express.json())

app.post('/developers', createDeveloper)
app.get('/developers', getDeveloper)
app.get('/developers/:id', ensureIdExist, getDeveloperId)
app.post('/developers/:id/infos', ensureIdExist, createDeveloperInfo)
app.patch('/developers/:id', ensureIdExist, updateDeveloper)
app.patch('/developers/:id/infos', ensureIdExist, updateDeveloperInfo)
app.delete('/developers/:id', ensureIdExist, deleteDeveloper)
app.post('/projects', ensureIdProjectExist, createProject)
app.get('/projects', getProjects)
app.get('/projects/:id', ensureIdProjectExist, getProjectId)
app.patch('/projects/:id', ensureIdProjectExist, updateProject)
app.delete('/projects/:id', ensureIdProjectExist, deleteProject)
app.get('/developers/:id/projects', ensureIdExist, getDeveloperProjects)
app.post('/projects/:id/technologies', ensureIdProjectExist, createTechnology)
app.delete('/projects/:id/technologies/:name', ensureIdProjectExist, deleteTechnology)

const PORT: number = 3000
const runningMsg: string = `Server running on https://localhost:${PORT}`
app.listen(PORT, async () => {
    await startDataBase()
    console.log(runningMsg)
})