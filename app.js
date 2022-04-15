require('dotenv').config();
const TelegApi = require('node-telegram-bot-api');
const fetch = require('node-fetch');

const { gameOptions, againOptions } = require('./options');

const token = process.env.DB_TOKEN;

const bot = new TelegApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Я загадываю цифру от 0 до 9, а ты должен угадать');
  const randomNumbers = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumbers;
  await bot.sendMessage(chatId, 'Отгадывай!', gameOptions);
};

const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com',
    'X-RapidAPI-Key': '8ed2e4bef7msh0ef1e4fb20f433cp1386b1jsn4f55d0f27aa4',
  },
};

async function freeGame(chatId) {
  const game = await fetch('https://free-to-play-games-database.p.rapidapi.com/api/games', options);
  if (game.ok) {
    const result = await game.json();
    // const gameFilter = result.filter((item) => item.genre === chatId.data);
    function randomInteger(min, max) {
      const rand = min - 0.5 + Math.random() * (max - min + 1);
      return Math.round(rand);
    }
    const randGame = randomInteger(0, result.length);
    const newFreeGame = result[randGame];
    console.log('====>', newFreeGame);
    const freegame = newFreeGame
    const view = `
    Title: ${freegame.title}
    ${freegame.thumbnail}
     ${freegame.short_description} 
     ${freegame.game_url} ${freegame.short_genre} ${freegame.platform} ${freegame.platform} ${freegame.publisher} 
    Release:${freegame.release_date} ${freegame.freetogame_profile_url}`;
    bot.sendMessage(chatId, JSON.stringify(view));
  } else {
    console.log(err);
  }
}

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начальное приветсвие' },
    { command: '/info', description: 'Информация о Вас' },
    { command: '/game', description: 'Давай сыграем' },
    { command: '/free_game', description: 'Посмотри:' },
  ]);

  bot.on('message', async (msg) => {
    // console.log(msg);
    const { text } = msg;
    const chatId = msg.chat.id;

    const words = ['красивое имя', 'отвратительное имя', 'обычное имя', 'могли бы назвать получше', 'имя кайф', 'я так своего хомяка назову'];
    const randomWords = Math.floor(Math.random() * words.length);

    if (text === '/start') {
      return bot.sendMessage(chatId, 'Привет, это телеграм-бот. Нажми на /info');
    }
    if (text === '/info') {
      return bot.sendMessage(chatId, `Вас зовут ${msg.chat.first_name}, ${words[randomWords]}`);
    }
    if (text === '/game') {
      return startGame(chatId);
    }
    if (text === '/free_game') {
      return freeGame(chatId);
    }

    return bot.sendMessage(chatId, `https://tlgrm.ru/_/stickers/80a/5c9/80a5c9f6-a40e-47c6-acc1-44f43acc0862/2.jpg\ 
                                     \n Я знаю только специальные команды...`);
  });

  bot.on('callback_query', (msg) => {
    const { data } = msg;
    const chatId = msg.message.chat.id;

    if (options === '/free_game') {
      return freeGame(chatId);
    }
    if (data === options[chatId]) {
      return bot.sendMessage(chatId, `${options[chatId]}`);
    }
  });

  bot.on('callback_query', (msg) => {
    const { data } = msg;
    const chatId = msg.message.chat.id;
    if (data === '/again') {
      return startGame(chatId);
    }
    if (data == chats[chatId]) {
      return bot.sendMessage(chatId, `Поздравляю! Ты отгадал(а)! Я действительно загадал: ${chats[chatId]}`, againOptions);
    }
    return bot.sendMessage(chatId, `Ты не отгадал(а)! ХА-ХА! Моё число: ${chats[chatId]}`, againOptions);
  });
};

start();
