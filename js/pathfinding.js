// find the shortest path between two nodes
function pathFindingNodes(rNodes, index1, index2)
{
    var rNodesClones = cloneJson(rNodes);
    if (index1 === index2)
    {
        rNodesClones[index1].costSoFar= 0;
        return {path:[index1], nodes: rNodesClones};
    }
    for (var i = 0; i < rNodesClones.length; i++) {
        rNodesClones[i].isFrontier = false;
        rNodesClones[i].costSoFar= null;
        rNodesClones[i].cameFrom= null;
    }
    rNodesClones[index1].costSoFar= 0;
    rNodesClones[index1].isFrontier = true;
    pathFindingRecursive(rNodesClones, index1);
    var returnedPath = [index2];
    var nextNode = index2;
    var loopControl = 0;
    do {
        nextNode = rNodesClones[nextNode].cameFrom;
        returnedPath.push(nextNode);
        loopControl++;
    } while (nextNode !== index1 && loopControl < 50);
    var pathReturn = {path:returnedPath.reverse(), nodes: rNodesClones};
    return pathReturn;
}

// Recursive function used by the previous function
function pathFindingRecursive(rNodes, index)
{
    var node = rNodes[index];
    var connectedNodes = node.nodes;
    for (var i = 0; i < connectedNodes.length; i++) {
        var currentNode = rNodes[connectedNodes[i]];
        var distance = distanceBetweenNodes(rNodes, index, connectedNodes[i]);
        var newCostSoFar = node.costSoFar + distance;
        if (currentNode.costSoFar === null || newCostSoFar < currentNode.costSoFar)
        {
            currentNode.costSoFar = newCostSoFar;
            currentNode.cameFrom = index;
            pathFindingRecursive(rNodes, connectedNodes[i]);
        }
    }
}

// find the path between a position and a node
function pathFindingPositionToNode(rNodes, position1, destinationNode)
{
    // the function calculate the two paths from the two extremities of the current position
    // and return the best one
    var distanceMin = 500000;
    var path;
    var path1 = pathFindingNodes(rNodes, position1.node1, destinationNode);
    var distance1 = distanceBetweenNodes(rNodes,position1.node1, position1.node2)*(position1.progression) + path1.nodes[destinationNode].costSoFar;
    if (distance1< distanceMin)
    {
        distanceMin = distance1;
        path = path1;
    }
    
    var path2 = pathFindingNodes(rNodes, position1.node2, destinationNode);
    var distance2 = distanceBetweenNodes(rNodes,position1.node1, position1.node2)*(1-position1.progression) + path2.nodes[destinationNode].costSoFar;
    if (distance2< distanceMin)
    {
        distanceMin = distance2;
        path = path2;
    }
    return path;
}