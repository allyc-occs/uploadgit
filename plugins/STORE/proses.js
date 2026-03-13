import {
  sendMessageWithMention,
  getCurrentTime,
  getCurrentDate,
  reply,
} from "../../lib/utils.js";
import { getGroupMetadata } from "../../lib/cache.js";
import { sendImageAsSticker } from "../../lib/exif.js";
import { checkMessage } from "../../lib/participants.js";
import mess from "../../strings.js";
import config from "../../config.js";
import fs from "fs";

async function handle(sock, messageInfo) {
  const { m, remoteJid, sender, message, isQuoted, senderType } = messageInfo;

  try {

    const groupMetadata = await getGroupMetadata(sock, remoteJid);
    const participants = groupMetadata.participants;
    const isAdmin = participants.some(
      (p) => (p.phoneNumber === sender || p.id === sender) && p.admin
    );
    if (!isAdmin) {
      await sock.sendMessage(
        remoteJid,
        { text: mess.general.isAdmin },
        { quoted: message }
      );
      return;
    }

    if (!isQuoted) {
      return await reply(m, "⚠️ _Balas sebuah pesanan berupa teks._");
    }

    const first_checksetdone = await checkMessage(remoteJid, "setproses");

    const date = getCurrentDate();
    const time = getCurrentTime();

    const groupName = groupMetadata.subject || "Grup";

    const note = isQuoted.content?.caption
      ? isQuoted.content.caption
      : isQuoted.text;

    const quotedSender = `@${isQuoted.sender.split("@")[0]}`;

    if (first_checksetdone) {

      try {
        if (first_checksetdone.endsWith(".webp")) {

          const buffer = fs.readFileSync(first_checksetdone);

          const options = {
            packname: config.sticker_packname,
            author: config.sticker_author,
          };

          await sendImageAsSticker(sock, remoteJid, buffer, options, message);
          return;
        } else {

          const messageSetdone = first_checksetdone
            .replace(/@time/g, time)
            .replace(/@tanggal/g, date)
            .replace(/@grub/g, groupName)
            .replace(/@catatan/g, note)
            .replace(/@sender/g, quotedSender);

          await sendMessageWithMention(
            sock,
            remoteJid,
            messageSetdone,
            message,
            senderType
          );
          return;
        }
      } catch (error) {
        console.error("Error processing setproses:", error);
      }
    }

    const templateMessage = `
╭─𓄴₍ 𝗧𝗥𝗔𝗡𝗦𝗔𝗞𝗦𝗜 𝗣𝗘𝗡𝗗𝗜𝗡𝗚 ⸧  
││૪ ֪ ֵ 𝗃𝖺𝗆 : ${time}𝗐𝗂𝖻
││૪ ֪ ֵ 𝗍𝖺𝗇𝗀𝗀𝖺𝗅 : ${date}
││૪ ֪ ֵ 𝗀𝗋𝗈𝗎𝗉 : ${groupName}
││૪ ֪ ֵ 𝖼𝖺𝗍𝖺𝗍𝖺𝗇 : ${note}
╰╯
╭ׄ⸦͟⸧ 𝖻𝖾𝖺𝗎𝗍𝗂𝖿𝗎𝗅𝗅 𝖼𝗎𝗍𝖾𝖾 ! 
│𐚁ᩣ 𝗍𝖾𝗋𝗂𝗆𝖺𝗄𝖺𝗌𝗂𝗁 𝗎𝖽𝖺𝗁 𝗈𝗋𝖽𝖾𝗋
│𐚁ᩣ 𝗇𝗈𝗈 𝗋𝖾𝖿𝗎𝗇𝖽
│𐚁ᩣ 𝗆𝖺𝗄𝗌𝖺 𝗋𝖾𝖿? 𝗀𝗐 𝗋𝖾𝖿 1𝗄
╰⸦͟⸧
`;

    await sendMessageWithMention(
      sock,
      remoteJid,
      templateMessage,
      message,
      senderType
    );
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

export default {
  handle,
  Commands: ["proses"],
  OnlyPremium: false,
  OnlyOwner: false,
};
