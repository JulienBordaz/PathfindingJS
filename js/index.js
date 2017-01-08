$(document).ready(function () {
    var stage = new createjs.Stage("demoCanvas");

    var roadNodes = [];

    // adding the four first nodes
    roadNodes.push({x: 200, y: 200, nodes: [1, 2]});
    roadNodes.push({x: 200, y: 400, nodes: [0, 3]});
    roadNodes.push({x: 400, y: 200, nodes: [0, 3]});
    roadNodes.push({x: 400, y: 400, nodes: [1, 2]});

    var path = null;
    var entitiesArray = [];

    var currentIndex = 0;
    var currentPosition = {node1: 0, node2: 0, progression: 0, progressionPixel: 0};

    // expanding the network
    $("#growButton").click(function () {
        for (var i = 0; i < 10; i++)
        {
            var growResult;
            var loopControl = 0;

            do {
                var randomNode = Math.floor(Math.random() * roadNodes.length);
                growResult = grow(roadNodes, randomNode);
                loopControl++;
            } while (growResult === 0 && loopControl < 10000);
            updateStage(roadNodes, stage, null);
        }
    });

    stage.on("stagemousedown", function (evt) {
        var closestNodeDatas = findClosestNode(roadNodes, evt.stageX, evt.stageY);
        var closestNode = closestNodeDatas.index;

        if (closestNodeDatas.distance < 40)
        {
            path = pathFindingPositionToNode(roadNodes, currentPosition, closestNode).path;
            
            // tons of particular cases depending on the destination and the current position...
            // there's probably a way to simplify all this
            if (path.length > 1 && (path[0] !== currentPosition.node1 || path[1] !== currentPosition.node2))
            {
                if (path[0] === currentPosition.node2 && path[1] === currentPosition.node1)
                {
                    currentPosition.progression = 1 - currentPosition.progression;

                    var distance1 = distanceBetweenNodes(roadNodes, path[0], path[1]);
                    currentPosition.progressionPixel = distance1 - currentPosition.progressionPixel;
                } else if (currentPosition.node1 === currentPosition.node2 && currentPosition.node1 === path[0])
                {
                    currentPosition.node2 = path[1];
                } else if (currentPosition.node2 === path[0] && path[1] !== currentPosition.node1)
                {

                    path.unshift(currentPosition.node1);
                    currentPosition.node1 = path[0];
                    currentPosition.node2 = path[1];
                } else if (currentPosition.node1 === path[0] && currentPosition.node2 !== path[1])
                {
                    currentPosition.progression = 1 - currentPosition.progression;

                    var distance1 = distanceBetweenNodes(roadNodes, currentPosition.node1, currentPosition.node2);
                    currentPosition.progressionPixel = distance1 - currentPosition.progressionPixel;

                    path.unshift(currentPosition.node2);
                    currentPosition.node1 = path[0];
                    currentPosition.node2 = path[1];
                }
            } else if (path.length === 1 && path[0] !== currentPosition.node2)
            {
                path.unshift(currentPosition.node2);
                currentPosition.progression = 1 - currentPosition.progression;

                var distance1 = distanceBetweenNodes(roadNodes, path[0], path[1]);
                currentPosition.progressionPixel = distance1 - currentPosition.progressionPixel;

                currentPosition.node1 = path[0];
                currentPosition.node2 = path[1];
            } else if (path.length === 1 && path[0] === currentPosition.node2)
            {
                path.unshift(currentPosition.node1);

                currentPosition.node1 = path[0];
                currentPosition.node2 = path[1];
            }
            currentIndex = 0;
            gameTimer = 0;
        }
    });

    var lastFrameTimeMs = 0;
    var maxFPS = 60;
    var gameTimer = 0;

    function update(delta) {
        if (path !== null && currentIndex < path.length - 1)
        {
            entitiesArray = [];

            var distance1 = distanceBetweenNodes(roadNodes, path[currentIndex], path[currentIndex + 1]);

            currentPosition.progressionPixel += 3;

            currentPosition.progression = currentPosition.progressionPixel / distance1;

            // reaching a node
            if (currentPosition.progression >= 1)
            {
                currentPosition.progressionPixel = 0;
                currentIndex++;
                if (currentIndex < path.length - 1)
                {
                    var node1Pos = path[currentIndex];
                    var node2Pos = path[currentIndex + 1];
                    currentPosition = {node1: node1Pos, node2: node2Pos, progression: 0, progressionPixel: 0};
                } else
                {
                    var node1Pos = path[currentIndex];
                    currentPosition = {node1: node1Pos, node2: node1Pos, progression: 0, progressionPixel: 0};
                    currentPosition.progressionPixel = 0;
                }
            }
            if (currentIndex < path.length - 1)
            {
                var currentPathPoint = roadNodes[path[currentIndex]];
                var nextPathPoint = roadNodes[path[currentIndex + 1]];

                entitiesArray.push({x: currentPathPoint.x + (nextPathPoint.x - currentPathPoint.x) * currentPosition.progression, y: currentPathPoint.y + (nextPathPoint.y - currentPathPoint.y) * currentPosition.progression});

            } else
            {
                var nextPathPoint = roadNodes[path[currentIndex]];
                entitiesArray.push({x: nextPathPoint.x, y: nextPathPoint.y});
            }
        } else {
            var currentPoint = roadNodes[currentPosition.node1];

            entitiesArray.push({x: currentPoint.x, y: currentPoint.y});
        }

        gameTimer += delta;
        if (gameTimer >= 1000)
        {
            gameTimer = 0;
        }
    }

    function mainLoop(timestamp) {
        // Throttle the frame rate.    
        if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
            requestAnimationFrame(mainLoop);
            return;
        }
        delta = timestamp - lastFrameTimeMs;
        lastFrameTimeMs = timestamp;

        update(delta);
        updateStage(roadNodes, stage, entitiesArray);
        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);

});



function updateStage(rNodes, stage, entitiesArray)
{
    stage.removeAllChildren();

    for (var i = 0; i < rNodes.length; i++) {
        // drawing the roads
        for (var j = 0; j < rNodes[i].nodes.length; j++) {
            // "if" to avoid drawing two times the same road
            if (rNodes[i].nodes[j] > i)
            {
                //color = createjs.Graphics.getRGB(0xFFFFFF * Math.random(), 1);
                var line = new createjs.Shape();
                line.graphics.setStrokeStyle(3);
                line.graphics.beginStroke("blue");
                line.graphics.moveTo(rNodes[i].x, rNodes[i].y);
                line.graphics.lineTo(rNodes[rNodes[i].nodes[j]].x, rNodes[rNodes[i].nodes[j]].y);
                line.graphics.endStroke();
                stage.addChild(line);
            }
        }

        // drawing the nodes
        var circle = new createjs.Shape();
        circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 10);
        circle.x = rNodes[i].x;
        circle.y = rNodes[i].y;
        stage.addChild(circle);
        //console.log(circle.x + " " + circle.y);

    }

    // highlight a point
    if (entitiesArray !== null)
    {
        for (var i = 0; i < entitiesArray.length; i++) {
            var circle = new createjs.Shape();
            circle.graphics.beginFill("red").drawCircle(0, 0, 18);
            circle.x = entitiesArray[i].x;
            circle.y = entitiesArray[i].y;
            stage.addChild(circle);
        }
    }

    stage.update();
}


// lazy function to clone array of objects
// works only with simple objects without functions
function cloneJson(a) {
    return JSON.parse(JSON.stringify(a));
}

function distanceBetweenNodes(rNodes, index1, index2)
{
    if (index1 === index2)
    {
        return 0;
    }
    return distanceBetweenPoints(rNodes[index1], rNodes[index2]);
}

function distanceBetweenPoints(point1, point2)
{
    return Math.sqrt((point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y));
}

function findClosestNode(rNodes, xPoint, yPoint)
{
    var closestDistance = 99999999;
    var closestIndex = -1;
    for (var i = 0; i < rNodes.length; i++)
    {
        var currentClosestDistance = distanceBetweenPoints(rNodes[i], {x: xPoint, y: yPoint});
        if (currentClosestDistance < closestDistance)
        {
            closestDistance = currentClosestDistance;
            closestIndex = i;
        }
    }
    return {index: closestIndex, distance: closestDistance};
}