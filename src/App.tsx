import { useEffect, useState } from "react";
import {
  SplitLayout,
  SplitCol,
  FixedLayout,
  Div,
  Button,
  ButtonGroup,
  Group,
  Separator,
  Card,
  Image,
  RichCell,
  Placeholder,
} from "@vkontakte/vkui";

import "./app.css";

import { Point } from "./types/point";
import { Block } from "./types/block";
import { FigureType } from "./types/figureType";

const FIELD_SIZE_X = 10;
const FIELD_SIZE_Y = 20;
const BLOCK_SIZE = 25;

// Можно определять автоматически из enum,
// но т.к. вряд ли кол-во типов фигур поменяется, то для простоты так
const NUMBER_OF_FIGURE_TYPES = 7;

// Очки за заполненную линию
const SCORE_POINTS_FOR_LINE = 100;

export const App = () => {
  const [currentFigure, setCurrentFigure] = useState<Block>({ points: [] });
  const [filledBlocks, setFilledBlocks] = useState<Block>({ points: [] });
  const [nextFigureType, setNextFigureType] = useState<FigureType>(FigureType.J);
  const [gameOver, setGameOver] = useState(false);
  const [pause, setPause] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState(700);
  const [image, setImage] = useState("level1.jpg");

  function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**********************************
   * Загрузка страницы
   **********************************/
  useEffect(() => {
    const currentFigureType = randomIntFromInterval(1, NUMBER_OF_FIGURE_TYPES);
    startNewFigure(currentFigureType);
    setNextFigureType(randomIntFromInterval(1, NUMBER_OF_FIGURE_TYPES));
  }, []);

  /******************************************
   * Создать новую фигуру
   * Тип фигуры: линия, кубик, _!_, -_, Г, L
   *********************************************/
  const createFigure = (figureType: FigureType) => {
    let points: Point[];

    switch (figureType) {
      case FigureType.Line:
        points = [
          { x: 0, y: 0 },
          { x: 0, y: -1 },
          { x: 0, y: -2 },
          { x: 0, y: -3 },
        ];
        break;
      case FigureType.Square:
        points = [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: -1 },
          { x: 1, y: -1 },
        ];
        break;
      case FigureType.T:
        points = [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: -1 },
          { x: 2, y: 0 },
        ];
        break;
      case FigureType.S:
        points = [
          { x: 0, y: -1 },
          { x: 1, y: -1 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ];
        break;
      case FigureType.Z:
        points = [
          { x: 0, y: -1 },
          { x: 1, y: -1 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ];
        break;
      case FigureType.J:
        points = [
          { x: 0, y: 0 },
          { x: 0, y: -1 },
          { x: 0, y: -2 },
          { x: 1, y: -2 },
        ];
        break;
      case FigureType.L:
        points = [
          { x: -1, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: -1 },
          { x: 0, y: -2 },
        ];
        break;
      default:
        console.log(`Ошибка: несуществующий номер фигуры: ${figureType}`);
        return;
    }

    return points;
  };

  /***************************************
   * Запустить новую фигуру
   ******************************************/
  const startNewFigure = (figureType: FigureType) => {
    let points = createFigure(figureType);
    if (points === undefined) return;

    // Добавляем по горизонтали случайное число
    const maxPointX = points.map((p) => p.x).sort()[points.length - 1];
    const randomX = randomIntFromInterval(0, FIELD_SIZE_X - maxPointX - 1);

    points = points.map((p) => {
      return { x: p.x + randomX, y: p.y };
    });

    setCurrentFigure({
      points: points,
      figureType: figureType,
    });
  };

  /**********************************
   * Подвинуть влево
   ***********************************/
  const moveLeft = () => {
    if (currentFigure.points.filter((p) => p.x == 0).length > 0) {
      return;
    }

    const new_points: Point[] = currentFigure.points.map((p) => {
      return { x: p.x - 1, y: p.y };
    });
    setCurrentFigure((prev) => {
      return { points: new_points, figureType: prev.figureType };
    });
  };

  /********************************
   * Подвинуть вправо
   ********************************/
  const moveRight = () => {
    if (currentFigure.points.filter((p) => p.x == FIELD_SIZE_X - 1).length > 0) {
      return;
    }

    const new_points: Point[] = currentFigure.points.map((p) => {
      return { x: p.x + 1, y: p.y };
    });
    setCurrentFigure((prev) => {
      return { points: new_points, figureType: prev.figureType };
    });
  };

  /**********************************
   * Поворот блока
   * ******************************/
  const rotate = () => {
    // квадрат не нужно поворачивать
    if (currentFigure.figureType === 2) {
      return;
    }

    // Поворачиваем на 90 градусов относительно второй точки в фигуре
    const avg_x = currentFigure.points[1].x;
    const avg_y = currentFigure.points[1].y;

    const new_points: Point[] = currentFigure.points.map((p) => {
      if (p.x == avg_x && p.y == avg_y) {
        return { x: avg_x, y: avg_y };
      } else if (p.x == avg_x && p.y < avg_y) {
        return { x: p.x + (avg_y - p.y), y: avg_y };
      } else if (p.x == avg_x && p.y > avg_y) {
        return { x: p.x - (p.y - avg_y), y: avg_y };
      } else if (p.x < avg_x && p.y == avg_y) {
        return { x: avg_x, y: p.y - (avg_x - p.x) };
      } else if (p.x < avg_x && p.y < avg_y) {
        return { x: p.x + (avg_y - p.y) + (avg_x - p.x), y: p.y };
      } else if (p.x < avg_x && p.y > avg_y) {
        return { x: p.x, y: p.y - (avg_x - p.x) - (p.y - avg_y) };
      } else if (p.x > avg_x && p.y == avg_y) {
        return { x: avg_x, y: p.y + (p.x - avg_x) };
      } else if (p.x > avg_x && p.y < avg_y) {
        return { x: p.x, y: p.y + (p.x - avg_x) + (avg_y - p.y) };
      } else if (p.x > avg_x && p.y > avg_y) {
        return { x: p.x - (p.y - avg_y) - (p.x - avg_x), y: p.y };
      } else {
        return { x: p.x, y: p.y };
      }
    });

    if (new_points.filter((p) => p.x < 0 || p.x >= FIELD_SIZE_X).length > 0) {
      return;
    }

    setCurrentFigure((prev) => {
      return { points: new_points, figureType: prev.figureType };
    });
  };

  function onlyUnique(value: number, index: number, array: number[]) {
    return array.indexOf(value) === index;
  }

  // Удалить точку из массива
  function removePoint(arr: Point[], point: Point) {
    const index = arr.indexOf(point);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  /**********************************
   * Убрать заполненные линии
   * Рекурсивная функция
   * ***********************************/
  const removeFilledLines = (): boolean => {
    const linesToRemove: number[] = [];

    // Есть ли полностью заполненные линии?
    filledBlocks.points
      .map((p1) => p1.y)
      .filter(onlyUnique)
      .forEach((line) => {
        if (filledBlocks.points.filter((p) => p.y === line).length === FIELD_SIZE_X) {
          // Линия заполнена
          linesToRemove.push(line);
        }
      });

    if (linesToRemove.length == 0) return false;

    // Есть линии, которые можно удалить. Все точки, расположенные над этими линиями, опускаем вниз
    let newPoints = [...filledBlocks.points.filter((p) => !linesToRemove.includes(p.y))];

    linesToRemove.forEach((line) => {
      // Все точки, которые выше линии, которую необходимо удалить.
      // Сортируем, чтобы нижние точки обрабатывались первыми (чтобы верхним было куда падать)
      const upperPoints = filledBlocks.points.filter((p) => p.y < line).sort((a, b) => b.y - a.y);

      upperPoints.forEach((upperPoint) => {
        // Удаляем из newPoints эту точку
        newPoints = removePoint(newPoints, upperPoint);
        upperPoint.y++;
        // Опускаем точку до тех пор, пока она не коснется конца или другой точки
        // while (
        //   upperPoint.y < FIELD_SIZE_Y - 1 &&
        //   newPoints.filter((p) => upperPoint.x === p.x && upperPoint.y < p.y - 1).length === 0
        // ) {
        //   upperPoint.y++;
        // }
        // добавляем обновленную точку
        newPoints = [...newPoints, upperPoint];
      });
    });

    setFilledBlocks({ points: [...newPoints] });

    // добавляем очки
    setScore((prev) => prev + linesToRemove.length * SCORE_POINTS_FOR_LINE);

    // рекурсивно вызвать removeFilledLines
    while (removeFilledLines());

    return true;
  };

  /*********************************
   * Текущая фигура двигается вниз
   ***********************************/
  const moveDown = () => {
    // блок дошёл до конца
    if (
      currentFigure.points.filter(
        (p) => filledBlocks.points.filter((b) => b.y == p.y + 1 && b.x == p.x).length > 0 || p.y >= FIELD_SIZE_Y - 1
      ).length > 0
    ) {
      // добавляем данные блока в filledBlocks
      setFilledBlocks({ points: [...filledBlocks.points, ...currentFigure.points] });

      // запускаем новую фигуру
      startNewFigure(nextFigureType);
      setNextFigureType(randomIntFromInterval(1, NUMBER_OF_FIGURE_TYPES));

      return;
    }

    const new_points: Point[] = currentFigure.points.map((p) => {
      return { x: p.x, y: p.y + 1 };
    });

    setCurrentFigure((prev) => {
      return { points: new_points, figureType: prev.figureType };
    });
  };

  /********************************
   * Изменился счёт
   *********************************/
  useEffect(() => {
    if (score === 300) {
      setLevel(2);
      setSpeed(500);
      setImage("level2.jpg");
    } else if (score === 700) {
      setLevel(3);
      setSpeed(300);
      setImage("level3.jpg");
    } else if (score === 1000) {
      setLevel(4);
      setSpeed(100);
      setImage("level4.jpg");
    }
  }, [score]);

  /***************************
   * Изменились заполненные поля
   ***************************/
  useEffect(() => {
    // Проверяем, можем ли убрать какие-то линии
    removeFilledLines();
  }, [filledBlocks]);

  /*************************
   * Поставить игру на паузу
   ************************/
  const pauseGame = () => {
    setPause((prev) => !prev);
  };

  /************************************
   * Нарисовать текущую фигуру
   ***********************************/
  const drawCurrentFigure = () => {
    return currentFigure.points
      .filter((p) => p.y >= 0)
      .map((p) => (
        <div
          key={100 * (p.y * BLOCK_SIZE + p.x)}
          className="currentFigureBlock"
          style={{ top: p.y * BLOCK_SIZE, left: p.x * BLOCK_SIZE }}></div>
      ));
  };

  /*************************************
   * Нарисовать на поле закрашенные блоки
   ************************************/
  const drawFilledBlocks = () => {
    return filledBlocks.points.map((f) => (
      <div
        key={300 * (f.y * BLOCK_SIZE + f.x)}
        className="filledBlock"
        style={{ top: f.y * BLOCK_SIZE, left: f.x * BLOCK_SIZE }}></div>
    ));
  };

  /***********************
   * Обработка нажатия кнопок
   * *************************/
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key == "ArrowLeft") {
        event.preventDefault();
        moveLeft();
      } else if (event.key == "ArrowRight") {
        event.preventDefault();
        moveRight();
      } else if (event.key == "ArrowDown") {
        event.preventDefault();
        moveDown();
      } else if (event.key == " ") {
        event.preventDefault();
        rotate();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentFigure]);

  /***************************
   * Запуск таймера
   * TODO: таймер надо реализовать иначе, чтобы при нажатии кнопок он не сбрасывался
   * например, запоминать остаток времени в ref, чтобы оно пережило перезагрузку страницы
   ***************************/
  useEffect(() => {
    if (pause) return;

    const timeoutDown = setTimeout(() => {
      moveDown();
    }, speed);

    return () => {
      clearTimeout(timeoutDown);
    };
  }, [currentFigure, pause]);

  const blocks = () => {
    const divs = new Array(FIELD_SIZE_X * FIELD_SIZE_Y);

    for (let i = 0; i < FIELD_SIZE_Y; i++) {
      for (let j = 0; j < FIELD_SIZE_X; j++) {
        divs.push(
          <div
            className="fieldBlock"
            key={i * BLOCK_SIZE + j}
            style={{ top: i * BLOCK_SIZE, left: j * BLOCK_SIZE }}></div>
        );
      }
    }

    return divs;
  };

  /***********************************
   * Поле для следующей фигуры
   ***********************************/
  const drawNextField = () => {
    const NEXT_FIELD_X = 4;
    const NEXT_FIELD_Y = 4;

    const divs = new Array(NEXT_FIELD_X * NEXT_FIELD_Y);

    for (let i = 0; i < NEXT_FIELD_Y; i++) {
      for (let j = 0; j < NEXT_FIELD_X; j++) {
        divs.push(
          <div
            className="nextBlock"
            key={i * BLOCK_SIZE + j}
            style={{ top: i * BLOCK_SIZE, left: j * BLOCK_SIZE }}></div>
        );
      }
    }

    return divs;
  };

  /*********************************
   * Следующая фигура
   ******************************* */
  const drawNextFigure = () => {
    const figureType = nextFigureType;

    let points = createFigure(figureType);

    if (points === undefined || points === null || points.length === 0)
      return <Placeholder>Не удалось создать фигуру</Placeholder>;

    points = points.map((p) => {
      switch (figureType) {
        case FigureType.Line:
          return { x: p.x + 1, y: p.y + 3 };
        case FigureType.Square:
          return { x: p.x + 1, y: p.y + 2 };
        case FigureType.T:
          return { x: p.x + 0, y: p.y + 2 };
        case FigureType.S:
          return { x: p.x + 0, y: p.y + 2 };
        case FigureType.Z:
          return { x: p.x + 0, y: p.y + 2 };
        case FigureType.L:
          return { x: p.x + 2, y: p.y + 2 };
        case FigureType.J:
          return { x: p.x + 1, y: p.y + 3 };
      }
    });

    return points.map((p) => {
      return (
        <div
          className="nextFigureBlock"
          key={100 * (p.y * BLOCK_SIZE + p.x)}
          style={{ top: p.y * BLOCK_SIZE, left: p.x * BLOCK_SIZE }}></div>
      );
    });
  };

  return (
    <SplitLayout>
      {/* Часть с полем для тетриса */}
      <SplitCol style={{ backgroundColor: "goldenrod" }} fixed width="370px" maxWidth="370px">
        <Div className="mainField">
          {blocks()}
          {drawCurrentFigure()}
          {drawFilledBlocks()}
        </Div>
      </SplitCol>

      {/* Правая часть */}
      <SplitCol style={{ backgroundColor: "hotpink" }}>
        <Group>
          <RichCell bottom={<Div>{level}</Div>}>Уровень</RichCell>
          <Separator />
          <RichCell bottom={<Div>{score}</Div>}>Счёт</RichCell>
          <Separator />
          <RichCell
            bottom={
              <Div className="nextField">
                {drawNextField()}
                {drawNextFigure()}
              </Div>
            }>
            Следующая
          </RichCell>
        </Group>
        <Card style={{ padding: "20px" }}>
          <Image src={`src/assets/${image}`} alt="изображение уровня" size={300} />
        </Card>
      </SplitCol>

      {/* Нижняя часть с кнопками управления */}
      <FixedLayout vertical="bottom" filled style={{ backgroundColor: "blueviolet", height: "100px" }}>
        <ButtonGroup>
          <Button onClick={moveLeft}>Влево</Button>
          <Button onClick={rotate}>Повернуть</Button>
          <Button onClick={moveRight}>Вправо</Button>
        </ButtonGroup>

        <Button onClick={pauseGame}>Пауза</Button>
      </FixedLayout>
    </SplitLayout>
  );
};
