import path from 'path';
import fs from 'fs';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import glob from 'glob';

import database from '../database/connection';
import routes from './routes/api';
import seed from '../database/seeds';
import migration from '../database/migrations';
import { addEventContext, appEventContext } from '../middlewares';
import { serverRepository } from '../repositories';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { PORT } = process.env;

(async () => {
	try {
		await database.connect();
		console.log('Mongo DB is connected: Server');
	} catch (err) {
		console.error('Unable to connect to mongo: ', err);
	}
})();

const startServer = () => {
	const app = express();
	app.use(cors());
	app.options('*', cors());

	app.use(addEventContext);

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	app.use('/', routes);

	const _PORT = PORT || 3000;
	app.listen(_PORT, () => {
		console.log(`Server is listening to port ${_PORT}`);
	});
};

const registerAppServiceEvents = appEventContext => {
	const servicesDirectory = __dirname + '/../services/';
	glob(servicesDirectory + '/**/*.js', function(err, files) {
		if (err) throw err;
		files
			.filter(fileName => {
				return fileName.indexOf('.') !== 0 && fileName.slice(-3) === '.js' && fileName !== 'index.js';
			})
			.forEach(fileName => {
				const service = require(path.join(fileName));
				if (typeof service === 'function') service(appEventContext);
			});
	});
};

(async () => {
	try {
		registerAppServiceEvents(appEventContext);
		await seed(appEventContext);
		await migration(appEventContext);
		startServer();
	} catch (error) {
		console.error({ error });
	}
})();
