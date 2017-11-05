import express from 'express'
import bodyParser  from 'body-parser'
import config from './config/config'
import cors from 'cors'
import morgan from 'morgan'
import routes from './routes'

const app = express();

app.use(morgan('combined'));
app.use(cors({ origin: config.siteUrl }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('static'));
app.use('/api', routes);



app.listen(config.port, () => {
    console.log(`We are live on ${config.host}:${config.port}`);
});