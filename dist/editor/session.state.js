const sessions = new Map();
const initial = { published: new Set(), checking: false, pending: false, checks: 0, buffer: Buffer.alloc(0) };
export const session = () => sessions.get("current") ?? initial;
export const updateSession = (change) => {
    const next = { ...session(), ...change };
    sessions.set("current", next);
    return next;
};
//# sourceMappingURL=session.state.js.map