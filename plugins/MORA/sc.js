import { reply } from "../../lib/utils.js";
import config from "../../config.js";

async function handle(sock, messageInfo) {
  const { m } = messageInfo;

  const text = `kamu nyari sc? coba tanya chat admin yaw!!`;

  await reply(m, text);
}

export default {
  handle,
  Commands: ["sc", "script"],
  OnlyPremium: false,
  OnlyOwner: false,
};
