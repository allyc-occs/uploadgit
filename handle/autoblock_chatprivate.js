const respondedSenders = new Set();

async function process(sock, messageInfo) {
  const { sender, remoteJid, isGroup } = messageInfo;

  return true;

  if (isGroup) return true; 
  if (remoteJid == "status@broadcast") return true; 

  if (respondedSenders.has(sender)) return true;

  try {

    await sock.updateBlockStatus(sender, "block");

    respondedSenders.add(sender);
  } catch (error) {
    console.error("Error in block user:", error);
  }
  return true;
}
export default {
  name: "Autoblock Chat Pribadi",
  priority: 10,
  process,
};
