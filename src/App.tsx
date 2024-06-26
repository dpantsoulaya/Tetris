import { ReactNode, useEffect, useRef, useState } from "react";
import bridge, { EAdsFormats } from "@vkontakte/vk-bridge";
import { useInterval } from "./helpers/useInterval";

import {
  SplitLayout,
  SplitCol,
  FixedLayout,
  Div,
  ButtonGroup,
  Group,
  Separator,
  RichCell,
  Placeholder,
  IconButton,
  Alert,
} from "@vkontakte/vkui";

import "./app.css";

import { Point } from "./types/point";
import { Block } from "./types/block";
import { FigureType } from "./types/figureType";
import {
  Icon48ArrowDownOutline,
  Icon48ArrowLeftOutline,
  Icon48ArrowRightOutline,
  Icon48Forward,
  Icon48Pause,
  Icon48Play,
} from "@vkontakte/icons";

const FIELD_SIZE_X = 10;
const FIELD_SIZE_Y = 20;
const BLOCK_SIZE = 25;

// Можно определять автоматически из enum,
// но т.к. вряд ли кол-во типов фигур поменяется, то для простоты так
const NUMBER_OF_FIGURE_TYPES = 7;

// Очки за заполненную линию
const SCORE_POINTS_FOR_LINE = 100;

// Скорость на уровнях
const speedForLevels = [7, 6, 5, 4, 3, 2, 1];

export const App = () => {
  const [currentFigure, setCurrentFigure] = useState<Block>({ points: [] });
  const [filledBlocks, setFilledBlocks] = useState<Block>({ points: [] });
  const [nextFigureType, setNextFigureType] = useState<FigureType>(FigureType.J);
  const [gameOver, setGameOver] = useState(false);
  const [pause, setPause] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [popout, setPopout] = useState<ReactNode | null>(null);
  const mainFieldRef = useRef<HTMLDivElement>(null);
  const [moveDownPressed, setMoveDownPressed] = useState(false);
  const iFreeTicks = useRef(0);

  function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  useInterval(() => {
    if (moveDownPressed) {
      moveDown();
    }

    if (iFreeTicks.current <= speedForLevels[level - 1]) {
      iFreeTicks.current++;
    } else {
      iFreeTicks.current = 0;
      moveDown();
    }
  }, 50);

  /**********************************
   * Загрузка страницы
   **********************************/
  useEffect(() => {
    const currentFigureType = randomIntFromInterval(1, NUMBER_OF_FIGURE_TYPES);
    startNewFigure(currentFigureType);
    setNextFigureType(randomIntFromInterval(1, NUMBER_OF_FIGURE_TYPES));

    mainFieldRef.current?.focus();

    // Отправляет событие инициализации нативному клиенту
    bridge.send("VKWebAppInit");
  }, []);

  /***********************************
   * Закрыть всплывающее окно
   ***********************************/
  const closePopout = () => {
    setPopout(null);
  };

  const resetAll = () => {
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setFilledBlocks({ points: [] });
    const currentFigureType = randomIntFromInterval(1, NUMBER_OF_FIGURE_TYPES);
    startNewFigure(currentFigureType);
    setNextFigureType(randomIntFromInterval(1, NUMBER_OF_FIGURE_TYPES));
    setPopout(null);
    setPause(false);
  };

  /**********************************
   * Запуск новой игры
   **********************************/
  const restart = () => {
    // Проверка к готовности рекламы к показу.
    bridge.send("VKWebAppCheckNativeAds", { ad_format: EAdsFormats.INTERSTITIAL });

    setPause(true);
    setPopout(
      <Alert
        actions={[
          {
            title: "Начать новую игру",
            mode: "destructive",
            action: () => {
              // Показать рекламу
              try {
                bridge
                  .send("VKWebAppShowNativeAds", { ad_format: EAdsFormats.INTERSTITIAL })
                  .then(() => {})
                  .catch((error) => {
                    console.log(error); /* Ошибка */
                  })
                  .finally(() => {
                    resetAll();
                  });
              } catch (exception) {
                console.log(exception);
                resetAll();
              }
            },
          },
          {
            title: "Отмена",
            mode: "cancel",
          },
        ]}
        actionsLayout="vertical"
        onClose={closePopout}
        header="Начало новой игры"
        text="Весь текущий прогресс будет потерян. Вы уверены, что хотите начать новую игру?"
      />
    );
  };

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
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: -1 },
          { x: 1, y: -2 },
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
    if (gameOver || pause) return;

    const touchedLeftWall = currentFigure.points.filter((p) => p.x === 0).length > 0;
    const touchedFilledBlock =
      currentFigure.points.filter(
        (p) => filledBlocks.points.filter((fp) => fp.y === p.y && fp.x === p.x - 1).length > 0
      ).length > 0;

    if (touchedLeftWall || touchedFilledBlock) {
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
    if (gameOver || pause) return;

    const touchedRightWall = currentFigure.points.filter((p) => p.x == FIELD_SIZE_X - 1).length > 0;
    const touchedFilledBlock =
      currentFigure.points.filter(
        (p) => filledBlocks.points.filter((fp) => fp.y === p.y && fp.x === p.x + 1).length > 0
      ).length > 0;

    if (touchedRightWall || touchedFilledBlock) {
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
    if (gameOver || pause) return;

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

    // Если при повороте фигура касается левой или правой стенки, то не надо её поворачивать
    if (new_points.filter((p) => p.x < 0 || p.x >= FIELD_SIZE_X || p.y >= FIELD_SIZE_Y).length > 0) {
      return;
    }

    // если повороту фигуры мешают занятые блоки, то не надо её поворачивать
    if (new_points.filter((p) => filledBlocks.points.filter((f) => f.x == p.x && f.y == p.y).length > 0).length > 0) {
      return;
    }

    setCurrentFigure((prev) => {
      return { points: new_points, figureType: prev.figureType };
    });
  };

  /**********************************
   * Убрать заполненные линии
   * Рекурсивная функция
   * ***********************************/
  const removeFilledLines = () => {
    // Будем удалять по одной линии за раз
    // Есть ли полностью заполненные линии?
    let line = 0;
    for (; line < FIELD_SIZE_Y; line++) {
      if (filledBlocks.points.filter((p) => p.y === line).length === FIELD_SIZE_X) {
        // Линия заполнена
        break;
      }
    }

    if (line === FIELD_SIZE_Y) return;

    // Есть линия, которую можно удалить. Оставляем в покое точки под линией
    let newPoints = [...filledBlocks.points.filter((p) => p.y > line)];

    // Все точки, которые выше линии, которую необходимо удалить.
    // Сортируем, чтобы нижние точки обрабатывались первыми (чтобы верхним было куда падать)
    const upperPoints = filledBlocks.points.filter((p) => p.y < line).sort((a, b) => b.y - a.y);

    newPoints = [
      ...newPoints,
      ...upperPoints.map((u) => {
        return { x: u.x, y: u.y + 1 };
      }),
    ];

    setFilledBlocks({ points: [...newPoints] });

    // добавляем очки
    setScore((prev) => prev + SCORE_POINTS_FOR_LINE);
  };

  const onTouchStart = () => {
    setMoveDownPressed(true);
  };

  const onTouchEnd = () => {
    setMoveDownPressed(false);
  };

  /*********************************
   * Текущая фигура двигается вниз
   ***********************************/
  const moveDown = () => {
    if (gameOver || pause) return;

    // блок дошёл до конца
    const figureTouchedBottom = currentFigure.points.filter((p) => p.y >= FIELD_SIZE_Y - 1).length > 0;
    const figureTouchedFilledBlock =
      currentFigure.points.filter((p) => filledBlocks.points.filter((b) => b.y === p.y + 1 && b.x === p.x).length > 0)
        .length > 0;

    if (figureTouchedBottom || figureTouchedFilledBlock) {
      // проверяем, не проиграли ли мы
      if (figureTouchedFilledBlock && currentFigure.points.filter((p) => p.y <= 0).length > 0) {
        setGameOver(true);
        return;
      }

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

  /**********************************
   * Игрок проиграл
   **********************************/
  useEffect(() => {}, [gameOver]);

  /********************************
   * Изменился счёт
   *********************************/
  useEffect(() => {
    if (level < 2 && score >= 1000 && score < 2000) {
      setLevel(2);
    } else if (level < 3 && score >= 2000 && score < 3000) {
      setLevel(3);
    } else if (level < 4 && score >= 3000 && score < 5000) {
      setLevel(4);
    } else if (level < 4 && score >= 5000 && score < 6000) {
      setLevel(5);
    } else if (level < 4 && score >= 6000 && score < 7000) {
      setLevel(6);
    } else if (level < 4 && score >= 7000 && score < 8000) {
      setLevel(7);
    } else if (level < 4 && score >= 8000) {
      setLevel(8);
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
    if (gameOver) return;
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
          key={randomIntFromInterval(1, 100000000)}
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
        key={randomIntFromInterval(1, 100000000)}
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
  }, [currentFigure, pause, gameOver]);

  /***************************
   * Запуск таймера
   * TODO: таймер надо реализовать иначе, чтобы при нажатии кнопок он не сбрасывался
   * например, запоминать остаток времени в ref, чтобы оно пережило перезагрузку страницы
   ***************************/
  // useEffect(() => {
  //   if (pause || gameOver) return;

  //   const timeoutDown = setTimeout(() => {
  //     moveDown();
  //   }, speedForLevels[level - 1]);

  //   return () => {
  //     clearTimeout(timeoutDown);
  //   };
  // }, [currentFigure, pause, gameOver]);

  /**************************
   * Игровое поле
   *************************/
  const blocks = () => {
    const divs = new Array(FIELD_SIZE_X * FIELD_SIZE_Y);

    for (let i = 0; i < FIELD_SIZE_Y; i++) {
      for (let j = 0; j < FIELD_SIZE_X; j++) {
        divs.push(
          <div
            className="fieldBlock"
            key={randomIntFromInterval(1, 100000000)}
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
            key={randomIntFromInterval(1, 100000000)}
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
          key={randomIntFromInterval(1, 100000000)}
          style={{ top: p.y * BLOCK_SIZE, left: p.x * BLOCK_SIZE }}></div>
      );
    });
  };

  return (
    <SplitLayout popout={popout}>
      {/* Часть с полем для тетриса */}
      <SplitCol className="rightColumn">
        <div className="mainField">
          {blocks()}
          {drawCurrentFigure()}
          {drawFilledBlocks()}
        </div>
        {pause && !gameOver && (
          <Div className="pauseDiv">
            <span>Пауза</span>
          </Div>
        )}
        {gameOver && (
          <Div className="gameOverDiv">
            <span>GAME OVER</span>
          </Div>
        )}
      </SplitCol>

      {/* Правая часть */}
      <SplitCol>
        <Div className="rightSection">
          <Group>
            <RichCell bottom={<Div className="levelsDiv">{level}</Div>}>Уровень</RichCell>
            <Separator />
            <RichCell bottom={<Div className="scoreDiv">{score}</Div>}>Счёт</RichCell>

            <div className="hideOnSmallPhones">
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
            </div>
          </Group>
          {/* 
          <Separator />
          <img
            src={imagesForLevels[level - 1]}
            style={{ marginTop: "20px", height: "200px" }}
            alt="изображение уровня"
          />
          */}
        </Div>
      </SplitCol>

      {/* Нижняя часть с кнопками управления */}
      <FixedLayout vertical="bottom" filled className="controlsSection">
        <SplitLayout>
          <SplitCol style={{ textAlign: "center" }}>
            <ButtonGroup>
              <IconButton label="Двигать влево" onClick={moveLeft}>
                <Icon48ArrowLeftOutline className="button" />
              </IconButton>
              <IconButton
                label="Двигать вниз"
                onMouseDown={onTouchStart}
                onMouseUp={onTouchEnd}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onClick={moveDown}>
                <Icon48ArrowDownOutline className="button" />
              </IconButton>
              <IconButton label="Двигать вправо" onClick={moveRight}>
                <Icon48ArrowRightOutline className="button" />
              </IconButton>
              <IconButton label="Рестарт" onClick={restart}>
                <Icon48Play className="button" />
              </IconButton>
              <IconButton label="Пауза" onClick={pauseGame}>
                <Icon48Pause className="button" />
              </IconButton>
              <IconButton label="Повернуть" onClick={rotate}>
                <Icon48Forward className="button" />
              </IconButton>
            </ButtonGroup>
          </SplitCol>
        </SplitLayout>
      </FixedLayout>
    </SplitLayout>
  );
};
