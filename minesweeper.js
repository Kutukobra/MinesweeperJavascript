const SCREEN = {
    WIDTH   : 800,
    HEIGHT  : 800
};

const GRID_COUNT = {
    WIDTH   : 10,
    HEIGHT  : 10,
};

const numberColor = [
    "#45f542",
    "#42f5e9",
    "#42a1f5",
    "#4b42f5",
    "#7b42f5",
    "#d142f5",
    "#f542d1",
    "#f59c42",
    "#f55d42",
];

window.onload = () => 
{
    let canv = document.getElementById("cnv");
    canv.height = SCREEN.HEIGHT;
    canv.width  = SCREEN.WIDTH;

    let mousePosition = {};

    // Get mouse position
    canv.addEventListener("mousemove", (event) => {
        let rect = canv.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        mousePosition = {x, y};
    }); 

    ctx = canv.getContext("2d");

    let GRID_SIZE = {
        WIDTH : SCREEN.WIDTH / GRID_COUNT.WIDTH,
        HEIGHT : SCREEN.HEIGHT / GRID_COUNT.HEIGHT
    };

    const directions = [
        {x : 0, y : 1},
        {x : -1, y : 1},
        {x : -1, y : 0},
        {x : -1, y : -1},
        {x : 0, y : -1},
        {x : 1, y : -1},
        {x : 1, y : 0},
        {x : 1, y : 1}
    ];

    class Grid {
        constructor()
        {
            this.isOpened = false;
            this.isBomb = false;
            this.bombCount = 0;
            this.isFlagged = false;
        }

        Flag()
        {
            this.isFlagged = !this.isFlagged;
        }
    };
    
    let grid = new Array(GRID_COUNT.WIDTH);
    for (let x = 0; x < GRID_COUNT.HEIGHT; x++)
    {
        grid[x] = new Array(GRID_COUNT.HEIGHT);
        for (let y = 0; y < GRID_COUNT.HEIGHT; y++)
        {
            grid[x][y] = new Grid();
        }
    }

    function revealGrid(x, y)
    {
        grid[x][y].isOpened = true;

        if (grid[x][y].isBomb)
        {
            for (let x = 0; x < GRID_COUNT.WIDTH; x++)
            {
                for (let y = 0; y < GRID_COUNT.HEIGHT; y++)
                {
                    if (grid[x][y].isBomb)
                        grid[x][y].isOpened = true;
                }
            }

            alert("Game Over");
        }

        if (grid[x][y].bombCount != 0)
            return;

        for (const direction of directions)
        {
            let check = {
                x : x + direction.x,
                y : y + direction.y
            };

            if (check.x < 0 || check.x >= GRID_COUNT.WIDTH || check.y < 0 || check.y >= GRID_COUNT.HEIGHT)
                continue;

            if (grid[check.x][check.y].isOpened == false && grid[check.x][check.y].isBomb == false)
            {
                revealGrid(check.x, check.y);
            }
        }
    }

    // Mouse on click.
    canv.addEventListener("mousedown", (event) => {
        if (event.button != 0)
            return;


        let gridPosition = {
            x : Math.floor(mousePosition.x / GRID_SIZE.WIDTH),
            y : Math.floor(mousePosition.y / GRID_SIZE.HEIGHT)
        };
        revealGrid(gridPosition.x, gridPosition.y);
    }); 

    canv.addEventListener("contextmenu", (event) => {
        event.preventDefault();

        let gridPosition = {
            x : Math.floor(mousePosition.x / GRID_SIZE.WIDTH),
            y : Math.floor(mousePosition.y / GRID_SIZE.HEIGHT)
        };

        grid[gridPosition.x][gridPosition.y].Flag();
    }); 

    let bombCount = Math.floor(0.1 * GRID_COUNT.WIDTH * GRID_COUNT.HEIGHT);

    for (let i = 0; i < bombCount; i++)
    {
        let x = Math.floor(Math.random() * GRID_COUNT.WIDTH);
        let y = Math.floor(Math.random() * GRID_COUNT.HEIGHT);

        grid[x][y].isBomb = true;
    }

    for (let x = 0; x < GRID_COUNT.WIDTH; x++)
    {
        for (let y = 0; y < GRID_COUNT.HEIGHT; y++)
        {
            for (const direction of directions)
            {
                let check = {
                    x : x + direction.x,
                    y : y + direction.y
                };

                if (check.x < 0 || check.x >= GRID_COUNT.WIDTH || check.y < 0 || check.y >= GRID_COUNT.HEIGHT)
                    continue;
                
                if (grid[check.x][check.y].isBomb)
                    grid[x][y].bombCount++;
            }
        }
    }
    
    function mouseInside(position)
    {
        return mousePosition.x >= position.x + 0.5 
                    && mousePosition.x <= position.x + GRID_SIZE.WIDTH - 0.5
                    && mousePosition.y >= position.y + 0.5
                    && mousePosition.y <= position.y + GRID_SIZE.HEIGHT - 0.5
    }

    function drawGrid()
    {
        ctx.fillStyle = "black";
        for (let x = 0; x < GRID_COUNT.WIDTH; x++)
        {
            for (let y = 0; y < GRID_COUNT.HEIGHT; y++)
            {
                let position = {
                    x : x * GRID_SIZE.WIDTH,
                    y : y * GRID_SIZE.HEIGHT
                };
                ctx.fillRect(position.x + 0.5, position.y + 0.5, GRID_SIZE.WIDTH - 1, GRID_SIZE.HEIGHT - 1);
            }
        }
    }

    function drawNumbers()
    {
        for (let x = 0; x < GRID_COUNT.WIDTH; x++)
        {
            for (let y = 0; y < GRID_COUNT.HEIGHT; y++)
            {
                let position = {
                    x : x * GRID_SIZE.WIDTH,
                    y : y * GRID_SIZE.HEIGHT
                };

                if (grid[x][y].isBomb)
                {
                    ctx.fillStyle = "red";
                    ctx.beginPath();
                    ctx.arc((x + 0.5) * GRID_SIZE.WIDTH, (y + 0.5) * GRID_SIZE.HEIGHT, GRID_SIZE.WIDTH / 2 - 3, 0, Math.PI * 2);
                    ctx.fill();
                    continue;
                }

                let bombCount = grid[x][y].bombCount;
                if (bombCount == 0)
                    continue;
                
                ctx.fillStyle = numberColor[bombCount];
                ctx.font = (GRID_SIZE.WIDTH - 1).toString() + "px Arial";
                ctx.fillText(bombCount, position.x + 8  , position.y + GRID_SIZE.HEIGHT - 5, GRID_SIZE.WIDTH - 2);
            }
        }
    }

    function drawCover()
    {
        for (let x = 0; x < GRID_COUNT.WIDTH; x++)
        {
            for (let y = 0; y < GRID_COUNT.HEIGHT; y++)
            {
                let position = {
                    x : x * GRID_SIZE.WIDTH,
                    y : y * GRID_SIZE.HEIGHT
                };

                if (grid[x][y].isOpened)
                    continue;
                
                if (mouseInside(position))
                {
                    ctx.fillStyle = "#969590";
                }
                else
                {
                    ctx.fillStyle = "#134205";
                }

                ctx.fillRect(position.x + 0.5, position.y + 0.5, GRID_SIZE.WIDTH - 1, GRID_SIZE.HEIGHT - 1);

                if (grid[x][y].isFlagged)
                {
                    ctx.fillStyle = "orange";
                    ctx.fillText("F", position.x + 8  , position.y + GRID_SIZE.HEIGHT - 5, GRID_SIZE.WIDTH - 2);
                }
            }
        }
    }

    function checkWinningCondition()
    {
        for (let x = 0; x < GRID_COUNT.WIDTH; x++)
        {
            for (let y = 0; y < GRID_COUNT.HEIGHT; y++)
            {
                if (!grid[x][y].isOpened && !grid[x][y].isBomb)
                    return;
            }
        }
        alert("You Won!");
    }

    setInterval(() => {
        checkWinningCondition();

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);

        drawGrid();

        drawNumbers();

        drawCover();
    }, 20);
}

