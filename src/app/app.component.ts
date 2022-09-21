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
  PixelSize = 1;
  Resolution = 500;

  PointsList: Point[] = []; //lista dos pontos de input (para resolução 500 x 500)
  PixelList: Point[] = []; //lista dos pontos escalados para a resolução selecionada

  ManipulatedPointslList: Point[] = [];

  Drawer = new Drawing();

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

  //Atualiza a variável que indica a resolução
  ChangeResolution(event) {
    var newResolution = Number(event.target.value);
    if (newResolution > 500) {
      alert('insira uma resolução menor do que 500!');
      event.target.value = this.Resolution;
      return;
    } else if (newResolution < 0) {
      alert('insira uma resolução maior do que 0!');
      event.target.value = this.Resolution;
      return;
    }
    //altera a resolução e desenha a tela novamente
    if (newResolution != 0) {
      this.Resolution = newResolution;
      this.PixelSize = Math.ceil(500 / this.Resolution);
      this.DrawPoints();
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
  DeterminePixelsForBiggerResolution() {
    //caso de apenas 1 ponto
    if (this.PointsList.length == 1) {
      this.PixelList.push(this.ManipulatedPointslList[0]);
    }

    //conecta todos os pontos em sequência
    for (let i = 0; i < this.PointsList.length - 1; i++) {
      this.PixelList.push.apply(
        this.PixelList,
        this.Drawer.lineRasterization(
          this.ManipulatedPointslList[i],
          this.ManipulatedPointslList[i + 1]
        )
      );
    }

    //fecha polígono
    if (this.PointsList.length > 2) {
      this.PixelList.push.apply(
        this.PixelList,
        this.Drawer.lineRasterization(
          this.ManipulatedPointslList[0],
          this.ManipulatedPointslList[this.PointsList.length - 1]
        )
      );
    }
  }

  // Função que realizará todo o desenho de um polígono
  DrawPoints() {
    // Limpar a lista de pixels de desenhos anteriores
    this.Drawer.pixelList = [];
    this.PixelList = [];
    this.ManipulatedPointslList = [];
    this.GeneratePointsInResolution(); //determina os pontos que vão ser rasterizados
    this.DeterminePixelsForBiggerResolution();

    const canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    //pega as imagem gerada pelo canvas
    const scannedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //pega os pixels da imagem
    const scannedData = scannedImage.data;

    //Apagando desenhos anteriores da imagem
    for (let i = 0; i < canvas.width * canvas.height * 4; i++) {
      scannedData[i] = 0;
    }

    var TemporaryPixelLenght = this.PixelList.length;
    for (var index = 0; index < TemporaryPixelLenght; index++) {
      const pixel = this.PixelList[index];

      //calcula coordenadas do pixel pequeno no canto inferior esquerdo que faz parte do pixel grande
      var px = this.PixelSize * pixel.x;
      var py = this.PixelSize * pixel.y;

      for (var x = 0; x < this.PixelSize; x++) {
        //acessa cada pixel pequeno que faz parte do pixel grande da resolução (forma o pixel da resolução)
        for (var y = 0; y < this.PixelSize; y++) {
          const PositionInCanvas =
            (px + x + (canvas.height - (py + y)) * canvas.width) * 4;
          scannedData[PositionInCanvas] = 255;
          scannedData[PositionInCanvas + 1] = 255;
          scannedData[PositionInCanvas + 2] = 255;
          scannedData[PositionInCanvas + 3] = 255;
          if (!this.PixelList.find(p => p.x === (x + px) && p.y === (y + py))){
            this.PixelList.push(new Point(px + x, py + y));
          }
        }
      }
    }

    this.Drawer.polygonRasterization(
      this.PixelList,
      this.PixelSize,
      canvas,
      scannedData
    );
    scannedImage.data.set(scannedData);
    ctx.putImageData(scannedImage, 0, 0);
  }

  //Pega os pontos na resolução 500 e altera para a resolução escolhida
  GeneratePointsInResolution() {
    this.ManipulatedPointslList = [];
    for (var index = 0; index < this.PointsList.length; index++) {
      const NewPoint = new Point(
        Math.ceil((this.PointsList[index].x * this.Resolution) / 500),
        Math.ceil((this.PointsList[index].y * this.Resolution) / 500)
      );
      this.ManipulatedPointslList[index] = NewPoint;
    }
  }
}
