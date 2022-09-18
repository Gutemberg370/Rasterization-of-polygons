import { Component } from '@angular/core';
import { Point } from 'src/app/Definitions and Logic/PointDefinition';
import { Drawing } from './Definitions and Logic/Drawing';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  NumberOfPoints = 2;

  PointsList: Point[] = [];
  PixelList: Point[] = [];

  AddToPointList(x: number, y: number, position: number) {
    const NewPoint = new Point(x, y);
    this.PointsList[position] = NewPoint;
  }

  // Criar pontos temporários na lista de pontos para ser possível indexar no futuro
  AddDummyPoints(event) {
    this.PointsList = [];
    this.NumberOfPoints = event.target.value;
    for (let i = 0; i < this.NumberOfPoints; i++) {
      this.AddToPointList(-1, -1, i);
    }
  }

  // Determinar a posição x de um ponto vindo do input
  ChangeXPointPosition(event, position: number) {
    this.PointsList[position].x = Number(event.target.value);
  }

  // Determinar a posição y de um ponto vindo do input
  ChangeYPointPosition(event, position: number) {
    this.PointsList[position].y = Number(event.target.value);
  }

  // Determinar os pixels correspondentes entre cada dois pontos da lista de pontos
  DeterminePixels() {
    let Drawer = new Drawing();

    if (this.PointsList.length == 1) {
      this.PixelList.push(this.PointsList[0]);
    }

    for (let i = 0; i < this.PointsList.length - 1; i++) {
      this.PixelList.push.apply(
        this.PixelList,
        Drawer.rasterization(this.PointsList[i], this.PointsList[i + 1])
      );
    }
    if (this.PointsList.length > 2) {
      this.PixelList.push.apply(
        this.PixelList,
        Drawer.rasterization(
          this.PointsList[0],
          this.PointsList[this.PointsList.length - 1]
        )
      );
    }
  }

  // Função que realizará todo o desenho
  DrawPoints() {
    // Limpar a lista de pixels de desenhos anteriores
    this.PixelList = [];
    this.DeterminePixels();

    const canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 400;

    const scannedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const scannedData = scannedImage.data;

    //Apagando desenhos anteriores
    for (let i = 0; i < canvas.width * canvas.height * 4; i++) {
      scannedData[i] = 0;
    }

    this.PixelList.forEach((Point) => {
      const PositionInCanvas =
        (Point.x + (canvas.height - Point.y) * canvas.width) * 4;
      scannedData[PositionInCanvas] = 255;
      scannedData[PositionInCanvas + 1] = 255;
      scannedData[PositionInCanvas + 2] = 255;
      scannedData[PositionInCanvas + 3] = 255;
    });

    scannedImage.data.set(scannedData);
    ctx.putImageData(scannedImage, 0, 0);
  }
}
