const url = 'https://rhwgnomfkchgzpmqiubb.supabase.co/rest/v1';
const key = 'sb_publishable_OczxLs8U1NFsF92wXMCwvg_pWBWcmCA';
const h = {
  apikey: key,
  Authorization: 'Bearer ' + key,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function upd(filter, body) {
  const r = await fetch(url + '/magic_items?' + filter, {
    method: 'PATCH', headers: h, body: JSON.stringify(body),
  });
  const rows = await r.json();
  const n = Array.isArray(rows) ? rows.length : '?';
  if (!r.ok) console.log('ERR  ' + filter + ': ' + JSON.stringify(rows).slice(0, 120));
  else if (n > 0) console.log('OK [' + String(n).padStart(4) + ']  ' + JSON.stringify(body));
}

const renames = [
  ["Dungeon Master's Guide",                                           'DMG'],
  ["Player's Handbook",                                               'PHB'],
  ["Xanathar's Guide to Everything",                                  'XGE'],
  ["Tasha's Cauldron of Everything",                                  'TCE'],
  ["Explorer's Guide to Wildemount",                                  'EGtW'],
  ['The Book of Many Things',                                         'BoMT'],
  ["Fizban's Treasury of Dragons",                                    'FToD'],
  ["Mordenkainen's Tome of Foes",                                     'MToF'],
  ["Volo's Guide to Monsters",                                        'VGtM'],
  ['Mordenkainen Presents: Monsters of the Multiverse',               'MotM'],
  ["Guildmasters' Guide to Ravnica",                                  'GGtR'],
  ["Guildmaster's Guide to Ravnica",                                  'GGtR'],
  ["Sword Coast Adventurer's Guide",                                  'SCAG'],
  ["Van Richten's Guide to Ravenloft",                                'VRGtR'],
  ["Baldur's Gate: Descent into Avernus",                             'BGDiA'],
  ["Baldur's Gate - Descent into Avernus",                            'BGDiA'],
  ['EGTW',                                                            'EGtW'],
  ['WOTC-SRD',                                                        'SRD'],
  ['Bigby Presents - Glory of the Giants',                            'BGG'],
  ['Mythic Odysseys of Theros',                                       'MOoT'],
  ['Eberron - Rising from the Last War',                              'ERLW'],
  ["Storm King's Thunder",                                            'SKT'],
  ['Waterdeep - Dragon Heist',                                        'WDH'],
  ['Princes of the Apocalypse',                                       'PotA'],
  ['Tales from the Yawning Portal',                                   'TftYP'],
  ['The Wild Beyond The Witchlight',                                  'WBtW'],
  ['Candlekeep Mysteries',                                            'CM'],
  ['Quests from the Infinite Staircase',                              'QftIS'],
  ['Tyranny of Dragons',                                              'ToD'],
  ['Icewind Dale - Rime of the Frostmaiden',                          'IDRotF'],
  ['Strixhaven: A Curriculum of Chaos',                               'SCoC'],
  ['Phandelver and Below - The Shattered Obelisk',                    'PaBtSO'],
  ['Curse of Strahd',                                                 'CoS'],
  ['Lost Laboratory of Kwalish',                                      'LLK'],
  ['Tomb of Annihilation',                                            'ToA'],
  ['Acquisitions Incorporated',                                       'AI'],
  ['Ghosts of Saltmarsh',                                             'GoS'],
  ['Out of the Abyss',                                                'OotA'],
  ['Infernal Machine Rebuild',                                        'IMR'],
  ['Keys from the Golden Vault',                                      'KftGV'],
  ["Wayfarer's Guide to Eberron",                                     'WGtE'],
  ['Vecna - Eve of Ruin',                                             'VEoR'],
  ["Spelljammer: Adventures in Space - Astral Adventurer's Guide",    'AAG'],
  ['Dragonlance: Shadow of the Dragon Queen',                         'DSotDQ'],
  ["Dragonlance: Shadow of the Dragon Queen, Fizban's Treasury of Dragons", 'DSotDQ'],
  ['Critical Role - Call of the Netherdeep',                         'CRCotN'],
  ['Planescape - Adventures in the Multiverse',                       'PAitM'],
  ['Journeys through the Radiant Citadel',                            'JttRC'],
  ['Dungeons and Dragons - Honor Among Thieves.',                     'HAT'],
  ['Dungeons and Dragons - Honor Among Thieves',                      'HAT'],
  ["Sleeping Dragon's Wake",                                          'SDW'],
  ['Waterdeep: Dungeon of the Mad Mage',                              'WDMM'],
  ['The Rise of Tiamat',                                              'RoT'],
];

console.log('=== Del 1 — normaliser fulde titler ===');
for (const [from, to] of renames) {
  await upd('source=eq.' + encodeURIComponent(from), { source: to });
}

console.log('\n=== Del 2 — skjul A5E ===');
const r2 = await fetch(url + '/magic_items?source=eq.A5E', {
  method: 'PATCH', headers: h, body: JSON.stringify({ hidden: true }),
});
const res2 = await r2.json();
if (!r2.ok) console.log('hidden ERR (column may not exist): ' + JSON.stringify(res2).slice(0, 120));
else console.log('OK [' + res2.length + ']  A5E -> hidden=true');

console.log('\n=== Del 3 — final state (visible items only) ===');
let all = [], offset = 0;
while (true) {
  const r = await fetch(
    url + '/magic_items?select=source&hidden=neq.true&limit=1000&offset=' + offset,
    { headers: h }
  );
  const rows = await r.json();
  if (!Array.isArray(rows) || rows.length === 0) break;
  all = all.concat(rows);
  if (rows.length < 1000) break;
  offset += 1000;
}
const c = {};
for (const row of all) { const s = row.source ?? 'NULL'; c[s] = (c[s] || 0) + 1; }
const sorted = Object.entries(c).sort((a, b) => b[1] - a[1]);
console.log('Visible magic_items: ' + all.length);
for (const [src, n] of sorted) console.log('  ' + String(n).padStart(5) + '  ' + src);
