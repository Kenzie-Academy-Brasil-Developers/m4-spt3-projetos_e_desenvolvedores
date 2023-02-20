import express, { Application } from 'express'
import { startDataBase } from './database'
import { createDeveloper, createDeveloperInfo, deleteDeveloper, getDeveloper, getDeveloperId, updateDeveloper, updateDeveloperInfo } from './functions/mechanicals.logics'
import { ensureIdExist } from './middlewares/middlewares'

const app: Application = express()
app.use(express.json())

app.post('/developers', createDeveloper)
app.get('/developers', getDeveloper)
app.get('/developers/:id', ensureIdExist, getDeveloperId)
app.post('/developers/:id/infos', ensureIdExist, createDeveloperInfo)
app.patch('/developers/:id', ensureIdExist, updateDeveloper)
app.patch('/developers/:id/infos', ensureIdExist, updateDeveloperInfo)
app.delete('/developers/:id', ensureIdExist, deleteDeveloper)

const PORT: number = 3000
const runningMsg: string = `Server running on https://localhost:${PORT}`
app.listen(PORT, async () => {
    await startDataBase()
    console.log(runningMsg)
})