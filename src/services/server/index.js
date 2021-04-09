import initiateUserConnection from './initiateUserConnection';
import startUserConnection from './startUserConnection';
import createUserConnectionObject from './createUserConnectionObject';
import deployConnection from './deployConnection';

module.exports = (appEventContext = null) => {
	if (appEventContext) {
		appEventContext.on('createUserWhatsAppConnectionObject', (...args) =>
			createUserConnectionObject({ appEventContext }, ...args),
		);
		appEventContext.on('startUserWhatsAppServerConnection', (...args) =>
			startUserConnection({ appEventContext }, ...args),
		);
		appEventContext.on('initiateUserWhatsAppServerConnection', (...args) =>
			initiateUserConnection({ appEventContext }, ...args),
		);
		appEventContext.on('deployWhatsAppServerConnection', (...args) => deployConnection({ appEventContext }, ...args));
	}
};
