import AsyncStorage from '@react-native-async-storage/async-storage';

async function put(namespace, key, value) {
  return await AsyncStorage.setItem(`${namespace}:${key}`, JSON.stringify(value));
}

async function remove(namespace, key) {
  return await AsyncStorage.removeItem(`${namespace}:${key}`);
}

async function get(namespace, key) {
  return await AsyncStorage.getItem(`${namespace}:${key}`);
}

async function getAll(namespace) {
  const keys = await AsyncStorage.getAllKeys()
  console.log(keys);
  const strs = await AsyncStorage.multiGet(keys.filter(key => key.startsWith(namespace)))
  console.log(strs);
  return strs.map(str => JSON.parse(str[1]))
}

export default {
    put,
    remove,
    get,
    getAll,
};
    