import { Buffer } from 'buffer';
import { Platform } from 'react-native';

const DISCOVERY_PORT = 41234;
const PROTOCOL_VERSION = 1;
const PEER_TTL_MS = 9000;
const BROADCAST_MS = 2500;
const PRUNE_MS = 3000;

let dgram = null;
let TcpSocket = null;
let nativeChecked = false;
let nativeAvailable = false;

let udpSocket = null;
let tcpServer = null;
let tcpPort = null;
let localProfile = null;
let handlers = {};
let peers = new Map();
let broadcastTimer = null;
let pruneTimer = null;
let active = false;
let gameSocket = null;
let gameSession = null;
let gameBuffer = '';
let moveListeners = new Set();
let startListeners = new Set();
let peerListeners = new Set();

function ensureNativeModules() {
  if (nativeChecked) return nativeAvailable;
  nativeChecked = true;
  try {
    dgram = require('react-native-udp');
    TcpSocket = require('react-native-tcp-socket');
    nativeAvailable = Boolean(dgram?.createSocket && TcpSocket?.createServer);
  } catch {
    nativeAvailable = false;
  }
  return nativeAvailable;
}

function pickTcpPort() {
  return 42000 + Math.floor(Math.random() * 1000);
}

function listPeers() {
  if (!localProfile) return [];
  return Array.from(peers.values()).filter((p) => p.userId !== localProfile.userId);
}

function notifyPeers() {
  const list = listPeers();
  handlers.onPeers?.(list);
  peerListeners.forEach((fn) => fn(list));
}

function upsertPeer(payload, host) {
  if (!payload?.userId || payload.userId === localProfile?.userId) return;
  if (payload.v !== PROTOCOL_VERSION || payload.type !== 'presence') return;

  peers.set(payload.userId, {
    userId: payload.userId,
    username: payload.username || 'Player',
    p2pCode: payload.p2pCode || '------',
    host,
    port: payload.tcpPort,
    lastSeen: Date.now(),
  });
  notifyPeers();
}

function prunePeers() {
  const cutoff = Date.now() - PEER_TTL_MS;
  let changed = false;
  for (const [id, peer] of peers.entries()) {
    if (peer.lastSeen < cutoff) {
      peers.delete(id);
      changed = true;
    }
  }
  if (changed) notifyPeers();
}

function broadcastPresence() {
  if (!udpSocket || !localProfile || !tcpPort) return;

  const payload = Buffer.from(
    JSON.stringify({
      v: PROTOCOL_VERSION,
      type: 'presence',
      userId: localProfile.userId,
      username: localProfile.username,
      p2pCode: localProfile.p2pCode,
      tcpPort,
      ts: Date.now(),
    })
  );

  udpSocket.send(
    payload,
    0,
    payload.length,
    DISCOVERY_PORT,
    '255.255.255.255',
    () => {}
  );
}

function attachGameSocket(socket) {
  gameSocket = socket;
  gameBuffer = '';
  socket.on('data', (data) => {
    gameBuffer += data.toString();
    const parts = gameBuffer.split('\n');
    gameBuffer = parts.pop() || '';
    parts.forEach((line) => {
      if (!line.trim()) return;
      let msg;
      try {
        msg = JSON.parse(line.trim());
      } catch {
        return;
      }
      if (msg.type === 'game_move') {
        moveListeners.forEach((fn) => fn(msg.payload));
        handlers.onGameMove?.(msg.payload);
      }
      if (msg.type === 'game_state') {
        handlers.onGameState?.(msg.payload);
      }
    });
  });
  socket.on('close', () => {
    if (gameSocket === socket) {
      gameSocket = null;
      gameSession = null;
      handlers.onGameEnd?.();
    }
  });
}

function handleTcpLine(line, socket) {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return;
  }

  if (msg.type === 'invite') {
    handlers.onInvite?.({
      fromUserId: msg.fromUserId,
      fromUsername: msg.fromUsername,
      fromP2pCode: msg.fromP2pCode,
      gameId: msg.gameId,
      sessionId: msg.sessionId,
      host: msg.host,
      port: msg.port,
    });
    socket.write(`${JSON.stringify({ type: 'ack' })}\n`);
    return;
  }

  if (msg.type === 'invite_accept') {
    attachGameSocket(socket);
    gameSession = msg;
    handlers.onGameStart?.({
      sessionId: msg.sessionId,
      gameId: msg.gameId,
      role: 'host',
      opponent: {
        userId: msg.userId,
        username: msg.username,
      },
    });
    startListeners.forEach((fn) =>
      fn({
        sessionId: msg.sessionId,
        gameId: msg.gameId,
        role: 'host',
        opponent: { userId: msg.userId, username: msg.username },
      })
    );
  }
}

function startTcpServer() {
  return new Promise((resolve, reject) => {
    tcpPort = pickTcpPort();
    tcpServer = TcpSocket.createServer((socket) => {
      let buffer = '';
      socket.on('data', (data) => {
        buffer += data.toString();
        const parts = buffer.split('\n');
        buffer = parts.pop() || '';
        parts.forEach((line) => {
          if (line.trim()) handleTcpLine(line.trim(), socket);
        });
      });
    });

    tcpServer.on('error', (err) => {
      handlers.onError?.(friendlyError());
      reject(err);
    });

    tcpServer.listen({ port: tcpPort, host: '0.0.0.0', reuseAddress: true }, () => {
      resolve();
    });
  });
}

function startUdpDiscovery() {
  return new Promise((resolve, reject) => {
    udpSocket = dgram.createSocket({ type: 'udp4', reusePort: true });

    udpSocket.on('error', () => {
      handlers.onError?.(friendlyError());
      reject(new Error('udp error'));
    });

    udpSocket.on('message', (msg, rinfo) => {
      try {
        const payload = JSON.parse(msg.toString());
        upsertPeer(payload, rinfo.address);
      } catch {
        /* ignore malformed packets */
      }
    });

    udpSocket.on('listening', () => {
      try {
        udpSocket.setBroadcast(true);
      } catch {
        /* some platforms omit setBroadcast */
      }
      resolve();
    });

    udpSocket.bind(DISCOVERY_PORT);
  });
}

function friendlyError() {
  return "Can't find players on this Wi‑Fi. Make sure you're on the same network.";
}

export function isLanPeerAvailable() {
  return ensureNativeModules();
}

export function isLanPeerActive() {
  return active;
}

export async function startLanPeer(profile, nextHandlers = {}) {
  stopLanPeer();

  if (!ensureNativeModules()) {
    nextHandlers.onUnavailable?.();
    return false;
  }

  if (!profile?.userId || !profile?.username) {
    nextHandlers.onError?.(friendlyError());
    return false;
  }

  localProfile = profile;
  handlers = nextHandlers;
  peers = new Map();
  active = true;

  try {
    nextHandlers.onConnecting?.();
    await startTcpServer();
    await startUdpDiscovery();
    broadcastPresence();
    broadcastTimer = setInterval(broadcastPresence, BROADCAST_MS);
    pruneTimer = setInterval(prunePeers, PRUNE_MS);
    nextHandlers.onReady?.();
    notifyPeers();
    return true;
  } catch {
    stopLanPeer();
    nextHandlers.onError?.(friendlyError());
    return false;
  }
}

export function stopLanPeer() {
  active = false;
  if (broadcastTimer) clearInterval(broadcastTimer);
  if (pruneTimer) clearInterval(pruneTimer);
  broadcastTimer = null;
  pruneTimer = null;

  if (udpSocket) {
    try {
      udpSocket.close();
    } catch {
      /* ignore */
    }
    udpSocket = null;
  }

  if (tcpServer) {
    try {
      tcpServer.close();
    } catch {
      /* ignore */
    }
    tcpServer = null;
  }

  tcpPort = null;
  peers = new Map();
  localProfile = null;
  handlers = {};
  if (gameSocket) {
    try {
      gameSocket.destroy();
    } catch {
      /* ignore */
    }
  }
  gameSocket = null;
  gameSession = null;
  gameBuffer = '';
}

export function invitePeer(target, gameId = 'p2p', sessionId = null) {
  if (!ensureNativeModules() || !localProfile || !target?.host || !target?.port) {
    return Promise.resolve(false);
  }

  const sid = sessionId || `sess_${Date.now().toString(36)}`;

  return new Promise((resolve) => {
    const client = TcpSocket.createConnection(
      { port: target.port, host: target.host },
      () => {
        client.write(
          `${JSON.stringify({
            type: 'invite',
            fromUserId: localProfile.userId,
            fromUsername: localProfile.username,
            fromP2pCode: localProfile.p2pCode,
            gameId,
            sessionId: sid,
            host: target.host,
            port: tcpPort,
          })}\n`
        );
      }
    );

    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      try {
        client.destroy();
      } catch {
        /* ignore */
      }
      resolve(ok ? sid : false);
    };

    client.on('data', () => finish(true));
    client.on('error', () => finish(false));
    setTimeout(() => finish(false), 5000);
  });
}

export function acceptGameInvite(invite, profile, hostPeer) {
  if (!ensureNativeModules() || !hostPeer?.host || !hostPeer?.port) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const socket = TcpSocket.createConnection(
      { port: hostPeer.port, host: hostPeer.host },
      () => {
        attachGameSocket(socket);
        gameSession = { sessionId: invite.sessionId, gameId: invite.gameId };
        socket.write(
          `${JSON.stringify({
            type: 'invite_accept',
            sessionId: invite.sessionId,
            gameId: invite.gameId,
            userId: profile.userId,
            username: profile.username,
          })}\n`
        );
        handlers.onGameStart?.({
          sessionId: invite.sessionId,
          gameId: invite.gameId,
          role: 'guest',
          opponent: {
            userId: invite.fromUserId,
            username: invite.fromUsername,
          },
        });
        startListeners.forEach((fn) =>
          fn({
            sessionId: invite.sessionId,
            gameId: invite.gameId,
            role: 'guest',
            opponent: { userId: invite.fromUserId, username: invite.fromUsername },
          })
        );
        resolve(true);
      }
    );

    socket.on('error', () => resolve(false));
    setTimeout(() => resolve(false), 8000);
  });
}

export function sendGameMove(payload) {
  if (!gameSocket) return false;
  try {
    gameSocket.write(`${JSON.stringify({ type: 'game_move', payload })}\n`);
    return true;
  } catch {
    return false;
  }
}

export function sendGameState(payload) {
  if (!gameSocket) return false;
  try {
    gameSocket.write(`${JSON.stringify({ type: 'game_state', payload })}\n`);
    return true;
  } catch {
    return false;
  }
}

export function endGameSession() {
  if (gameSocket) {
    try {
      gameSocket.destroy();
    } catch {
      /* ignore */
    }
  }
  gameSocket = null;
  gameSession = null;
  gameBuffer = '';
}

export function onPeers(fn) {
  peerListeners.add(fn);
  if (active) fn(listPeers());
  return () => peerListeners.delete(fn);
}

export function onGameMove(fn) {
  moveListeners.add(fn);
  return () => moveListeners.delete(fn);
}

export function onGameStart(fn) {
  startListeners.add(fn);
  return () => startListeners.delete(fn);
}

export function getGameSession() {
  return gameSession;
}

export function getLanPeerHint() {
  if (!ensureNativeModules()) {
    return 'Nearby play needs a development build (expo run:android or expo run:ios). Expo Go cannot use direct Wi‑Fi discovery.';
  }
  if (Platform.OS === 'android') {
    return 'Phones must be on the same Wi‑Fi. No laptop or server required.';
  }
  return 'Phones must be on the same Wi‑Fi. Allow local network access when prompted.';
}
