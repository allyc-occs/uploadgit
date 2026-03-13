import "./lib/version.js";
import { checkAndInstallModules, clearDirectory } from "./lib/utils.js";

console.log(`[✔] Start App ...`);

const [major] = process.versions.node.split(".").map(Number);

if (major < 20 || major >= 21) {
  console.error(`❌ Script ini hanya kompatibel dengan Node.js versi 20.x`);
  console.error(
    `ℹ️ Jika kamu menjalankan script ini melalui panel, buka menu *Startup*, lalu ubah *Docker Image* ke versi Node.js 20`
  );

  setTimeout(() => process.exit(1), 60_000);
} else {
  process.env.TZ = "Asia/Jakarta";

  const config = (await import("./config.js")).default;

  const BOT_NUMBER = config.phone_number_bot || "";

  async function reportCrash(status) {

  }

  try {
    clearDirectory("./tmp");

    setInterval(() => {
      console.log("[SCHEDULE] Membersihkan folder tmp...");
      clearDirectory("./tmp");
    }, 3 * 60 * 60 * 1000);

    console.log('[✔] Cache cleaned successfully.');
    
    await checkAndInstallModules([
      "follow-redirects",
      "jimp@1.6.0",
      "qrcode-reader",
      "wa-sticker-formatter",
      "api-autoresbot@1.0.6",
    ]);

    const { start_app } = await import("./lib/startup.js");
    await start_app();
  } catch (err) {
    console.error("Error dalam proses start_app:", err.message);
    await reportCrash("inactive");
    process.exit(1);
  }

  process.on("uncaughtException", async (err) => {
    console.error("❌ Uncaught Exception:", err);
    await reportCrash("inactive");
    process.exit(1);
  });

  process.on("unhandledRejection", async (reason, promise) => {
    console.error("❌ Unhandled Rejection:", reason);
    await reportCrash("inactive");
    process.exit(1);
  });
}
