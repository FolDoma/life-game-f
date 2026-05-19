// EletjatekSzimulator.ts
export class EletjatekSzimulator {
  public SorokSzama: number;
  public OszlopokSzama: number;
  public Matrix: number[][];

  constructor(sorok: number, oszlopok: number) {
    this.SorokSzama = sorok;
    this.OszlopokSzama = oszlopok;
    this.Matrix = Array.from({ length: sorok + 2 }, () =>
      Array(oszlopok + 2).fill(0)
    );
  }

  public SejtLerakas(sor: number, oszlop: number, jatekos: number): void {
    if (sor > 0 && sor <= this.SorokSzama && oszlop > 0 && oszlop <= this.OszlopokSzama) {
      this.Matrix[sor][oszlop] = jatekos;
    }
  }

  public KovetkezoAllapot(): void {
    const ujMatrix = this.Matrix.map((row) => [...row]);

    for (let i = 1; i <= this.SorokSzama; i++) {
      for (let j = 1; j <= this.OszlopokSzama; j++) {
        const szomszedok = this.MegszamolSzomszedok(i, j);
        const osszSzomszed = szomszedok.p1 + szomszedok.p2;

        if (this.Matrix[i][j] !== 0) {
          if (osszSzomszed < 2 || osszSzomszed > 3) {
            ujMatrix[i][j] = 0;
          }
        } else {
          if (osszSzomszed === 3) {
            ujMatrix[i][j] = szomszedok.p1 > szomszedok.p2 ? 1 : 2;
          }
        }
      }
    }
    this.Matrix = ujMatrix;
  }

  private MegszamolSzomszedok(sor: number, oszlop: number) {
    let p1 = 0, p2 = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const ertek = this.Matrix[sor + i][oszlop + j];
        if (ertek === 1) p1++;
        else if (ertek === 2) p2++;
      }
    }
    return { p1, p2 };
  }

  public GetEloSejtekSzama(): { p1: number; p2: number } {
    let p1 = 0;
    let p2 = 0;
    for (let i = 1; i <= this.SorokSzama; i++) {
      for (let j = 1; j <= this.OszlopokSzama; j++) {
        if (this.Matrix[i][j] === 1) p1++;
        if (this.Matrix[i][j] === 2) p2++;
      }
    }
    return { p1, p2 };
  }

  // Segédfüggvény: Szöveggé alakítja a mátrixot, hogy könnyen összehasonlítható legyen
  public GetAllapotString(): string {
    return JSON.stringify(this.Matrix);
  }
}