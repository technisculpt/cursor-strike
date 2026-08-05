import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import Matter from 'matter-js';

const { Engine, World, Bodies, Body, Events } = Matter;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') {
        reqUrl = '/index.html';
    }

    const filePath = path.join(__dirname, reqUrl);

    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    });
});

// WebSocket Server & Server-Authoritative Physics Room Manager
const wss = new WebSocketServer({ server });
const rooms = new Map();

function generateRoomId() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function broadcastRoomList() {
    const roomList = [];
    rooms.forEach((room) => {
        if (!room.p2) {
            roomList.push({
                id: room.id,
                name: room.name,
                mode: room.mode,
                target: room.target,
                playerCount: 1
            });
        }
    });
    const msg = JSON.stringify({ type: 'ROOM_LIST', rooms: roomList });
    wss.clients.forEach(client => {
        if (client.readyState === 1 && client.inLobby) {
            client.send(msg);
        }
    });
}

function startServerPhysicsRoom(room) {
    const engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 0.5;
    const world = engine.world;

    const width = 1280;
    const height = 720;
    const wallThickness = 40;

    const borderOpts = { isStatic: true, restitution: 0.8, friction: 0 };
    const topBorder    = Bodies.rectangle(width / 2, wallThickness / 2,          width,         wallThickness, borderOpts);
    const bottomBorder = Bodies.rectangle(width / 2, height - wallThickness / 2, width,         wallThickness, borderOpts);
    const leftBorder   = Bodies.rectangle(wallThickness / 2,          height / 2, wallThickness, height,        borderOpts);
    const rightBorder  = Bodies.rectangle(width - wallThickness / 2,  height / 2, wallThickness, height,        borderOpts);

    const mapId = room.mapId || 1;
    const mapBodies = [];

    if (mapId === 1) {
        // Classic Defense: Center Platform
        mapBodies.push(Bodies.rectangle(640, 460, 220, 30, { isStatic: true, restitution: 0.7, friction: 0.1 }));
    } else if (mapId === 2) {
        // Pinball Bumper Alley: Center Diamond & Side Bumpers
        mapBodies.push(Bodies.rectangle(640, 440, 120, 120, { isStatic: true, angle: Math.PI / 4, restitution: 0.8, friction: 0 }));
        mapBodies.push(Bodies.rectangle(360, 480, 100, 20, { isStatic: true, angle: Math.PI / 6, restitution: 0.8, friction: 0 }));
        mapBodies.push(Bodies.rectangle(920, 480, 100, 20, { isStatic: true, angle: -Math.PI / 6, restitution: 0.8, friction: 0 }));
    } else if (mapId === 3) {
        // Quad Pillar Gauntlet: 4 Interior Pillars & Center Barrier
        mapBodies.push(Bodies.rectangle(400, 320, 40, 40, { isStatic: true, restitution: 0.7 }));
        mapBodies.push(Bodies.rectangle(880, 320, 40, 40, { isStatic: true, restitution: 0.7 }));
        mapBodies.push(Bodies.rectangle(400, 520, 40, 40, { isStatic: true, restitution: 0.7 }));
        mapBodies.push(Bodies.rectangle(880, 520, 40, 40, { isStatic: true, restitution: 0.7 }));
        mapBodies.push(Bodies.rectangle(640, 420, 150, 25, { isStatic: true, restitution: 0.6 }));
    }

    // Circular Golf Hole Goal Sensors (r=30)
    const p1Goal = Bodies.circle(160, 115, 30, { isStatic: true, isSensor: true, label: 'p1_goal' });
    const p2Goal = Bodies.circle(1120, 115, 30, { isStatic: true, isSensor: true, label: 'p2_goal' });

    const BALL_RADIUS = 24;
    const ball = Bodies.circle(640, 640, BALL_RADIUS, {
        restitution: 0.85,
        friction: 0.02,
        frictionAir: 0.002,
        density: 0.05,
        label: 'ball'
    });
    Body.setInertia(ball, 0.5 * ball.mass * BALL_RADIUS * BALL_RADIUS);

    const PUCK_RADIUS = 12;
    const p1Puck = Bodies.circle(160, 640, PUCK_RADIUS, { isStatic: true, isSensor: true, label: 'p1_puck' });
    const p2Puck = Bodies.circle(1120, 640, PUCK_RADIUS, { isStatic: true, isSensor: true, label: 'p2_puck' });

    World.add(world, [
        topBorder, bottomBorder, leftBorder, rightBorder,
        ...mapBodies, p1Goal, p2Goal, ball, p1Puck, p2Puck
    ]);

    room.physics = { engine, world, ball, p1Puck, p2Puck };
    room.isMatchOver = false;
    room.puckInput = {
        p1: { x: 160, y: 640 },
        p2: { x: 1120, y: 640 }
    };
    room.puckPrev = {
        p1: { x: 160, y: 640 },
        p2: { x: 1120, y: 640 }
    };

    const MIN_DIST = PUCK_RADIUS + BALL_RADIUS;

    function applyPuckImpulse(inp, prev, puckBody) {
        const puck_vx = inp.x - prev.x;
        const puck_vy = inp.y - prev.y;

        Body.setPosition(puckBody, { x: inp.x, y: inp.y });

        const dx = ball.position.x - inp.x;
        const dy = ball.position.y - inp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MIN_DIST && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = MIN_DIST - dist;

            Body.setPosition(ball, {
                x: ball.position.x + nx * overlap,
                y: ball.position.y + ny * overlap
            });

            const speed = Math.sqrt(puck_vx * puck_vx + puck_vy * puck_vy);

            if (speed < 2.0) {
                // Soft Trap / Cushion: absorb ball bounce when puck is still or slow
                const trapDamping = 0.25;
                Body.setVelocity(ball, {
                    x: ball.velocity.x * trapDamping + puck_vx * 0.5,
                    y: ball.velocity.y * trapDamping + puck_vy * 0.5
                });
            } else {
                // Fast strike: powerful impulse kick + backspin torque
                const impulseVx = nx * (speed * 1.1) + puck_vx * 0.5;
                const impulseVy = ny * (speed * 1.1) + puck_vy * 0.5;

                Body.setVelocity(ball, {
                    x: ball.velocity.x * 0.15 + impulseVx * 0.85,
                    y: ball.velocity.y * 0.15 + impulseVy * 0.85
                });

                const torque = (puck_vx * ny - puck_vy * nx) * 0.12;
                Body.setAngularVelocity(ball, torque);
            }
        }
    }

    Events.on(engine, 'collisionStart', (event) => {
        if (room.isMatchOver) return;
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;
            let scorer = null;
            if ((bodyA === p1Goal && bodyB === ball) || (bodyB === p1Goal && bodyA === ball)) scorer = 'P2';
            else if ((bodyA === p2Goal && bodyB === ball) || (bodyB === p2Goal && bodyA === ball)) scorer = 'P1';

            if (scorer) {
                if (scorer === 'P1') room.scores.p1++;
                else room.scores.p2++;

                Body.setPosition(ball, { x: 640, y: 640 });
                Body.setVelocity(ball, { x: 0, y: 0 });
                Body.setAngularVelocity(ball, 0);

                const goalMsg = JSON.stringify({ type: 'GOAL_SCORED', scorer, scores: room.scores });
                if (room.p1 && room.p1.readyState === 1) room.p1.send(goalMsg);
                if (room.p2 && room.p2.readyState === 1) room.p2.send(goalMsg);

                if (room.mode === 'firstToX' && (room.scores.p1 >= room.target || room.scores.p2 >= room.target)) {
                    room.isMatchOver = true;
                    const winner = room.scores.p1 >= room.target ? 'P1' : 'P2';
                    const overMsg = JSON.stringify({ type: 'MATCH_OVER', winner, scores: room.scores });
                    if (room.p1 && room.p1.readyState === 1) room.p1.send(overMsg);
                    if (room.p2 && room.p2.readyState === 1) room.p2.send(overMsg);
                    if (room.gameLoop) clearInterval(room.gameLoop);
                }
            }
        });
    });

    if (room.mode === 'timed') {
        room.timerSeconds = room.target;
        room.timerEvent = setInterval(() => {
            if (room.isMatchOver) { clearInterval(room.timerEvent); return; }
            room.timerSeconds--;
            if (room.timerSeconds <= 0) {
                room.isMatchOver = true;
                let winner = 'DRAW';
                if (room.scores.p1 > room.scores.p2) winner = 'P1';
                else if (room.scores.p2 > room.scores.p1) winner = 'P2';
                const overMsg = JSON.stringify({ type: 'MATCH_OVER', winner, scores: room.scores });
                if (room.p1 && room.p1.readyState === 1) room.p1.send(overMsg);
                if (room.p2 && room.p2.readyState === 1) room.p2.send(overMsg);
                clearInterval(room.timerEvent);
                if (room.gameLoop) clearInterval(room.gameLoop);
            }
        }, 1000);
    }

    room.gameLoop = setInterval(() => {
        if (room.isMatchOver) return;

        const inp1 = room.puckInput.p1;
        const inp2 = room.puckInput.p2;

        // Apply manual impulse (mirrors CursorPhysics.js exactly)
        applyPuckImpulse(inp1, room.puckPrev.p1, p1Puck);
        applyPuckImpulse(inp2, room.puckPrev.p2, p2Puck);

        // Apply Magnus aerodynamic force (backspin lift & curve)
        const omega = ball.angularVelocity || 0;
        const vx = ball.velocity.x || 0;
        const vy = ball.velocity.y || 0;
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (Math.abs(omega) > 0.005 && speed > 0.5) {
            const kMagnus = 0.00035;
            Body.applyForce(ball, ball.position, {
                x: -kMagnus * omega * vy,
                y: kMagnus * omega * vx
            });
        }

        // Advance ball physics (gravity, wall bouncing, goal sensors)
        Engine.update(engine, 1000 / 60);

        // Store previous puck positions for next-frame velocity calculation
        room.puckPrev.p1 = { x: inp1.x, y: inp1.y };
        room.puckPrev.p2 = { x: inp2.x, y: inp2.y };

        const gameStateMsg = JSON.stringify({
            type: 'GAME_STATE',
            ball: {
                x: ball.position.x,
                y: ball.position.y,
                vx: ball.velocity.x,
                vy: ball.velocity.y,
                angle: ball.angle,
                angularVelocity: ball.angularVelocity
            },
            p1Puck: { x: p1Puck.position.x, y: p1Puck.position.y },
            p2Puck: { x: p2Puck.position.x, y: p2Puck.position.y },
            scores: room.scores,
            timerSeconds: room.timerSeconds
        });

        if (room.p1 && room.p1.readyState === 1) room.p1.send(gameStateMsg);
        if (room.p2 && room.p2.readyState === 1) room.p2.send(gameStateMsg);
    }, 1000 / 60);
}

wss.on('connection', (ws) => {
    ws.roomId = null;
    ws.role = null;
    ws.inLobby = false;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            switch (data.type) {
                case 'ENTER_LOBBY': {
                    ws.inLobby = true;
                    broadcastRoomList();
                    break;
                }
                case 'CREATE_ROOM': {
                    ws.inLobby = false;
                    const roomId = generateRoomId();
                    const room = {
                        id: roomId,
                        name: data.roomName || `Room ${roomId}`,
                        mode: data.mode || 'firstToX',
                        target: data.target || 3,
                        mapId: data.mapId || 1,
                        p1: ws,
                        p2: null,
                        scores: { p1: 0, p2: 0 },
                        state: 'waiting'
                    };
                    rooms.set(roomId, room);
                    ws.roomId = roomId;
                    ws.role = 'P1';
                    ws.send(JSON.stringify({ type: 'ROOM_CREATED', roomId, role: 'P1', mode: room.mode, target: room.target, mapId: room.mapId }));
                    broadcastRoomList();
                    break;
                }
                case 'JOIN_ROOM': {
                    const room = rooms.get(data.roomId);
                    if (room && !room.p2) {
                        ws.inLobby = false;
                        room.p2 = ws;
                        room.state = 'playing';
                        ws.roomId = room.id;
                        ws.role = 'P2';
                        ws.send(JSON.stringify({ type: 'ROOM_JOINED', roomId: room.id, role: 'P2', mode: room.mode, target: room.target, mapId: room.mapId }));
                        
                        startServerPhysicsRoom(room);

                        const startMsg = JSON.stringify({
                            type: 'GAME_START',
                            mode: room.mode,
                            target: room.target,
                            mapId: room.mapId
                        });
                        if (room.p1 && room.p1.readyState === 1) room.p1.send(startMsg);
                        if (room.p2 && room.p2.readyState === 1) room.p2.send(startMsg);
                        broadcastRoomList();
                    } else {
                        ws.send(JSON.stringify({ type: 'ERROR', message: 'Room full or not found' }));
                    }
                    break;
                }
                case 'SYNC_PUCK': {
                    const room = rooms.get(ws.roomId);
                    if (room && room.puckInput) {
                        const key = ws.role === 'P1' ? 'p1' : 'p2';
                        room.puckInput[key] = { x: data.x, y: data.y, vx: data.vx, vy: data.vy };
                    }
                    break;
                }
            }
        } catch (e) {
            console.error('Error handling WS message:', e);
        }
    });

    ws.on('close', () => {
        if (ws.roomId) {
            const room = rooms.get(ws.roomId);
            if (room) {
                if (room.gameLoop) clearInterval(room.gameLoop);
                if (room.timerEvent) clearInterval(room.timerEvent);
                const other = ws.role === 'P1' ? room.p2 : room.p1;
                if (other && other.readyState === 1) {
                    other.send(JSON.stringify({ type: 'PLAYER_DISCONNECTED' }));
                }
                rooms.delete(ws.roomId);
                broadcastRoomList();
            }
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log(`\n==================================================`);
    console.log(` CursorStrike Local Network Server Running!`);
    console.log(` Host: ${HOST} | Port: ${PORT}`);
    console.log(`==================================================`);
    console.log(` Local Access:       http://localhost:${PORT}`);

    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(` LAN Access (${name}): http://${net.address}:${PORT}`);
            }
        }
    }
    console.log(`==================================================\n`);
});
