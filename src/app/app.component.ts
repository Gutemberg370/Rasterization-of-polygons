import { Component, OnInit } from '@angular/core';
import { Point } from 'src/app/Definitions and Logic/PointDefinition';
import { Drawing } from './Definitions and Logic/Drawing';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{
  ValidResolution = true;

  NumberOfPoints = 2;
  PixelSize = 1;
  Resolution = 500;

  PointsList: Point[] = []; //lista dos pontos de input (para resolução 500 x 500)
  PixelList: Point[] = []; //lista dos pontos escalados para a resolução selecionada

  ManipulatedPointslList: Point[] = [];

  Drawer = new Drawing();

  scannedData;

  ngOnInit(){
    this.ResetCanvas();
  }

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
    const normalX = event.target.value/500;
    this.PointsList[position].x = normalX ;
  }

  // Determinar a posição y de um ponto vindo do input
  ChangeYPointPosition(event, position: number) {
    const normalY = event.target.value/500;
    this.PointsList[position].y = normalY;
  }

  //Atualiza a variável que indica a resolução
  ChangeResolution() {

    let newResolution = Number((<HTMLInputElement>document.getElementById("inputResolution")).value);
    if (newResolution > 500) {
      alert('insira uma resolução menor do que 500!');
      this.ValidResolution = false;
      return;
    } else if (newResolution < 50) {
      alert('insira uma resolução maior do que 50!');
      this.ValidResolution = false;
      return;
    }
    //altera a resolução
    if (newResolution < 501 && newResolution > 49) {
      this.ValidResolution = true;
      this.Resolution = newResolution;
      this.PixelSize = Math.floor(500 / this.Resolution);
    }
  }

  //Pega os pontos na resolução 500 e altera para a resolução escolhida
  GeneratePointsInResolution() {
    this.ManipulatedPointslList = [];
    let xInResolution;
    let yInResolution;
    for (let index = 0; index < this.PointsList.length; index++) {
      xInResolution = ((this.PointsList[index].x + 1) / 2) * this.Resolution;
      yInResolution = ((this.PointsList[index].y + 1) / 2) * this.Resolution;
      const NewPoint = new Point(xInResolution, yInResolution);
      this.ManipulatedPointslList[index] = NewPoint;
    }
  }

  // Determinar os pixels correspondentes entre cada dois pontos da lista de pontos
  DeterminePixelsForBiggerResolution() {
    this.Drawer.pixelList = [];
    this.PixelList = [];
    //caso de apenas 1 ponto
    if (this.PointsList.length == 1) {
      this.Drawer.produceFragment(this.ManipulatedPointslList[0]);
      this.PixelList.push.apply(this.PixelList,this.Drawer.pixelList);
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

  // Adequar cada pixel para o PixelSize calculado
  GeneratePixelsInPixelSize(Canvas){
    let PixelsPainted : Point[] = [];

    for (let index = 0; index < this.PixelList.length; index++) {
      const pixel = this.PixelList[index];

      //calcula coordenadas do pixel pequeno no canto inferior esquerdo que faz parte do pixel grande
      let px = this.PixelSize * pixel.x;
      let py = this.PixelSize * pixel.y;

      for (let y = 0; y < this.PixelSize; y++) {
        //acessa cada pixel pequeno que faz parte do pixel grande da resolução (forma o pixel da resolução)
        for (let x = 0; x < this.PixelSize; x++) {
          const PositionInCanvas =
            (px + x + (Canvas.height - (py + y)) * Canvas.width) * 4;
          this.scannedData[PositionInCanvas] = 255;
          this.scannedData[PositionInCanvas + 1] = 255;
          this.scannedData[PositionInCanvas + 2] = 255;
          this.scannedData[PositionInCanvas + 3] = 255;

          if (!PixelsPainted.find(p => p.x === (x + px) && p.y === (y + py))){
            PixelsPainted.push(new Point((px + x), (py + y)));
          }
        }
      }
    }

    this.PixelList = PixelsPainted;
  }

  // Função que realizará todo o desenho de um polígono
  DrawFigures() {

    if(this.ValidResolution){
      this.GeneratePointsInResolution(); //determina os pontos que vão ser rasterizados
      this.DeterminePixelsForBiggerResolution();

      const canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 500;
      canvas.height = 500;

      //pega a imagem gerada pelo canvas
      const scannedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

      this.GeneratePixelsInPixelSize(canvas);

      this.Drawer.polygonRasterization(
        this.PixelList,
        canvas,
        this.scannedData
      );

      scannedImage.data.set(this.scannedData);
      ctx.putImageData(scannedImage, 0, 0);
    }

  }

  ResetCanvas(){
    const canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;
    const scannedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.scannedData = scannedImage.data;
  }


}
