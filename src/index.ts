require('dotenv').config();
import instincClient from './structures/Client';
// eslint-disable-next-line new-cap
const client = new instincClient();

client._init();
