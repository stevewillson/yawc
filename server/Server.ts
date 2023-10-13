import { ServerThread } from "./ServerThread.ts";
import { ServerUserManager } from "./ServerUserManager.ts";
import { ServerRoomManager } from "./ServerRoomManager.ts";

export class Server {
  PORT;
  clients;
  userManager;
  roomManager;

  constructor(serverPort = 6049) {
    // change to a map, user the userId as the key and then the client
    // as the value
    this.clients = new Map();
    this.userManager = new ServerUserManager(this);
    this.roomManager = new ServerRoomManager(this);
    this.PORT = serverPort;

    Deno.serve({
      port: this.PORT,
      hostname: "0.0.0.0",
      handler: this.process.bind(this),
      onListen({ hostname, port }) {
        console.log(`Server started at http://${hostname}:${port}`);
      },
      // TODO - implement onError
    });
  }

  // process WebSocket requests and start a client connection
  process(req: Request) {
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }
    const { socket: ws, response } = Deno.upgradeWebSocket(req);

    // add a client
    let client = new ServerThread(this, ws);

    // add client to a Set of clients using the clientId as the key
    this.clients.set(client.clientId, client);
    return response;
  }

  // send a message to all clients with the user's information
  broadcastUser(userId) {
    const user = this.userManager.users.get(userId);
    // send the user info to all connected clients
    this.clients.values().forEach((client) => client.sendUserInfo(user));
  }

  broadcastUserLogout(userId) {
    this.clients.values().forEach((client) => client.sendUserLogout(userId));
  }

  broadcastRoom(roomId) {
    const room = this.roomManager.rooms.get(roomId);
    this.clients.values().forEach((client) => client.sendRoom(room));
  }

  broadcastJoinRoom(roomId, userId, slot, shipType, teamId) {
    this.clients.values().forEach((client) =>
      client.sendJoinRoom(roomId, userId, slot, shipType, teamId)
    );
  }

  broadcastLeaveRoom(userId) {
    this.clients.values().forEach((client) => client.sendLeaveRoom(userId));
  }

  broadcastRoomStatusChange(roomId, status, countdown) {
    this.clients.values().forEach((client) =>
      client.sendRoomStatusChange(roomId, status, countdown)
    );
  }

  // TODO - check that the client sends the correct information
  broadcastTeamChange(roomId, slot, teamId) {
    // only send to the users in the room
    const room = this.roomManager.rooms.get(roomId);
    room.userIds.forEach((userId) => {
      const user = this.userManager.users.get(userId);
      if (user != null) {
        const client = this.clients.get(user.clientId);
        client.sendteamChange(slot, teamId);
      }
    });
  }

  broadcastGameStart(roomId) {
    const room = this.roomManager.rooms.get(roomId);

    room.userIds.forEach((userId) => {
      if (userId != null) {
        const user = this.userManager.users.get(userId);
        const client = this.clients.get(user.clientId);
        client.sendGameStart(roomId);
      }
    });
  }

  // b2 is set to 0
  broadcastPowerup(roomId, powerupType, fromUserId, toUserId, sessionId, b2) {
    const room = this.roomManager.rooms.get(roomId);
    room.userIds.forEach((userId) => {
      if (userId != null) {
        const user = this.userManager.users.get(userId);
        const client = this.clients.get(user.clientId);
        client.sendPowerup(powerupType, fromUserId, toUserId, sessionId, b2);
      }
    });
  }

  broadcastUserState(
    roomId,
    userStateId,
    // gameSession,
    slot,
    healthPercent,
    powerups,
    shipType,
  ) {
    const room = this.roomManager.rooms.get(roomId);
    room.userIds.forEach((userId) => {
      if (userId != null) {
        const user = this.userManager.users.get(userId);
        const client = this.clients.get(user.clientId);
        client.sendUserState(
          userStateId,
          // gameSession,
          slot,
          healthPercent,
          powerups,
          shipType,
        );
      }
    });
  }

  broadcastUserEvent(roomId, gameSession, eventString) {
    const room = this.roomManager.rooms.get(roomId);
    room.userIds.forEach((userId) => {
      if (userId != null) {
        const user = this.userManager.users.get(userId);
        const client = this.clients.get(user.clientId);
        client.sendUserEvent(gameSession, eventString);
      }
    });
  }

  broadcastGameOver(roomId, gameSession, deceasedSlot, killerSlot) {
    const room = this.roomManager.rooms.get(roomId);
    room.userIds.forEach((userId) => {
      if (userId != null) {
        const user = this.userManager.users.get(userId);
        const client = this.clients.get(user.clientId);
        client.sendGameOver(gameSession, deceasedSlot, killerSlot);
      }
    });
  }

  broadcastGameEnd(roomId) {
    const room = this.roomManager.rooms.get(roomId);
    room.userIds.forEach((userId) => {
      if (userId != null) {
        const user = this.userManager.users.get(userId);
        const client = this.clients.get(user.clientId);
        client.sendGameEnd(room);
      }
    });
  }

  broadcastLobbyMessage(username, message) {
    this.clients.values().forEach((client) => {
      client.sendLobbyMessage(username, message);
    });
  }

  broadcastRoomMessage(roomId, username, message) {
    const room = this.roomManager.rooms.get(roomId);
    room.userIds.forEach((userId) => {
      if (userId != null) {
        const user = this.userManager.users.get(userId);
        const client = this.clients.get(user.clientId);
        client.sendRoomMessage(username, message);
      }
    });
  }

  broadcastPrivateMessage(fromUser, toUser, message) {
    this.clients.values().forEach((client) => {
      if (client.user.username == toUser || client.user.username == fromUser) {
        client.sendPrivateMessage(fromUser, toUser, message);
      }
    });
  }
}
