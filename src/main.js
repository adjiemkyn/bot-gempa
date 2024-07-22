import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const token = "6739137283:AAG2O5MY5_4kF155XYHQYanFlsENOVbK6qQ";
const options = {
    polling: true
};

const bot = new TelegramBot(token, options);

const prefix = ".";

const sayHi = new RegExp(`^${prefix}halo$`);
const gempa = new RegExp(`^${prefix}gempa$`);

bot.onText(sayHi, (callback) => {
    bot.sendMessage(callback.from.id, "Halo Juga!");
});

bot.onText(gempa, async (callback) => {
    const data = await fetchBMKGData();
    if (data) {
        const {
            Jam, Magnitude, Tanggal, Wilayah, Potensi, Kedalaman, Shakemap
        } = data;
        const BMKGImage = BMKG_ENDPOINT + Shakemap;
        const resultText = `
        Waktu : ${Tanggal} | ${Jam}
Besaran : ${Magnitude}
Wilayah : ${Wilayah}
Potensi : ${Potensi}
Kedalaman : ${Kedalaman}
`;
        bot.sendPhoto(callback.from.id, BMKGImage, {
            caption: resultText
        });
    }
});
const BMKG_ENDPOINT = "https://data.bmkg.go.id/DataMKG/TEWS/";

let lastGempaData = null;

async function fetchBMKGData() {
    try {
        const apiCall = await fetch(BMKG_ENDPOINT + "autogempa.json");
        const {
            Infogempa: {
                gempa
            }
        } = await apiCall.json();
        return gempa;
    } catch (error) {
        console.error("Error fetching BMKG data:", error);
        return null;
    }
}

async function checkForNewData() {
    const newData = await fetchBMKGData();
    if (newData && JSON.stringify(newData) !== JSON.stringify(lastGempaData)) {
        lastGempaData = newData;
        const {
            Jam, Magnitude, Tanggal, Wilayah, Potensi, Kedalaman, Shakemap
        } = newData;
        const BMKGImage = BMKG_ENDPOINT + Shakemap;
        const resultText = `
Waktu : ${Tanggal} | ${Jam}
Besaran : ${Magnitude}
Wilayah : ${Wilayah}
Potensi : ${Potensi}
Kedalaman : ${Kedalaman}
`;
        // Ganti dengan ID chat yang sesuai
        const chatId = "CHAT_ID_YANG_SESUAI";
        bot.sendPhoto(chatId, BMKGImage, {
            caption: resultText
        });
    }
}
// Interval untuk memeriksa data baru setiap 5 menit (300000 milidetik)
setInterval(checkForNewData, 300000);

