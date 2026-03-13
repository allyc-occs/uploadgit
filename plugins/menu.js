// handle/menu.js
import menuProxy, { loadMenuOnce } from "../database/menu.js";
import config from "../config.js";
import { readFileAsBuffer } from "../lib/fileHelper.js";
import { reply, getCurrentDate, readMore } from "../lib/utils.js";
import { isOwner, isPremiumUser } from "../lib/users.js";
import fs from "fs/promises";
import path from "path";

// konstanta
const linkGroup = "https://whatsapp.com/channel/0029Vb7RdjHCBtxFJ1M6Tz32";
const AUDIO_MENU = false;
const soundPagi = "pagi.opus";
const soundSiang = "siang.opus";
const soundSore = "sore.opus";
const soundPetang = "petang.opus";
const soundMalam = "malam.opus";

async function getGreeting() {
  const now = new Date();
  const wibHours = (now.getUTCHours() + 7) % 24;

  let fileName;
  if (wibHours >= 5 && wibHours <= 10) fileName = soundPagi;
  else if (wibHours >= 11 && wibHours < 15) fileName = soundSiang;
  else if (wibHours >= 15 && wibHours <= 18) fileName = soundSore;
  else if (wibHours > 18 && wibHours <= 19) fileName = soundPetang;
  else fileName = soundMalam;

  try {
    return await fs.readFile(
      path.join(process.cwd(), "database", "audio", fileName)
    );
  } catch (err) {
    console.error("Error reading audio file:", err);
    return null;
  }
}

// Fungsi sederhana hitung mundur lebaran
function getIdulFitriCountdown() {
  const today = new Date();
  // Estimasi Idul Fitri 2026 jatuh pada 20 Maret 2026
  const lebaran = new Date("2026-03-20"); 
  const diff = lebaran - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) return `${days} Hari Lagi 🕌`;
  if (days === 0) return "Selamat Idul Fitri! 🎉";
  return "Sudah Lewat";
}

const formatMenu = (title, items) => {
  const formattedItems = items.map((item) => {
    if (typeof item === "string") return `│ꕤ ${item}`;
    if (typeof item === "object" && item.command && item.description)
      return `│ꕤ ${item.command} ${item.description}`;
    return "│ꕤ [Invalid item]";
  }).join("\n"); 

  return `╭──𖥔 ꒰ *${title}* ꒱\n${formattedItems}\n╰──────𖥔`; 
};

async function handle(sock, messageInfo) {
  const { m, remoteJid, pushName, sender, content, command, message } =
    messageInfo;

  const roleUser = isOwner(sender) ? "Owner" : isPremiumUser(sender) ? "Premium" : "user";
  const date = getCurrentDate();
  const category = (content || "").toLowerCase();
  const menuData = await loadMenuOnce();
  const idulFitri = getIdulFitriCountdown(); // Ambil data hitung mundur

  let response;
  let result;

  if (category && menuData[category]) {
    response = formatMenu(category, menuData[category]); 
    result = await reply(m, response); 
  } else if (command === "menu") {
    response = `
⢀⣀⠀⠀⠀⢀⡶⢶⡄⠀⠀⠀⣀⡀
⢿⣩⡇⠀⠀⢈⡿⢿⡁⠀⠀⢸⣍⡿
⠀⢿⠛⠶⠶⠛⠁⠈⠛⠶⠶⠛⡿⠀
    . halo semuaa!
⠀⠘⣧⣀⣀⣀⣀⣀⣀⣀⣀⣼⠃⠀
                          ⋱ hi beautifull  ⋰
⠀⠀⠿⠶⠶⠶⠶⠶⠶⠶⠶⠿⠀⠀ + ࣪ ˖
— im 𝖾𝗅𝖺𝗂𝗇𝖺 - 𝖻𝗈𝗍 beautifull
ada bisa bantu kak?
⌕ beautifull ><  
╰‣ silahkan ketik .allmenu          
 ╭╮
${Object.keys(menuData)
  .map((key) => ` ││૪ ${key}`)
  .join("\n")}
 ╰╯
`;
    result = await reply(m, response); 
  } else if (command === "allmenu") {
    // Menambahkan info Idul Fitri di sini
    response = `
 
╭───𓄯 ꣖ 𝖨𝖭𝖥𝖮 𝖡𝖮𝖳 ꣓
│𑣿 nama : *${pushName || "Unknown"}*
│𑣿 version : *1.0.0*
│𑣿 date : *${date}*
│𑣿 type : *case/plugins*
│𑣿 idul fitri : *${idulFitri}*
╰────────────𓄯

${Object.keys(menuData)
  .map((key) => formatMenu(key, menuData[key])) 
  .join("\n\n")}`;

    const buffer = await readFileAsBuffer("@assets/allmenu.jpg");

    result = await sock.sendMessage(
      remoteJid,
      {
        text: response, 
        contextInfo: {
          externalAdReply: {
            showAdAttribution: false,
            title: `𝖾𝗅𝖺𝗂𝗇𝖺 - 𝗆𝖽`,
            body: ``,
            thumbnail: buffer,
            jpegThumbnail: buffer,
            thumbnailUrl: linkGroup,
            sourceUrl: linkGroup,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: message }
    );
  }

  if (command === "allmenu" || (command === "menu" && !category)) {
    if (AUDIO_MENU) {
      const audioBuffer = await getGreeting();
      if (audioBuffer) {
        await sock.sendMessage(
          remoteJid,
          { audio: audioBuffer, mimetype: "audio/mp4", ptt: true, },
          { quoted: result }
        );
      }
    }
  }
}

export default {
  Commands: ["menu", "allmenu"],
  OnlyPremium: false,
  OnlyOwner: false,
  handle,
};