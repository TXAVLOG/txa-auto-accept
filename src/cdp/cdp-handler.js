'use strict';

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_PORT = 9000;
const PORT_RANGE = 3; // scan 8997..9003

class CDPHandler {
    constructor(logger = console.log) {
        this.logger = logger;
        this.connections = new Map(); // key: "port:pageId" → { ws, injected }
        this.isEnabled = false;
        this.msgId = 1;
    }

    log(msg) { this.logger(`[TXA-CDP] ${msg}`); }

    // ── PUBLIC API ─────────────────────────────────────────────────────────────

    async isCDPAvailable() {
        for (let port = BASE_PORT - PORT_RANGE; port <= BASE_PORT + PORT_RANGE; port++) {
            try {
                const pages = await this._getPages(port);
                if (pages.length > 0) return true;
            } catch (e) { }
        }
        return false;
    }

    async start(config) {
        this.isEnabled = true;
        await this._scanAndConnect(config);
    }

    async stop() {
        this.isEnabled = false;
        for (const [id, conn] of this.connections) {
            try {
                await this._eval(id, 'if(window.__txaStop) window.__txaStop()');
                conn.ws.close();
            } catch (e) { }
        }
        this.connections.clear();
        this.log('Stopped all connections.');
    }

    async updateConfig(config) {
        for (const [id] of this.connections) {
            try {
                await this._eval(id, `if(window.__txaStart) window.__txaStart(${JSON.stringify(config)})`);
            } catch (e) { }
        }
    }

    async getStats() {
        let totalClicks = 0;
        let allEvents = [];
        for (const [id] of this.connections) {
            try {
                const res = await this._eval(id, 'window.__txaGetStats ? window.__txaGetStats() : "{}"');
                if (res?.result?.value) {
                    const s = JSON.parse(res.result.value);
                    totalClicks += s.clicks || 0;
                    if (s.events) allEvents.push(...s.events);
                }
            } catch (e) { }
        }
        return { clicks: totalClicks, events: allEvents };
    }

    async setPickMode(enabled) {
        for (const [id] of this.connections) {
            try {
                await this._eval(id, `if(window.__txaSetPickMode) window.__txaSetPickMode(${enabled})`);
            } catch (e) { }
        }
    }

    async getPickedSelector() {
        for (const [id] of this.connections) {
            try {
                const res = await this._eval(id, 'window.__txaGetPickedSelector ? window.__txaGetPickedSelector() : null');
                if (res?.result?.value) return res.result.value;
            } catch (e) { }
        }
        return null;
    }

    getConnectionCount() { return this.connections.size; }

    // ── INTERNAL ───────────────────────────────────────────────────────────────

    async _scanAndConnect(config) {
        for (let port = BASE_PORT - PORT_RANGE; port <= BASE_PORT + PORT_RANGE; port++) {
            try {
                const pages = await this._getPages(port);
                for (const page of pages) {
                    const id = `${port}:${page.id}`;
                    if (!this.connections.has(id)) {
                        const ok = await this._connect(id, page.webSocketDebuggerUrl);
                        if (ok) this.log(`Connected: ${id} (${page.title || 'no title'})`);
                    }
                    if (this.connections.has(id)) {
                        await this._inject(id, config);
                    }
                }
            } catch (e) { }
        }

        if (this.connections.size === 0) {
            this.log(`No CDP pages found on ports ${BASE_PORT - PORT_RANGE}–${BASE_PORT + PORT_RANGE}`);
        }
    }

    async _getPages(port) {
        return new Promise((resolve) => {
            const req = http.get(
                { hostname: '127.0.0.1', port, path: '/json/list', timeout: 800 },
                (res) => {
                    let body = '';
                    res.on('data', c => body += c);
                    res.on('end', () => {
                        try {
                            const pages = JSON.parse(body);
                            resolve(pages.filter(p => p.webSocketDebuggerUrl &&
                                (p.type === 'page' || p.type === 'webview')));
                        } catch (e) { resolve([]); }
                    });
                }
            );
            req.on('error', () => resolve([]));
            req.on('timeout', () => { req.destroy(); resolve([]); });
        });
    }

    async _connect(id, url) {
        return new Promise((resolve) => {
            try {
                const ws = new WebSocket(url);
                const timeout = setTimeout(() => { ws.terminate(); resolve(false); }, 3000);
                ws.on('open', () => {
                    clearTimeout(timeout);
                    this.connections.set(id, { ws, injected: false });
                    resolve(true);
                });
                ws.on('error', () => { clearTimeout(timeout); resolve(false); });
                ws.on('close', () => {
                    this.connections.delete(id);
                    this.log(`Disconnected: ${id}`);
                });
            } catch (e) { resolve(false); }
        });
    }

    async _inject(id, config) {
        const conn = this.connections.get(id);
        if (!conn) return;
        try {
            if (!conn.injected) {
                const scriptPath = path.join(__dirname, 'inject-script.js');
                const script = fs.readFileSync(scriptPath, 'utf8');
                await this._eval(id, script);
                conn.injected = true;
                this.log(`Script injected into ${id}`);
            }
            await this._eval(id, `window.__txaStart(${JSON.stringify(config)})`);
        } catch (e) {
            this.log(`Inject failed for ${id}: ${e.message}`);
            conn.injected = false; // retry next scan
        }
    }

    async _eval(id, expression) {
        const conn = this.connections.get(id);
        if (!conn || conn.ws.readyState !== WebSocket.OPEN) return null;

        return new Promise((resolve, reject) => {
            const currentId = this.msgId++;
            const timeout = setTimeout(() => reject(new Error('CDP timeout')), 3000);

            const onMsg = (data) => {
                try {
                    const msg = JSON.parse(data.toString());
                    if (msg.id === currentId) {
                        conn.ws.off('message', onMsg);
                        clearTimeout(timeout);
                        resolve(msg.result);
                    }
                } catch (e) { }
            };
            conn.ws.on('message', onMsg);
            conn.ws.send(JSON.stringify({
                id: currentId,
                method: 'Runtime.evaluate',
                params: { expression, userGesture: true, awaitPromise: true }
            }));
        });
    }
}

module.exports = { CDPHandler };
