import { RoomStatus } from "./RoomStatus.ts";
import { ServerThread } from "./ServerThread.ts";
import { Team } from "./Team.ts";

export class RoomTransitionThread {
  server;
  room;
  countdown;
  startStatus;

  constructor(server, room, startStatus) {
    this.server = server;
    this.room = room;
    this.countdown = ServerThread.TABLE_COUNTDOWN;
    this.startStatus = startStatus;
    this.run();
  }

  run() {
    if (this.startStatus == 3) {
      this.countDownTransition();
    } else if (this.startStatus == 5) {
      this.endGameTransition();
    }
  }

  endGameTransition() {
    // Thread.sleep(3000);
    this.room.setStatus(RoomStatus.IDLE);
    this.server.broadcastRoomStatusChange(
      this.room.roomId,
      this.room.status,
      -1,
    );
  }

  countDownTransition() {
    for (let i = 0; i < ServerThread.TABLE_COUNTDOWN; i++) {
      this.server.broadcastRoomStatusChange(
        this.room.roomId,
        this.room.status,
        this.countdown,
      );
      this.countdown--;
      // Thread.sleep(1000);
      if (
        this.room.numUsers < 2 ||
        this.room.isTeamRoom &&
          (this.room.teamSize(Team.GOLDTEAM) <= 0 ||
            this.room.teamSize(Team.BLUETEAM) <= 0) ||
        this.room.isBalancedRoom &&
          (this.room.teamSize(Team.GOLDTEAM) !=
            this.room.teamSize(Team.BLUETEAM))
      ) { // People left, we need to stop counting down
        this.room.status = RoomStatus.IDLE;
        this.server.broadcastRoomStatusChange(
          this.room.roomId,
          this.room.status,
          ServerThread.TABLE_COUNTDOWN,
        );
        return;
      }
    }
    // Game is ready to start
    this.room.status = RoomStatus.PLAYING;
    this.room.setUsersAlive();
    this.server.broadcastRoomStatusChange(
      this.room.roomId,
      this.room.status,
      -1,
    );
    this.server.broadcastGameStart(this.room);
  }
}
