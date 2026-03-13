const respondedSenders = new Set();
import { getGreeting } from "../lib/utils.js";

async function process(sock, messageInfo) {
  const { sender, remoteJid, isGroup, message, pushName, fullText } =
    messageInfo;
    
  return true;

  const salam = getGreeting();
  if (isGroup) return true; 
  if (pushName == "Unknown") return true;
  if (!fullText) return true;
  if (["batu", "kertas", "gunting"].includes(fullText.toLowerCase())) return;

  if (remoteJid == "status@broadcast") return true; 
  
  if (respondedSenders.has(sender)) return true;

  const response = `🌟 _*Pesan Otomatis*_ 🌟 

👋 _${salam}_ _Kak_ *${pushName}*, _Nomor ini adalah nomor bot yang tersedia untuk di sewa pada sebuah grub._

⚠️ _Kami sangat melarang jika bot kami digunakan untuk tindak penipuan atau kegiatan ilegal lainnya._
`;

  try {

    await sock.sendMessage(sender, { text: response }, { quoted: message });

    respondedSenders.add(sender);
  } catch (error) {
    console.error("Error in first chat process:", error);
  }

  return true;
}

export default {
  name: "First Chat",
  priority: 10,
  process,
};
