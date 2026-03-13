import {
  sendMessageWithMention,
  getCurrentTime,
  getCurrentDate,
  reply,
  getSenderType,
} from "../../lib/utils.js";
import { getGroupMetadata } from "../../lib/cache.js";
import { sendImageAsSticker } from "../../lib/exif.js";
import { checkMessage } from "../../lib/participants.js";
import mess from "../../strings.js";
import config from "../../config.js";
import fs from "fs";

async function handle(sock, messageInfo) {
  const { m, remoteJid, sender, message, isQuoted } = messageInfo;

  try {
    // Mendapatkan metadata grup
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

    // Validasi pesan yang dibalas
    if (!isQuoted) {
      return await reply(m, "⚠️ _Balas sebuah pesanan berupa teks._");
    }

    const first_checksetdone = await checkMessage(remoteJid, "setdone");

    // Mendapatkan tanggal dan waktu saat ini
    const date = getCurrentDate();
    const time = getCurrentTime();

    // Mendapatkan metadata grup
    const groupName = groupMetadata.subject || "Grup";

    // Menyiapkan catatan dari pesan yang dikutip
    const note = isQuoted.content?.caption
      ? isQuoted.content.caption
      : isQuoted.text;

    const quotedSender = `@${isQuoted.sender.split("@")[0]}`;
    const statusJid = getSenderType(isQuoted.sender);

    if (first_checksetdone) {
      // Jika ada setingan set done
      try {
        if (first_checksetdone.endsWith(".webp")) {
          // Kirim sticker
          const buffer = fs.readFileSync(first_checksetdone);

          const options = {
            packname: config.sticker_packname,
            author: config.sticker_author,
          };

          await sendImageAsSticker(sock, remoteJid, buffer, options, message);
          return;
        } else {
          // Ganti placeholder dengan nilai sebenarnya
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
            statusJid
          );
          return;
        }
      } catch (error) {
        console.error("Error processing setdone:", error);
      }
    }

    // Default pesan transaksi berhasil
    const templateMessage = `
╭─𓄴₍ 𝗧𝗥𝗔𝗡𝗦𝗔𝗞𝗦𝗜 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟 ⸧  
││૪ ֪ ֵ 𝗃𝖺𝗆 : ${time}𝗐𝗂𝖻
││૪ ֪ ֵ 𝗍𝖺𝗇𝗀𝗀𝖺𝗅 : ${date}
││૪ ֪ ֵ 𝗀𝗋𝗈𝗎𝗉 : ${groupName}
││૪ ֪ ֵ 𝖼𝖺𝗍𝖺𝗍𝖺𝗇 : ${note}
╰ 𝖺꯭𝖽𝗈꯭𝗋꯭𝖺𝖻𝗅𝖾'𝗌 𝗅𝗈𝗏𝖾

╭ᥴ⃘ 𝗍𝖾𝗋𝗂𝗆𝖺𝗄𝖺𝗌𝗂𝗁 𝗎𝖽𝖺𝗁 𝗈𝗋𝖽𝖾𝗋
╰ᥴ⃘ 𝗓𝗂𝗍𝖺𝖺 𝗌𝗍𝗈𝗋𝖾𝖾
`;

    // Mengirim pesan dengan mention
    await sendMessageWithMention(
      sock,
      remoteJid,
      templateMessage,
      message,
      statusJid
    );
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

export default {
  handle,
  Commands: ["done", "d", "selesai"],
  OnlyPremium: false,
  OnlyOwner: false,
};
