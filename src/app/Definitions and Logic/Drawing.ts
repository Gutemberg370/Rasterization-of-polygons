import { Point } from './PointDefinition';

export class Drawing {
  pixelList = [];

  produceFragment(point: Point) {
    const xm = Math.ceil(point.x);
    const ym = Math.ceil(point.y);
    const pixel = new Point(xm, ym);
    this.pixelList.push(pixel);
  }

  lineRasterization(Point1: Point, Point2: Point) {
    let dx = Point1.x - Point2.x;
    let dy = Point1.y - Point2.y;
    let x = Point1.x;
    let y = Point1.y;
    let m = 0;
    if (dx) m = dy / dx;

    let b = y - m * x;

    // Caso em que o x varia mais que y
    if (Math.abs(dx) > Math.abs(dy)) {
      let Gp = Math.max(Point1.x, Point2.x);
      let Mp = Math.min(Point1.x, Point2.x);

      if (Mp == Point1.x) y = Point1.y;
      else y = Point2.y;

      while (Mp <= Gp) {
        this.produceFragment(new Point(Mp, y));
        Mp = Mp + 1;
        y = m * Mp + b;
      }

      return this.pixelList;

      // Caso em que o y varia mais que x
    } else {
      let Gp = Math.max(Point1.y, Point2.y);
      let Mp = Math.min(Point1.y, Point2.y);

      if (Mp == Point1.y) x = Point1.x;
      else x = Point2.x;

      while (Mp <= Gp) {
        this.produceFragment(new Point(x, Mp));
        Mp = Mp + 1;
        // Caso em que delta x = 0
        if (dx != 0) x = (Mp - b) / m;
      }
      return this.pixelList;
    }
  }

  polygonRasterization(PixelList: Point[], PixelSize, Canvas, ScannedData) {
    var Counter = 0;
    var InternalPixels: Point[] = [];
    var AnalisedPoint: Point;

    for (let Y = 0; Y < Canvas.height; Y++) {
      for (let X = 0; X < Canvas.width * 4; X += 4) {
        AnalisedPoint = new Point(X / 4, Y);

        if (Counter == PixelSize) InternalPixels.push(AnalisedPoint);
        if (PixelList.includes(AnalisedPoint)) Counter++;
        if (Counter == 2 * PixelSize) Counter = 0;
        if (Counter) InternalPixels = [];

        for (let x = 0; x < Canvas.width * 4; x += 4) {
          if (InternalPixels.includes(new Point(x, Y))) ScannedData[x] = 255;
          ScannedData[x + 1] = 255;
          ScannedData[x + 2] = 255;
          ScannedData[x + 3] = 255;
        }
        console.log(InternalPixels);
        InternalPixels = [];
      }
    }
  }
}
