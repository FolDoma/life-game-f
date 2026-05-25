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
                        const gyoztes = elok.p1 > elok.p2 ? "ZÖLD (1. Játékos)" : "SÁRGA (2. Játékos)";
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
                    setVegeredmeny("A SÁRGA (2. Játékos) nyert! A ZÖLD csapat kihalt.");
                    setFazis('GAME_OVER');
                } else if (elok.p2 === 0) {
                    setVegeredmeny("A ZÖLD (1. Játékos) nyert! A SÁRGA csapat kihalt.");
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
            <div className="min-h-dvh bg-background text-text flex items-center justify-center p-6">
                <div className="bg-foreground p-8 rounded-2xl border border-border shadow-2xl w-full max-w-md">
                    <h1 className="text-3xl text-center font-black mb-8">
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
                                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <div>
                            <label className="flex justify-between mb-2 font-medium">
                                Kezdő sejtek / játékos: <span>{beallitottSejtszam}</span>
                            </label>
                            <input
                                type="range" min="3" max="40" value={beallitottSejtszam}
                                onChange={(e) => setBeallitottSejtszam(parseInt(e.target.value))}
                                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <button
                            onClick={jatekInditasa}
                            className="w-full py-4 bg-border rounded-lg font-bold text-lg hover:bg-primary hover:text-border transition-transform shadow-lg mt-4"
                        >
                            JÁTÉK INDÍTÁSA
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-background text-text flex flex-col items-center justify-center p-4">

            {fazis !== 'SETUP' && (
                <div className="mb-4 flex items-center gap-4">
                    <div className="bg-foreground px-6 py-2 rounded-full border border-border text-sm font-mono text-text-light">
                        Eltelt idő: <span className="text-warning font-bold text-base">{korSzamlalo}</span> kör
                    </div>
                    {/* Szünet / Folytatás Gomb szimuláció közben */}
                    {fazis === 'RUNNING' && (
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider border transition-all ${isPaused
                                    ? 'bg-primary/20 text-primary border-primary hover:bg-primary/30'
                                    : 'bg-warning/20 text-warning border-warning hover:bg-warning/30'
                                }`}
                        >
                            {isPaused ? '▶ Folytatás' : '⏸ Megállítás'}
                        </button>
                    )}
                </div>
            )}

            <div className="flex gap-6 mb-6 w-full max-w-2xl">
                <div className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-300 ${aktualisJatekos === 1 && fazis === 'SETUP' ? 'border-primary bg-primary/10' : 'border-border bg-foreground'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <h2 className="font-black text-primary text-sm tracking-wider">PLAYER 1 (ZÖLD)</h2>
                    </div>
                    <p className="text-xl font-mono mt-1">
                        {fazis === 'SETUP'
                            ? `${beallitottSejtszam - lerakottSejtek[1]} lehelyezhető`
                            : `${aktualisSejtek.p1} élő sejt`
                        }
                    </p>
                </div>

                <div className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-300 ${aktualisJatekos === 2 && fazis === 'SETUP' ? 'border-secondary bg-secondary/10' : 'border-border bg-foreground'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-secondary" />
                        <h2 className="font-black text-secondary text-sm tracking-wider">PLAYER 2 (SÁRGA)</h2>
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
                    className={`grid gap-1 p-2 bg-background rounded-xl border border-border shadow-2xl transition-opacity duration-500 ${fazis === 'GAME_OVER' ? 'opacity-40 pointer-events-none' : ''}`}
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
                  ${cell === 0 ? 'bg-foreground hover:bg-foreground/70' : ''}
                  ${cell === 1 ? 'bg-primary' : ''}
                  ${cell === 2 ? 'bg-secondary' : ''}
                `}
                            />
                        ))
                    )}
                </div>

                {fazis === 'GAME_OVER' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground rounded-xl backdrop-blur-sm border border-border animate-fade-in p-6 text-center">
                        <h2 className="text-2xl font-black tracking-widest text-warning mb-2 uppercase">Játék Vége!</h2>
                        <p className="text-lg font-semibold px-4 mb-4 text-text-light">{vegeredmeny}</p>
                        <p className="text-sm text-text-light mb-6 font-mono">A mérkőzés {korSzamlalo} körig tartott.</p>
                        <button
                            onClick={() => setFazis('CONFIG')}
                            className="px-6 py-3 font-bold rounded-xl border border-border shadow-lg hover:scale-105 transition-transform"
                        >
                            Új beállítások
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-6 w-full max-w-xs flex flex-col items-center gap-4">
                {fazis === 'SETUP' && (
                    <div className="px-4 py-2 bg-foreground rounded-full border border-border text-sm font-semibold tracking-wide text-center">
                        Még <span className={aktualisJatekos === 1 ? 'text-primary' : 'text-secondary'}>{aktualisJatekos === 1 ? 'ZÖLD' : 'SÁRGA'}</span> rak le sejtet
                    </div>
                )}

                {fazis === 'RUNNING' && (
                    <div className="w-full bg-foreground p-4 rounded-2xl border border-border transition-opacity" style={{ opacity: isPaused ? 0.5 : 1 }}>
                        <label className="flex justify-between text-xs font-bold text-text-light uppercase tracking-wider mb-2">
                            Szimuláció sebessége: <span>{sebettsegMs} ms / kör</span>
                        </label>
                        <input
                            type="range" min="100" max="1500" step="50" value={sebettsegMs}
                            disabled={isPaused} // Megállított játéknál letiltjuk a csúszkát, hogy egyértelműbb legyen
                            onChange={(e) => setSebettsegMs(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-border border-border rounded-lg appearance-none cursor-pointer accent-warning disabled:opacity-30"
                        />
                    </div>
                )}

                {/* Bármikori megszakítás és visszalépés a menübe */}
                {fazis !== 'CONFIG' && (
                    <button
                        onClick={() => setFazis('CONFIG')}
                        className="text-xs text-slate-500 hover:text-error transition-colors uppercase tracking-widest mt-2 font-bold"
                    >
                        ← Menü / Reset
                    </button>
                )}
            </div>
        </div>
    );
}