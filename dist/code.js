/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/code.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/code.js":
/*!*********************!*\
  !*** ./src/code.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

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

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBLHdCQUF3QiwwQkFBMEI7O0FBRWxEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLG9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0Esb0JBQW9CLHlEQUF5RDtBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixpQ0FBaUM7QUFDM0Q7QUFDQSxTQUFTO0FBQ1Qsd0JBQXdCLGlDQUFpQztBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxDIiwiZmlsZSI6ImNvZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9jb2RlLmpzXCIpO1xuIiwiZmlnbWEuc2hvd1VJKF9faHRtbF9fLCB7IHdpZHRoOiAyNTAsIGhlaWdodDogMTUwIH0pO1xuXG5sZXQgdGltZXIgPSB1bmRlZmluZWQ7XG5jb25zdCBrZXkgPSAnU0VUVElOR1MnO1xuXG5maWdtYS51aS5vbm1lc3NhZ2UgPSBtc2cgPT4ge1xuICBpZiAobXNnLnR5cGUgPT09ICdDT05WRVJUX0ZSQU1FU18yX0dST1VQUycpIHtcbiAgICBjb25zdCBjdXJyZW50U2VsZWN0aW9uID0gZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uO1xuICAgIGNvbnNvbGUubG9nKGN1cnJlbnRTZWxlY3Rpb24pO1xuICAgIGlmIChjdXJyZW50U2VsZWN0aW9uLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZmlnbWEuY3VycmVudFBhZ2UuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEb2luZyB0aGUgdGhhbmcgb24gJyArIGNoaWxkLm5hbWUpO1xuICAgICAgICBkb3RoZVRoYW5nKGNoaWxkKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0RvbmUnKTtcbiAgICAgIH0pXG4gICAgfSBlbHNlIGlmIChjdXJyZW50U2VsZWN0aW9uLmxlbmd0aCA9PT0gMSkge1xuICAgICAgZG90aGVUaGFuZyhjdXJyZW50U2VsZWN0aW9uWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudFNlbGVjdGlvbi5mb3JFYWNoKHNlbGVjdGlvbiA9PiB7XG4gICAgICAgIGRvdGhlVGhhbmcoc2VsZWN0aW9uKTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmNvbnN0IGRvdGhlVGhhbmcgPSAoY3VycmVudFNlbGVjdGlvbikgPT4ge1xuICBsZXQgZnJhbWVzID0gZ2V0RnJhbWVzKGN1cnJlbnRTZWxlY3Rpb24pO1xuXG4gIGZyYW1lcy5mb3JFYWNoKChmcmFtZSwgaW5kZXgpID0+IHsgXG4gICAgaWYgKGZyYW1lLm5vZGVJZCA9PT0gY3VycmVudFNlbGVjdGlvbi5pZCkge1xuICAgICAgZnJhbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfTtcbiAgfSlcbiAgaWYgKGN1cnJlbnRTZWxlY3Rpb24ucGFyZW50LnR5cGUgIT09ICdQQUdFJykge1xuICAgIGZyYW1lcy51bnNoaWZ0KHtuYW1lOiBjdXJyZW50U2VsZWN0aW9uLm5hbWUsIG5vZGVJZDogY3VycmVudFNlbGVjdGlvbi5pZH0pXG4gIH1cbiAgaWYgKGZyYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgZm9yIChsZXQgZnJhbWUgb2YgZnJhbWVzKSB7XG4gICAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBmaWdtYS5nZXROb2RlQnlJZChmcmFtZS5ub2RlSWQpO1xuICAgICAgbGV0IHNlbGVjdGlvbkNoaWxkcmVuID0gc2VsZWN0ZWROb2RlLmNoaWxkcmVuO1xuICAgICAgY29uc3QgcGFyZW50Tm9kZSA9IHNlbGVjdGVkTm9kZS5wYXJlbnQ7XG4gICAgICBpZiAoc2VsZWN0aW9uQ2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgbmV3R3JvdXAgPSBmaWdtYS5ncm91cChzZWxlY3Rpb25DaGlsZHJlbiwgcGFyZW50Tm9kZSk7XG4gICAgICAgIG5ld0dyb3VwLm5hbWUgPSBmcmFtZS5uYW1lO1xuICAgICAgICBuZXdHcm91cC5vcGFjaXR5ID0gc2VsZWN0ZWROb2RlLm9wYWNpdHk7XG4gICAgICAgIG5ld0dyb3VwLnZpc2libGUgPSBzZWxlY3RlZE5vZGUudmlzaWJsZTtcbiAgICAgICAgbGV0IHBvc2l0aW9uSW5GcmFtZSA9IDA7XG4gICAgICAgIHBhcmVudE5vZGUuY2hpbGRyZW4uZm9yRWFjaCgobm9kZSwgaW5kZXgpID0+IHsgXG4gICAgICAgICAgaWYgKG5vZGUuaWQgPT09IHNlbGVjdGVkTm9kZS5pZCkge1xuICAgICAgICAgICAgcG9zaXRpb25JbkZyYW1lID0gaW5kZXg7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSlcbiAgICAgICAgcGFyZW50Tm9kZS5pbnNlcnRDaGlsZChwb3NpdGlvbkluRnJhbWUsIG5ld0dyb3VwKTtcbiAgICAgICAgZmlnbWEubm90aWZ5KCdTdWNjZXNzZnVsbHkgY29udmVydGVkICcgKyBmcmFtZXMubGVuZ3RoICsgJyBmcmFtZXMgdG8gZ3JvdXBzIPCfpbMnKTtcbiAgICAgICAgc2VsZWN0ZWROb2RlLnJlbW92ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmaWdtYS5ub3RpZnkoJ05vIGZyYW1lcyBmb3VuZCB0byBjb252ZXJ0IfCfmKonKTtcbiAgfVxufVxuXG5mdW5jdGlvbiogd2Fsa1RyZWUobm9kZSkge1xuICB5aWVsZCBub2RlO1xuICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICBpZiAoY2hpbGRyZW4pIHtcbiAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbikge1xuICAgICAgeWllbGQqIHdhbGtUcmVlKGNoaWxkKVxuICAgIH1cbiAgfVxufVxuXG5jb25zdCBnZXRGcmFtZXMgPSAocm9vdE5vZGUpID0+IHtcbiAgbGV0IHdhbGtlciA9IHdhbGtUcmVlKHJvb3ROb2RlKVxuXG4gIGNvbnN0IHByb2Nlc3NPbmNlID0gKCkgPT4ge1xuICAgIGxldCByZXN1bHRzID0gW107XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBsZXQgZG9uZSA9IHRydWU7XG4gICAgbGV0IHJlc1xuICAgIHdoaWxlICghKHJlcyA9IHdhbGtlci5uZXh0KCkpLmRvbmUpIHtcbiAgICAgIGxldCBub2RlID0gcmVzLnZhbHVlXG4gICAgICBpZiAobm9kZS50eXBlID09PSAnRlJBTUUnKSB7XG4gICAgICAgIGlmIChmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24ubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGlmIChmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb25bMF0uaWQgIT09IG5vZGUuaWQpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7bm9kZUlkOiBub2RlLmlkLCBuYW1lOiBub2RlLm5hbWV9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHtub2RlSWQ6IG5vZGUuaWQsIG5hbWU6IG5vZGUubmFtZX0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoKytjb3VudCA9PT0gMTAwMCkge1xuICAgICAgICBkb25lID0gZmFsc2VcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KHByb2Nlc3NPbmNlLCAyMClcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIHJldHVybiBwcm9jZXNzT25jZSgpXG59Il0sInNvdXJjZVJvb3QiOiIifQ==