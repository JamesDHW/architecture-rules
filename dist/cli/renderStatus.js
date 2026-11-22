/** The rules listed per layer; the JSON output has all of them. */
const listedRules = 3;
const percent = (part, whole) => (whole === 0 ? "-" : `${Math.round((part / whole) * 100)}%`);
const signed = (change) => (change > 0 ? `+${change}` : String(change));
const delta = (row) => {
    if (row.recordedAtBase === undefined)
        return "";
    const change = row.recorded - row.recordedAtBase;
    return change === 0 ? " (±0)" : ` (${signed(change)})`;
};
const columns = [
    { heading: "layer", cell: (row) => row.layer, alignRight: false },
    { heading: "files", cell: (row) => String(row.files), alignRight: true },
    { heading: "compliant", cell: (row) => `${row.compliant} (${percent(row.compliant, row.files)})`, alignRight: true },
    { heading: "new", cell: (row) => String(row.new), alignRight: true },
    { heading: "recorded", cell: (row) => `${row.recorded}${delta(row)}`, alignRight: true },
    { heading: "exceptions", cell: (row) => String(row.exceptions), alignRight: true },
    { heading: "top recorded rules", cell: (row) => row.recordedByRule.slice(0, listedRules).map((entry) => `${entry.rule} ${entry.count}`).join(" · "), alignRight: false },
];
const totals = (rows) => {
    const sum = (pick) => rows.reduce((total, row) => total + pick(row), 0);
    const hasBase = rows.some((row) => row.recordedAtBase !== undefined);
    return {
        layer: "total", files: sum((row) => row.files), compliant: sum((row) => row.compliant), new: sum((row) => row.new),
        recorded: sum((row) => row.recorded), exceptions: sum((row) => row.exceptions), recordedByRule: [],
        ...(hasBase ? { recordedAtBase: sum((row) => row.recordedAtBase ?? 0) } : {}),
    };
};
const table = (rows) => {
    const cells = [columns.map((column) => column.heading), ...rows.map((row) => columns.map((column) => column.cell(row)))];
    const widths = columns.map((_, index) => Math.max(...cells.map((line) => line.at(index)?.length ?? 0)));
    return cells.map((line) => line.map((cell, index) => {
        const width = widths.at(index) ?? 0;
        return columns.at(index)?.alignRight === true ? cell.padStart(width) : cell.padEnd(width);
    }).join("  ").trimEnd()).join("\n");
};
/** One row per layer and a total, as a table or JSON. */
export const renderStatus = (rows, verdict, json) => {
    if (json)
        return `${JSON.stringify({ layers: rows, total: totals(rows), stale: verdict.stale.length }, null, 2)}\n`;
    const stale = verdict.stale.length === 0 ? [] : ["", `${verdict.stale.length} baseline entries are fixed; any check removes them.`];
    return `${[table([...rows, totals(rows)]), ...stale].join("\n")}\n`;
};
//# sourceMappingURL=renderStatus.js.map