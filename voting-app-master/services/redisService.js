const { createClient } = require('redis');
const config = require('../config/config');

const redisUrl = config.REDIS_URL || 'redis://localhost:6379';
const client = createClient({
  url: redisUrl,
});

let connected = false;

// Connect Redis
(async () => {
  try {
    await client.connect();
    connected = true;
    console.log('✅ Connected to Redis');
  } catch (err) {
    console.error('❌ Redis connection error:', err.message);
  }
})();

// Event Handlers
client.on('error', (err) => {
  connected = false;
  console.error('❌ Redis error:', err.message);
});

client.on('end', () => {
  connected = false;
  console.warn('⚠️ Redis disconnected');
});

client.on('reconnecting', () => {
  console.log('🔁 Reconnecting to Redis...');
});

client.on('connect', () => {
  connected = true;
  console.log('🔌 Redis reconnected');
});

// Safe Redis Methods
const get = async (key) => {
  if (!connected) {
    console.warn(`⚠️ Cannot GET "${key}". Redis not connected.`);
    return null;
  }
  try {
    return await client.get(key);
  } catch (err) {
    console.error(`❌ Redis GET error for "${key}":`, err.message);
    return null;
  }
};

const set = async (key, value, mode = 'EX', duration = 300) => {
  if (!connected) {
    console.warn(`⚠️ Cannot SET "${key}". Redis not connected.`);
    return;
  }
  try {
    await client.set(key, value, { [mode]: duration });
  } catch (err) {
    console.error(`❌ Redis SET error for "${key}":`, err.message);
  }
};

const del = async (key) => {
  if (!connected) {
    console.warn(`⚠️ Cannot DEL "${key}". Redis not connected.`);
    return;
  }
  try {
    await client.del(key);
  } catch (err) {
    console.error(`❌ Redis DEL error for "${key}":`, err.message);
  }
};

module.exports = {
  get,
  set,
  del,
  client,
};
