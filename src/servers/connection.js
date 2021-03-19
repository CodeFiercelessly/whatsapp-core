import path from 'path';
import fs from 'fs';
import express from 'express';
import dotenv from 'dotenv';

import database from '../database/connection';
import { addEventContext, appEventContext } from '../middlewares';
// import { serverRepository } from '../repositories';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { PORT } = process.env;

const userId = process.argv[3];

if (!userId) process.exit(0);

const startServer = () => {
	const app = express();
	appEventContext.emit('startUserWhatsAppConnection', { userId });

	// if (userId) {
	// 	setInterval(async () => {
	// 		const server = await serverRepository.first({ user_id: userId });
	// 		if (server) {
	// 			await serverRepository
	// 				.updateInstance(server, {
	// 					status: 'disconnected',
	// 				})
	// 				.catch((e) => e);
	// 		}
	// 		process.exit(0);
	// 	}, 2000);
	// }

	const _PORT = process.argv[2] ?? (PORT || 3000);

	app.listen(_PORT, () => {
		console.log(`Connection server is listening to port ${_PORT}`);
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
		startServer();
	} catch (error) {
		console.error({ error });
	}
})();
