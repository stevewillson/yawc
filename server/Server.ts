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
  broadcastUser(user) {
    // loop over the clients
    this.clients.values().forEach((client) => client.sendUser(user));
  }

  broadcastUserLogout(userId) {
    this.clients.values().forEach((client) => client.sendUserLogout(userId));
  }

  broadcastRoom(room) {
    this.clients.values().forEach((client) => client.sendRoom(room));
  }

  broadcastJoinRoom(roomId, userId, slot, teamId) {
    this.clients.values().forEach((client) =>
      client.sendJoinRoom(roomId, userId, slot, teamId)
    );
  }

  broadcastLeaveRoom(roomId, username) {
    this.clients.values().forEach((client) =>
      client.sendLeaveRoom(roomId, username)
    );
  }

  broadcastRoomStatusChange(roomId, status, countdown) {
    this.clients.values().forEach((client) =>
      client.sendRoomStatusChange(roomId, status, countdown)
    );
  }

  broadcastTeamChange(room, slot, teamId) {
    room.users.forEach((user) => {
      if (user != null) {
        user.client.sendteamChange(slot, teamId);
      }
    });
  }

  broadcastGameStart(room) {
    room.users.forEach((user) => {
      if (user != null) {
        user.client.sendGameStart(room);
      }
    });
  }

  broadcastPowerup(room, powerupType, toSlot, b1, gameSession, b2) {
    room.users.forEach((user) => {
      if (user != null) {
        user.client.sendPowerup(powerupType, toSlot, b1, gameSession, b2);
      }
    });
  }

  broadcastUserState(
    room,
    gameSession,
    slot,
    healthPerc,
    powerups,
    shipType,
  ) {
    room.users.forEach((user) => {
      if (user != null) {
        user.client.sendUserState(
          gameSession,
          slot,
          healthPerc,
          powerups,
          shipType,
        );
      }
    });
  }

  broadcastUserEvent(room, gameSession, eventString) {
    room.users.forEach((user) => {
      if (user != null) {
        user.client.sendUserEvent(gameSession, eventString);
      }
    });
  }

  broadcastGameOver(room, gameSession, deceasedSlot, killerSlot) {
    room.users.forEach((user) => {
      if (user != null) {
        user.client.sendGameOver(gameSession, deceasedSlot, killerSlot);
      }
    });
  }

  broadcastGameEnd(room) {
    room.users.forEach((user) => {
      if (user != null) {
        user.client.sendGameEnd(room);
      }
    });
  }

  broadcastLobbyMessage(username, message) {
    this.clients.values().forEach((client) => {
      client.sendLobbyMessage(username, message);
    });
  }

  broadcastRoomMessage(room, username, message) {
    room.users.forEach((user) => {
      if (user != "Open Slot") {
        user.client.sendRoomMessage(username, message);
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
