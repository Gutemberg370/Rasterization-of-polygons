
import { Point } from './PointDefinition';

export class Drawing {
  pixelList = [];

  produceFragment(point: Point) {
    const xm = Math.floor(point.x);
    const ym = Math.floor(point.y);
    const pixel = new Point(xm, ym);
    this.pixelList.push(pixel);
  }

  lineRasterization(Point1: Point, Point2: Point) {
    let dx = Point2.x - Point1.x;
    let dy = Point2.y - Point1.y;
    let x = Point1.x;
    let y = Point1.y;
    let m = 0;
    if (dx) m = dy / dx;

    let b = y - m * x;

    // Caso em que o x varia mais que y
    if (Math.abs(dx) > Math.abs(dy)) {
      let Gp = Math.max(Point1.x, Point2.x);
      let Mp = Math.min(Point1.x, Point2.x);

      Mp == Point1.x? y = Point1.y: y = Point2.y;

      while (Mp <= Gp) {
        this.produceFragment(new Point(Mp, y));
        Mp = Mp + 1;
        y = m * Mp + b;
      }

      return this.pixelList;

      // Caso em que o y varia mais que x ou varia na mesma proporção
    } else {
      let Gp = Math.max(Point1.y, Point2.y);
      let Mp = Math.min(Point1.y, Point2.y);

      Mp == Point1.y? x = Point1.x: x = Point2.x;

      while (Mp <= Gp) {
        this.produceFragment(new Point(x, Mp));
        Mp = Mp + 1;
        // No caso de dx for 0, o x permanece o mesmo para toda a reta
        if (dx != 0) x = (Mp - b) / m;
      }
      return this.pixelList;
    }
  }

  polygonRasterization(PixelList: Point[], Canvas, ScannedData) {
    let Counter = 0;
    let InternalPixels: Point[] = [];
    let AnalisedPoint: Point;

    for (let Y = 0; Y < Canvas.height; Y++) {
      for (let X = 0; X < Canvas.width; X ++) {
        AnalisedPoint = new Point(X, Y);

        if (Counter%2 == 1) InternalPixels.push(AnalisedPoint);

        if (PixelList.find(p => p.x === X && p.y === Y) && !PixelList.find(p => p.x === (X + 1) && p.y === Y)) Counter++;

        if (Counter%2 == 0) Counter = 0;

      }
      if (Counter) InternalPixels = [];
      for (let X = 0; X < Canvas.width; X ++) {
          if (InternalPixels.find(p => p.x === X)){
            const PositionInCanvas = (X + ((Canvas.height - Y)*Canvas.width))*4;
            ScannedData[PositionInCanvas] = 255;
            ScannedData[PositionInCanvas + 1] = 255;
            ScannedData[PositionInCanvas + 2] = 255;
            ScannedData[PositionInCanvas + 3] = 255;
          }
        }
        Counter = 0;
        InternalPixels = [];
    }
  }
}
