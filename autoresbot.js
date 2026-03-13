export const commandWithoutRegister = ['list', 'owner', 'menu', 'claim'];

import chokidar from 'chokidar';
import config from './config.js';
const mode = config.mode;

import { findGroup } from './lib/group.js';
import chalk from 'chalk';
import handler from './lib/handler.js';
import mess from './strings.js';
import { updateParticipant } from './lib/cache.js';

import path from 'path';
import { handleActiveFeatures } from './lib/participant_update.js';

import { logWithTime, log, danger, findClosestCommand, logTracking } from './lib/utils.js';

import { isOwner, isPremiumUser, updateUser, findUser, isUserRegistered } from './lib/users.js';

import { reloadPlugins } from './lib/plugins.js';
import { logCustom } from './lib/logger.js';

handler.initHandlers();

const lastMessageTime = {};
const pluginsPath = path.join(process.cwd(), 'plugins');
const lastSent_participantUpdate = {};
let plugins = [];

reloadPlugins()
  .then((loadedPlugins) => {
    plugins = loadedPlugins;
    console.log(`[✔] Load All Plugins done...`);
  })
  .catch((error) => {
    console.error('❌ ERROR: Gagal memuat plugins:', error);
  });

if (mode === 'development') {
  const watcher = chokidar.watch(pluginsPath, {
    persistent: true,
    ignoreInitial: true,
    ignored: /(^|[\/\\])\../, 
  });

  watcher.on('change', (filePath) => {
    if (filePath.endsWith('.js')) {
      logWithTime('System', `File changed: ${filePath}`);

      reloadPlugins()
        .then((loadedPlugins) => {
          plugins = loadedPlugins;
        })
        .catch((error) => {
          console.error('❌ ERROR: Gagal memuat plugins:', error);
        });
    }
  });

  logWithTime('System', 'Hot reload active in development mode.');
} else {
  logWithTime('System', 'Hot reload disabled in production mode.');
}

async function processMessage(sock, messageInfo) {
  const { remoteJid, isGroup, message, sender, pushName, fullText, prefix, command } = messageInfo;

  const isPremiumUsers = isPremiumUser(sender);
  const isOwnerUsers = isOwner(sender);

  try {
    const shouldContinue = await handler.preProcess(sock, messageInfo);
    if (!shouldContinue) return; 

    let truncatedContent = fullText.length > 10 ? fullText.slice(0, 10) + '...' : fullText;

    const currentTime = Date.now();
    if (
      lastMessageTime[remoteJid] &&
      currentTime - lastMessageTime[remoteJid] < config.rate_limit &&
      prefix &&
      !isOwnerUsers
    ) {
      danger(pushName, `Rate limit : ${truncatedContent}`);
      return;
    }
    if (prefix) {
      lastMessageTime[remoteJid] = currentTime;
    }

    if (truncatedContent.trim() && prefix) {

      const logMessage =
        config.mode === 'production'
          ? () => log(pushName, truncatedContent)
          : () => logWithTime('CHAT', `${pushName}(${sender.split('@')[0]}) - ${truncatedContent}`);

      logMessage();
    }

    if (
      (config.bot_destination.toLowerCase() === 'private' && isGroup) ||
      (config.bot_destination.toLowerCase() === 'group' && !isGroup)
    ) {
      if (!isOwnerUsers) {
        logWithTime('SYSTEM', `Destination handle only - ${config.bot_destination} chat`);
        return;
      }
    }

    let commandFound = false;

    for (const plugin of plugins) {
      if (plugin.Commands.includes(command)) {
        commandFound = true;

        if (plugin.OnlyPremium && !isPremiumUsers && !isOwnerUsers) {
          logTracking(`Handler - Bukan premium (${command})`);
          await sock.sendMessage(remoteJid, { text: mess.general.isPremium }, { quoted: message });
          return;
        }

        if (plugin.OnlyOwner && !isOwnerUsers) {
          logTracking(`Handler - Bukan Owner (${command})`);
          await sock.sendMessage(remoteJid, { text: mess.general.isOwner }, { quoted: message });
          return;
        }

        if (!isPremiumUsers && !isOwnerUsers && plugin.limitDeduction) {
          try {
            const dataUsers = await findUser(sender);
            if (!dataUsers) return;

            const [docId, userData] = dataUsers;

            const isLimitExceeded = userData.limit < plugin.limitDeduction || userData.limit < 1;
            if (isLimitExceeded) {
              logTracking('Handler - Limit habis ');
              await sock.sendMessage(remoteJid, { text: mess.general.limit }, { quoted: message });
              return;
            }

            await updateUser(sender, {
              limit: userData.limit - plugin.limitDeduction,
            });
          } catch (error) {
            console.error(`Terjadi kesalahan saat mengurangi limit pengguna: ${error.message}`);
          }
        }

        const pluginResult = await plugin.handle(sock, messageInfo);

        logTracking(`Plugins - ${command} dijalankan oleh ${sender}`);

        if (pluginResult === false) {
          return;
        }
      }
    }

    if (config.commandSimilarity && !commandFound) {
      const closestCommand = findClosestCommand(command, plugins);
      if (closestCommand && command != '' && fullText.length < 20 && prefix) {
        logTracking(`Handler - Command tidak ditemukan (${command})`);
        logCustom(
          'info',
          `_Command *${command}* tidak ditemukan_ \n\n_Apakah maksud Anda *.${closestCommand}*?_`,
          `ERROR-COMMAND-NOT-FOUND.txt`,
        );
        return await sock.sendMessage(
          remoteJid,
          {
            text: `_Command *${command}* tidak ditemukan_ \n\n_Apakah maksud Anda *.${closestCommand}*?_`,
          },
          { quoted: message },
        );
      }
    }
  } catch (error) {
    logCustom('info', error, `ERROR-processMessage.txt`);
    danger(command, `Kesalahan di processMessage: ${error}`);
  }
}

async function participantUpdate(sock, messageInfo) {
  const { id, action, participants } = messageInfo;
  const now = Date.now();

  try {
    const settingGroups = await findGroup(id);
    const validActions = ['promote', 'demote', 'add', 'remove'];

    if (validActions.includes(action)) {
      try {
        updateParticipant(sock, id, participants, action);
      } catch (e) {
        console.log('error updateParticipant ', e);
      }
    } else {
      return console.log('action tidak valid :', action);
    }

    if (settingGroups) {
      if (lastSent_participantUpdate[id]) {
        if (now - lastSent_participantUpdate[id] < config.rate_limit) {
          return console.log(chalk.redBright(`Rate limit : ${id}`));
        }
      }
      lastSent_participantUpdate[id] = now;

      await handleActiveFeatures(sock, messageInfo, settingGroups.fitur);
    }
  } catch (error) {
    logCustom('info', error, `ERROR-participantUpdate.txt`);
    console.error(chalk.redBright(`Error: ${error.message}`));
  }
}

export { processMessage, participantUpdate };
