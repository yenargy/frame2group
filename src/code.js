figma.showUI(__html__, { width: 250, height: 150 });

let timer = undefined;
const key = 'SETTINGS';

figma.ui.onmessage = msg => {
  if (msg.type === 'CONVERT_FRAMES_2_GROUPS') {
    const currentSelection = figma.currentPage.selection;
    console.log(currentSelection);
    if (currentSelection.length === 0) {
      figma.currentPage.children.forEach(child => {
        console.log('Doing the thang on ' + child.name);
        dotheThang(child);
        console.log('Done');
      })
    } else if (currentSelection.length === 1) {
      dotheThang(currentSelection[0]);
    } else {
      currentSelection.forEach(selection => {
        dotheThang(selection);
      })
    }
  }
}

const dotheThang = (currentSelection) => {
  let frames = getFrames(currentSelection);

  frames.forEach((frame, index) => { 
    if (frame.nodeId === currentSelection.id) {
      frames.splice(index, 1);
    };
  })
  if (currentSelection.parent.type !== 'PAGE') {
    frames.unshift({name: currentSelection.name, nodeId: currentSelection.id})
  }
  if (frames.length > 0) {
    for (let frame of frames) {
      const selectedNode = figma.getNodeById(frame.nodeId);
      let selectionChildren = selectedNode.children;
      const parentNode = selectedNode.parent;
      if (selectionChildren.length > 0) {
        let newGroup = figma.group(selectionChildren, parentNode);
        newGroup.name = frame.name;
        newGroup.opacity = selectedNode.opacity;
        newGroup.visible = selectedNode.visible;
        let positionInFrame = 0;
        parentNode.children.forEach((node, index) => { 
          if (node.id === selectedNode.id) {
            positionInFrame = index;
          };
        })
        parentNode.insertChild(positionInFrame, newGroup);
        figma.notify('Successfully converted ' + frames.length + ' frames to groups 🥳');
        selectedNode.remove();
      }
    }
  } else {
    figma.notify('No frames found to convert!😪');
  }
}

function* walkTree(node) {
  yield node;
  let children = node.children;
  if (children) {
    for (let child of children) {
      yield* walkTree(child)
    }
  }
}

const getFrames = (rootNode) => {
  let walker = walkTree(rootNode)

  const processOnce = () => {
    let results = [];
    let count = 0;
    let done = true;
    let res
    while (!(res = walker.next()).done) {
      let node = res.value
      if (node.type === 'FRAME') {
        if (figma.currentPage.selection.length > 0) {
          if (figma.currentPage.selection[0].id !== node.id) {
            results.push({nodeId: node.id, name: node.name});
          }
        } else {
          results.push({nodeId: node.id, name: node.name});
        }
      }
      if (++count === 1000) {
        done = false
        timer = setTimeout(processOnce, 20)
        break
      }
    }

    return results;
  }

  return processOnce()
}