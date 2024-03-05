import express from "express"
import bodyParser from "body-parser"
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import inventoryRouter from "./routes/inventory.js"

const app = express()
const port = process.env.PORT || 3000
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public'))

app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(express.json())


app.use('/inventory', inventoryRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send('Internal Server Error')
})

app.listen(port, () => {
  console.log(`App running on port ${port}`)
})