import { incrementUserChatCount } from "../lib/totalchat.js";
import { addChat } from "../lib/chatManager.js";
import { downloadMedia } from "../lib/utils.js";

async function process(sock, messageInfo) {
  const { remoteJid, message, id, sender, isGroup, fullText, type } =
    messageInfo;

  try {
    if (isGroup) {
      await incrementUserChatCount(remoteJid, sender);

      let newMessage;
      if (type === "sticker") {
        const mediaPath = `./tmp/${await downloadMedia(message)}`;
        newMessage = {
          id,
          text: mediaPath,
          type,
        };
      } else if (fullText) {

        newMessage = {
          id,
          text: fullText,
        };
      }

      if (newMessage) {
        addChat(sender, newMessage);
      }
    }
  } catch (error) {
    console.error("Error dalam proses Chat:", error);
  }

  return true; 
}

export default {
  name: "Chat",
  priority: 3,
  process,
};
