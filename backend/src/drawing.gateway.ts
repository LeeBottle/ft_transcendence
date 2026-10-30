import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Stroke {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  width: number;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class DrawingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private strokes: Stroke[] = [];

  handleConnection(client: Socket) {
    client.emit('drawing:init', this.strokes);
  }

  @SubscribeMessage('drawing:stroke')
  draw(client: Socket, stroke: Stroke) {
    if (!this.isValidStroke(stroke)) return;
    this.strokes.push(stroke);
    if (this.strokes.length > 5000) this.strokes.shift();
    client.broadcast.emit('drawing:stroke', stroke);
  }

  @SubscribeMessage('drawing:clear')
  clear() {
    this.strokes = [];
    this.server.emit('drawing:clear');
  }

  private isValidStroke(stroke: Stroke) {
    return stroke
      && [stroke.x0, stroke.y0, stroke.x1, stroke.y1, stroke.width].every(Number.isFinite)
      && [stroke.x0, stroke.x1].every((value) => value >= 0 && value <= 800)
      && [stroke.y0, stroke.y1].every((value) => value >= 0 && value <= 450)
      && stroke.width >= 1 && stroke.width <= 30
      && /^#[0-9a-f]{6}$/i.test(stroke.color);
  }
}
