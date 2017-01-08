function insertNodeInLine(rNodes, startIndex, endIndex, insertIndex)
{
    // delete connections from start and end
    var index = rNodes[startIndex].nodes.indexOf(endIndex);
    if (index > -1) {
        rNodes[startIndex].nodes.splice(index, 1);
    }
    var index2 = rNodes[endIndex].nodes.indexOf(startIndex);
    if (index2 > -1) {
        rNodes[endIndex].nodes.splice(index2, 1);
    }

    // add connections
    connectTwoNodes(rNodes, startIndex, insertIndex);
    connectTwoNodes(rNodes, insertIndex, endIndex);

}

function connectTwoNodes(rNodes, node1Index, node2Index)
{
    if (rNodes[node1Index].nodes.indexOf(node2Index) === -1)
    {
        rNodes[node1Index].nodes.push(node2Index);
    }
    if (rNodes[node2Index].nodes.indexOf(node1Index) === -1)
    {
        rNodes[node2Index].nodes.push(node1Index);
    }
}

function grow(rNodes, nodeIndex)
{
    var connectedNodes = rNodes[nodeIndex].nodes.length;
    var node = rNodes[nodeIndex];
    var nodePoints = rNodes[nodeIndex].nodes;
    if (connectedNodes < 6)
    {
        var direction = -180 + Math.floor(Math.random() * 360);

        var distance = 200 + Math.floor((Math.random() * 21) - 10);

        var newNode = {x: node.x + distance * Math.cos(direction * 3.14 / 180), y: node.y + distance * Math.sin(direction * 3.14 / 180)};

        if (newNode.x < 0 || newNode.x > 800 || newNode.y < 0 || newNode.y > 600)
        {
            return 0;
        }

        var maxScalarProduct = 0;
        for (var i = 0; i < nodePoints.length; i++)
        {
            var distance1 = Math.sqrt((rNodes[nodeIndex].x - newNode.x) * (rNodes[nodeIndex].x - newNode.x) + (rNodes[nodeIndex].y - newNode.y) * (rNodes[nodeIndex].y - newNode.y));
            var distance2 = distanceBetweenNodes(rNodes, nodeIndex, nodePoints[i]);
            
            var s1_x, s1_y, s2_x, s2_y;
            s1_x = newNode.x - rNodes[nodeIndex].x;
            s1_y = newNode.y - rNodes[nodeIndex].y;
            s2_x = rNodes[nodePoints[i]].x - rNodes[nodeIndex].x;
            s2_y = rNodes[nodePoints[i]].y - rNodes[nodeIndex].y;

            var scalarProduct = (s1_x * s2_x + s1_y * s2_y) / (distance1 * distance2);

            if (scalarProduct > maxScalarProduct)
            {
                maxScalarProduct = scalarProduct;
            }
        }

        if (maxScalarProduct > 0.8)
        {
            return 0;
        }

        var nodeAround = nodeWithinCircle(rNodes, nodeIndex, newNode.x, newNode.y, 50);
        var roadCrossed = isCrossingRoad(rNodes, nodeIndex, newNode.x, newNode.y);



        if (roadCrossed.length > 1 && nodeAround === -1)
        {
            rNodes.push({x: roadCrossed[1][0], y: roadCrossed[1][1], nodes: []});
            insertNodeInLine(rNodes, roadCrossed[0][0], roadCrossed[0][1], rNodes.length - 1);
            connectTwoNodes(rNodes, rNodes.length - 1, nodeIndex);
        } else if (roadCrossed.length > 1 && nodeAround !== -1) {
            return 0;
        } else if (nodeAround !== -1)
        {
            connectTwoNodes(rNodes, nodeAround, nodeIndex);
            return 1;
        } else
        {
            rNodes.push({x: newNode.x, y: newNode.y, nodes: []});
            connectTwoNodes(rNodes, rNodes.length - 1, nodeIndex);
        }

        return 1;

    }
}

// check if there is already a node around coordinates xCircle yCircle
function nodeWithinCircle(rNodes, nodeIndex, xCircle, yCircle, radius)
{
    var currentIndex = -1;
    var currentDistance = radius;
    for (var i = 0; i < rNodes.length; i++) {
        if (i !== nodeIndex)
        {
            var distance = Math.sqrt((xCircle - rNodes[i].x) * (xCircle - rNodes[i].x) + (yCircle - rNodes[i].y) * (yCircle - rNodes[i].y));
            if (distance < currentDistance)
            {
                currentIndex = i;
                currentDistance = distance;
            }
        }
    }
    return currentIndex;
}

// check if adding a node at coordinatex x y connected to node nodeIndex will cross an existing road
function isCrossingRoad(rNodes, nodeIndex, x, y)
{
    var currentDistance = 5000;
    var currentIndexes = [];
    var segmentCrossingResult;
    var currentNode;
    var currentSecondNode;
    var currentCrossingCoordinates;
    var distance;
    for (var i = 0; i < rNodes.length; i++) {
        if (i !== nodeIndex)
        {
            currentNode = rNodes[i];
            var currentNodeConnections = currentNode.nodes;
            for (var j = 0; j < currentNodeConnections.length; j++) {
                if (currentNodeConnections[j] !== nodeIndex)
                {
                    currentSecondNode = rNodes[currentNodeConnections[j]];
                    segmentCrossingResult = segmentCrossing(rNodes[nodeIndex].x, rNodes[nodeIndex].y, x, y, currentNode.x, currentNode.y, currentSecondNode.x, currentSecondNode.y);
                    if (segmentCrossingResult.length > 1)
                    {

                        distance = Math.sqrt((rNodes[nodeIndex].x - segmentCrossingResult[0]) * (rNodes[nodeIndex].x - segmentCrossingResult[0]) + (rNodes[nodeIndex].y - segmentCrossingResult[1]) * (rNodes[nodeIndex].y - segmentCrossingResult[1]));
                        if (distance < currentDistance)
                        {
                            currentIndexes = [i, currentNodeConnections[j]];
                            currentCrossingCoordinates = segmentCrossingResult.slice(0);
                            currentDistance = distance;
                        }
                    }
                }
            }
        }
    }

    if (currentIndexes.length === 0)
    {
        return [];
    } else
    {
        return [currentIndexes, currentCrossingCoordinates];
    }
}

// Returns 1 if the lines intersect, otherwise 0. In addition, if the lines 
// intersect the intersection point may be stored in the floats i_x and i_y.
function segmentCrossing(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y)
{
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;

    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        var i_x = p0_x + (t * s1_x);
        var i_y = p0_y + (t * s1_y);
        return [i_x, i_y];
    }

    return []; // No collision
}