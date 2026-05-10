const KEYS = {
  users: "users:v1",
  session: "session:v1"
};

function safeGet(key, fallback) {
  try {
    const v = wx.getStorageSync(key);
    return v === "" || v === undefined ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (e) {
    return false;
  }
}

function hashPassword(pw) {
  // Demo 用：非加密学安全；只是避免明文直接存储
  let h = 2166136261;
  for (let i = 0; i < pw.length; i++) {
    h ^= pw.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(16);
}

function loadUsers() {
  return safeGet(KEYS.users, {});
}

function saveUsers(users) {
  return safeSet(KEYS.users, users);
}

function getSession() {
  return safeGet(KEYS.session, null);
}

function setSession(session) {
  return safeSet(KEYS.session, session);
}

function clearSession() {
  try {
    wx.removeStorageSync(KEYS.session);
  } catch (e) {}
}

function todosKey(nickname) {
  return `todos:v1:${nickname}`;
}

function loadTodos(nickname) {
  return safeGet(todosKey(nickname), []);
}

function saveTodos(nickname, todos) {
  return safeSet(todosKey(nickname), todos);
}

module.exports = {
  hashPassword,
  loadUsers,
  saveUsers,
  getSession,
  setSession,
  clearSession,
  loadTodos,
  saveTodos
};

