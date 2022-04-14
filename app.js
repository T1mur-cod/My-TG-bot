const TelegApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options');

const token = '5318716480:AAH8Rda03oNpU6H4wJmy4vZnH4KvYbLmjJI';

const bot = new TelegApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Я загадываю цифру от 0 до 9, а ты должен угадать');
  const randomNumbers = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumbers;
  await bot.sendMessage(chatId, 'Отгадывай!', gameOptions);
};

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начальное приветсвие' },
    { command: '/info', description: 'Информация о Вас' },
    { command: '/game', description: 'Давай сыграем' },
  ]);

  bot.on('message', async (msg) => {
    // console.log(msg);
    const { text } = msg;
    const chatId = msg.chat.id;

    const words = ['красивое имя', 'отвратительное имя', 'обычное имя', 'могли бы назвать получше', 'имя кайф', 'я так свое хомяка назову'];
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

    return bot.sendMessage(chatId, `https://tlgrm.ru/_/stickers/80a/5c9/80a5c9f6-a40e-47c6-acc1-44f43acc0862/2.jpg\ 
                                     \n Я знаю только специальные команды...`);
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

    console.log(msg);
  });
};

start();
