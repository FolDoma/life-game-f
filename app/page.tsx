"use client"

import React, { useState, useEffect } from 'react';
import { EletjatekSzimulator } from './EletjatekSzimulator';

export default function App() {
    const [beallitottMeret, setBeallitottMeret] = useState(15);
    const [beallitottSejtszam, setBeallitottSejtszam] = useState(10);
    const [sebettsegMs, setSebettsegMs] = useState(500); // 500 ms az alapértelmezett

    const [game, setGame] = useState<EletjatekSzimulator | null>(null);
    const [matrix, setMatrix] = useState<number[][]>([]);
    const [fazis, setFazis] = useState<'CONFIG' | 'SETUP' | 'RUNNING' | 'GAME_OVER'>('CONFIG');
    const [isPaused, setIsPaused] = useState(false); // Új állapot a szüneteltetéshez
    const [aktualisJatekos, setAktualisJatekos] = useState<1 | 2>(1);
    const [lerakottSejtek, setLerakottSejtek] = useState({ 1: 0, 2: 0 });
    const [korSzamlalo, setKorSzamlalo] = useState(0);
    const [vegeredmeny, setVegeredmeny] = useState<string>("");
    const [aktualisSejtek, setAktualisSejtek] = useState({ p1: 0, p2: 0 });
    const [elozoAllapotok, setElozoAllapotok] = useState<string[]>([]);

    // Új játék/kör indítása
    const jatekInditasa = () => {
        const ujGame = new EletjatekSzimulator(beallitottMeret, beallitottMeret);
        setGame(ujGame);
        setMatrix([...ujGame.Matrix]);
        setLerakottSejtek({ 1: 0, 2: 0 });
        setAktualisSejtek({ p1: beallitottSejtszam, p2: beallitottSejtszam });
        setAktualisJatekos(1);
        setKorSzamlalo(0);
        setVegeredmeny("");
        setElozoAllapotok([]);
        setSebettsegMs(500); // Kérésedre minden új játéknál visszaállítjuk 500-ra
        setIsPaused(false);   // Alapértelmezetten futva indul a setup után
        setFazis('SETUP');
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;

        // Csak akkor fut az időzítő, ha RUNNING fázisban vagyunk ÉS nincs megállítva (isPaused)
        if (fazis === 'RUNNING' && game && !isPaused) {
            timer = setInterval(() => {
                const jelenlegiKörString = game.GetAllapotString();

                game.KovetkezoAllapot();
                const ujKörString = game.GetAllapotString();

                const elok = game.GetEloSejtekSzama();
                setMatrix([...game.Matrix]);
                setAktualisSejtek(elok);
                setKorSzamlalo((prev) => prev + 1);

                if (ujKörString === jelenlegiKörString || elozoAllapotok.includes(ujKörString)) {
                    if (elok.p1 === elok.p2) {
                        setVegeredmeny(`Patthelyzet alakult ki! Döntetlen, mindkét játékosnak pontosan ${elok.p1} sejtje maradt.`);
                    } else {
                        const gyoztes = elok.p1 > elok.p2 ? "KÉK (1. Játékos)" : "PIROS (2. Játékos)";
                        setVegeredmeny(`A játék állandósult! Pontozásos győzelem: nyert a ${gyoztes} több élő sejttel (${Math.max(elok.p1, elok.p2)} vs ${Math.min(elok.p1, elok.p2)}).`);
                    }
                    setFazis('GAME_OVER');
                    return;
                }

                setElozoAllapotok((prev) => [jelenlegiKörString, ...prev].slice(0, 2));

                if (elok.p1 === 0 && elok.p2 === 0) {
                    setVegeredmeny("Minden sejt elpusztult! Döntetlen.");
                    setFazis('GAME_OVER');
                } else if (elok.p1 === 0) {
                    setVegeredmeny("A PIROS (2. Játékos) nyert! A kék csapat kihalt.");
                    setFazis('GAME_OVER');
                } else if (elok.p2 === 0) {
                    setVegeredmeny("A KÉK (1. Játékos) nyert! A piros csapat kihalt.");
                    setFazis('GAME_OVER');
                }

            }, sebettsegMs);
        }

        return () => clearInterval(timer);
    }, [fazis, game, sebettsegMs, elozoAllapotok, isPaused]);

    const cellaKattintas = (sor: number, oszlop: number) => {
        if (fazis !== 'SETUP' || !game || matrix[sor][oszlop] !== 0) return;

        game.SejtLerakas(sor, oszlop, aktualisJatekos);
        const ujSejtSzamok = { ...lerakottSejtek, [aktualisJatekos]: lerakottSejtek[aktualisJatekos] + 1 };

        setLerakottSejtek(ujSejtSzamok);
        setMatrix([...game.Matrix]);

        if (ujSejtSzamok[1] === beallitottSejtszam && ujSejtSzamok[2] === beallitottSejtszam) {
            setFazis('RUNNING');
        } else {
            const masikJatekos = aktualisJatekos === 1 ? 2 : 1;
            if (ujSejtSzamok[masikJatekos] < beallitottSejtszam) {
                setAktualisJatekos(masikJatekos);
            }
        }
    };

    if (fazis === 'CONFIG') {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-md">
                    <h1 className="text-3xl font-black text-center mb-8 bg-gradient-to-r from-blue-400 to-red-500 bg-clip-text text-transparent">
                        CELL WARS BEÁLLÍTÁSOK
                    </h1>

                    <div className="space-y-6">
                        <div>
                            <label className="flex justify-between mb-2 font-medium">
                                Pálya mérete: <span>{beallitottMeret}x{beallitottMeret}</span>
                            </label>
                            <input
                                type="range" min="8" max="25" value={beallitottMeret}
                                onChange={(e) => setBeallitottMeret(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>

                        <div>
                            <label className="flex justify-between mb-2 font-medium">
                                Kezdő sejtek / játékos: <span>{beallitottSejtszam}</span>
                            </label>
                            <input
                                type="range" min="3" max="40" value={beallitottSejtszam}
                                onChange={(e) => setBeallitottSejtszam(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                        </div>

                        <button
                            onClick={jatekInditasa}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-red-600 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg mt-4"
                        >
                            JÁTÉK INDÍTÁSA
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">

            {fazis !== 'SETUP' && (
                <div className="mb-4 flex items-center gap-4">
                    <div className="bg-slate-900 px-6 py-2 rounded-full border border-slate-800 text-sm font-mono text-slate-400">
                        Eltelt idő: <span className="text-yellow-400 font-bold text-base">{korSzamlalo}</span> kör
                    </div>
                    {/* Szünet / Folytatás Gomb szimuláció közben */}
                    {fazis === 'RUNNING' && (
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider border transition-all ${isPaused
                                    ? 'bg-green-500/20 text-green-400 border-green-500 hover:bg-green-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border-amber-500 hover:bg-amber-500/30'
                                }`}
                        >
                            {isPaused ? '▶ Folytatás' : '⏸ Megállítás'}
                        </button>
                    )}
                </div>
            )}

            <div className="flex gap-6 mb-6 w-full max-w-2xl">
                <div className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-300 ${aktualisJatekos === 1 && fazis === 'SETUP' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-800 bg-slate-900/40'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_cyan]" />
                        <h2 className="font-black text-blue-400 text-sm tracking-wider">PLAYER 1 (KÉK)</h2>
                    </div>
                    <p className="text-xl font-mono mt-1">
                        {fazis === 'SETUP'
                            ? `${beallitottSejtszam - lerakottSejtek[1]} lehelyezhető`
                            : `${aktualisSejtek.p1} élő sejt`
                        }
                    </p>
                </div>

                <div className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-300 ${aktualisJatekos === 2 && fazis === 'SETUP' ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-800 bg-slate-900/40'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_red]" />
                        <h2 className="font-black text-red-400 text-sm tracking-wider">PLAYER 2 (PIROS)</h2>
                    </div>
                    <p className="text-xl font-mono mt-1">
                        {fazis === 'SETUP'
                            ? `${beallitottSejtszam - lerakottSejtek[2]} lehelyezhető`
                            : `${aktualisSejtek.p2} élő sejt`
                        }
                    </p>
                </div>
            </div>

            <div className="relative">
                <div
                    className={`grid gap-1 p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl transition-opacity duration-500 ${fazis === 'GAME_OVER' ? 'opacity-40 pointer-events-none' : ''}`}
                    style={{
                        gridTemplateColumns: `repeat(${beallitottMeret}, minmax(0, 1fr))`,
                        width: 'min(85vw, 550px)',
                        height: 'min(85vw, 550px)'
                    }}
                >
                    {matrix.slice(1, beallitottMeret + 1).map((row, rIdx) =>
                        row.slice(1, beallitottMeret + 1).map((cell, cIdx) => (
                            <div
                                key={`${rIdx}-${cIdx}`}
                                onClick={() => cellaKattintas(rIdx + 1, cIdx + 1)}
                                className={`
                  aspect-square rounded-sm cursor-pointer transition-all duration-150
                  ${cell === 0 ? 'bg-slate-800 hover:bg-slate-700' : ''}
                  ${cell === 1 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)] scale-95' : ''}
                  ${cell === 2 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] scale-95' : ''}
                `}
                            />
                        ))
                    )}
                </div>

                {fazis === 'GAME_OVER' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 rounded-xl backdrop-blur-sm border border-slate-800 animate-fade-in p-6 text-center">
                        <h2 className="text-2xl font-black tracking-widest text-yellow-400 mb-2 uppercase">Játék Vége!</h2>
                        <p className="text-lg font-semibold px-4 mb-4 text-slate-200">{vegeredmeny}</p>
                        <p className="text-sm text-slate-400 mb-6 font-mono">A mérkőzés {korSzamlalo} körig tartott.</p>
                        <button
                            onClick={() => setFazis('CONFIG')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                        >
                            Új beállítások
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-6 w-full max-w-xs flex flex-col items-center gap-4">
                {fazis === 'SETUP' && (
                    <div className="px-4 py-2 bg-slate-900 rounded-full border border-slate-800 text-sm font-semibold tracking-wide text-center">
                        Még <span className={aktualisJatekos === 1 ? 'text-blue-400' : 'text-red-400'}>{aktualisJatekos === 1 ? 'KÉK' : 'PIROS'}</span> rak le sejtet
                    </div>
                )}

                {fazis === 'RUNNING' && (
                    <div className="w-full bg-slate-900 p-4 rounded-2xl border border-slate-800 transition-opacity" style={{ opacity: isPaused ? 0.5 : 1 }}>
                        <label className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Szimuláció sebessége: <span>{sebettsegMs} ms / kör</span>
                        </label>
                        <input
                            type="range" min="100" max="1500" step="50" value={sebettsegMs}
                            disabled={isPaused} // Megállított játéknál letiltjuk a csúszkát, hogy egyértelműbb legyen
                            onChange={(e) => setSebettsegMs(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 disabled:opacity-30"
                        />
                    </div>
                )}

                {/* Bármikori megszakítás és visszalépés a menübe */}
                {fazis !== 'CONFIG' && (
                    <button
                        onClick={() => setFazis('CONFIG')}
                        className="text-xs text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest mt-2 font-bold"
                    >
                        ← Menü / Reset
                    </button>
                )}
            </div>
        </div>
    );
}