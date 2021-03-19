import path from 'path';
import fs from 'fs';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

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

const userId = process.argv[3];
console.log({ userId });

const startServer = () => {
	const app = express();
	app.use(cors());
	app.options('*', cors());

	app.use(addEventContext);

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	app.use('/', routes);

	if (userId) {
		setInterval(async () => {
			const server = await serverRepository.first({ user_id: userId });
			if (server) {
				await serverRepository
					.updateInstance(server, {
						status: 'disconnected',
					})
					.catch((e) => e);
			}
			process.exit(0);
		}, 2000);
	}

	const _PORT = process.argv[2] ?? (PORT || 3000);
	app.listen(_PORT, () => {
		console.log(`Server is listening to port ${_PORT}`);
	});
};

const registerAppServiceEvents = (appEventContext) => {
	const servicesDirectory = __dirname + '/../services';
	fs.readdirSync(servicesDirectory)
		.filter((fileName) => {
			return fileName.indexOf('.') !== 0 && fileName.slice(-3) === '.js' && fileName !== 'index.js';
		})
		.forEach((fileName) => {
			const service = require(path.join(servicesDirectory, fileName));
			if (typeof service === 'function') service(appEventContext);
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
