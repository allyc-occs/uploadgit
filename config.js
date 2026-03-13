import moment from 'moment-timezone';

const CONNECTION = 'pairing'; 
const OWNER_NAME = 'Allyc';
const NOMOR_BOT = '6285646507691'; 
const DESTINATION = 'group'; 
const APIKEY = '6ff16ff5e2e9c16e7f5cfffc';
const RATE_LIMIT = 3000; 
const SIMILARITY = true; 
const MODE = 'production'; 
const VERSION = global.version; 

const EMAIL = 'parkvita@gmail.com';
const REGION = 'Indonesia';
const WEBSITE = 'autoresbot.com';
const DATA_OWNER = ['628386877368', '573171090569'];

const ANTI_CALL = false; 
const AUTO_READ = false; 
const AUTO_BACKUP = false; 
const MIDNIGHT_RESTART = false; 
const PRESENCE_UPDATE = ''; 
const TYPE_WELCOME = '1'; // 1, 2, 3, 4, 5, 6 
const BG_WELCOME2 = 'https://api.autoresbot.com/api/maker/bg-default';

const PANEL_URL = '';
const PANEL_PLTA = '';
const PANEL_DESCRIPTION = 'Butuh Bantuan Hubungi 628xxxxx';
const PANEL_ID_EGG = 15;
const PANEL_ID_LOCATION = 1;
const PANEL_DEFAULT_DISK = 5120; 
const PANEL_DEFAULT_CPU = 90;

const BADWORD_WARNING = 3; 
const BADWORD_ACTION = 'both'; 

const SPAM_LIMIT = 3; 
const SPAM_COULDOWN = 10; 
const SPAM_WARNING = 3; 
const SPAM_ACTION = 'both'; 

const STATUS_SCHEDULED = true;

const config = {
  APIKEY,
  phone_number_bot: NOMOR_BOT,
  type_connection: CONNECTION,
  bot_destination: DESTINATION,
  owner_name: OWNER_NAME,
  owner_number: DATA_OWNER,
  owner_website: WEBSITE,
  owner_email: EMAIL,
  region: REGION,
  version: VERSION,
  rate_limit: RATE_LIMIT,
  status_prefix: true, 
  prefix: ['.', '!', '#'],
  sticker_packname: OWNER_NAME,
  sticker_author: `Date: ${moment
    .tz('Asia/Jakarta')
    .format('DD/MM/YY')}\nYouTube: vitaa Creative\nOwner: 08386877368`,
  mode: MODE,
  commandSimilarity: SIMILARITY,
  anticall: ANTI_CALL,
  autoread: AUTO_READ,
  autobackup: AUTO_BACKUP,
  PresenceUpdate: PRESENCE_UPDATE,
  typewelcome: TYPE_WELCOME,
  bgwelcome2: BG_WELCOME2,
  midnight_restart: MIDNIGHT_RESTART,
  scheduled: STATUS_SCHEDULED,
  PANEL: {
    URL: PANEL_URL,
    KEY_APPLICATION: PANEL_PLTA,
    description: PANEL_DESCRIPTION,
    SERVER_EGG: PANEL_ID_EGG,
    id_location: PANEL_ID_LOCATION,
    default_disk: PANEL_DEFAULT_DISK,
    cpu_default: PANEL_DEFAULT_CPU,
  },
  SPAM: {
    limit: SPAM_LIMIT,
    couldown: SPAM_COULDOWN,
    warning: SPAM_WARNING,
    action: SPAM_ACTION,
  },
  BADWORD: {
    warning: BADWORD_WARNING,
    action: BADWORD_ACTION,
  },
};

export default config;
