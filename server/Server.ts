import { ServerThread } from "./ServerThread.ts";
import { ServerUserManager } from "./ServerUserManager.ts";
import { ServerRoomManager } from "./ServerRoomManager.ts";

export class Server {
  PORT;
  clients;
  userManager;
  roomManager;

  constructor(serverPort = 6049) {
    this.clients = new Set();
    this.userManager = new ServerUserManager();
    this.roomManager = new ServerRoomManager();
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

    // add client to a Set of clients
    this.clients.add(client);
    return response;
  }

  // send a message to all users
  broadcastUser(user) {
    // loop over the clients
    this.clients.forEach((client) => client.sendUser(user));
  }

  broadcastUserLogout(user) {
    this.clients.forEach((client) => client.sendUserLogout(user));
  }

  broadcastCreateRoom(room) {
    this.clients.forEach((client) => client.sendFullRoom(room));
  }

  broadcastJoinRoom(room, username, slot, teamId) {
    this.clients.forEach((client) =>
      client.sendJoinRoom(room, username, slot, teamId)
    );
  }

  broadcastLeaveRoom(roomId, username) {
    this.clients.forEach((client) => client.sendLeaveRoom(roomId, username));
  }

  broadcastRoomStatusChange(roomId, status, countdown) {
    this.clients.forEach((client) =>
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

  broadcastPlayerState(
    room,
    gameSession,
    slot,
    healthPerc,
    powerups,
    shipType,
  ) {
    room.users.forEach((user) => {
      if (user != null) {
        user.client.sendPlayerState(
          gameSession,
          slot,
          healthPerc,
          powerups,
          shipType,
        );
      }
    });
  }

  broadcastPlayerEvent(room, gameSession, eventString) {
    room.users.forEach((user) => {
      if (user != null) {
        user.client.sendPlayerEvent(gameSession, eventString);
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
    const isForLobby = true;
    this.clients.forEach((client) => {
      client.sendLobbyMessage(username, message, isForLobby);
    });
  }

  broadcastRoomMessage(room, username, message) {
    const isForLobby = false;
    room.users.forEach((user) => {
      if (user != null) {
        user.client.sendLobbyMessage(username, message, isForLobby);
      }
    });
  }

  broadcastPrivateMessage(fromUser, toUser, message) {
    this.clients.forEach((client) => {
      if (client.user.username == toUser || client.user.username == fromUser) {
        client.sendPrivateMessage(fromUser, toUser, message);
      }
    });
  }

  addUser(user) {
    this.userManager.addUser(user);
  }

  addRoom(room) {
    this.roomManager.addRoom(room);
  }
}
