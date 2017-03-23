/* eslint-disable no-undef */
// We are using intensely document here as it is a pure frontend script for testing purpose only.
let editorSupervisor = document.querySelector('#editorSupervisor');
let spanSubElement;
if (!editorSupervisor) {
  const input = document.createElement('div');
  // input.style = 'visibility:hidden;'
  input.type = 'hidden';
  input.id = 'editorSupervisor';
  document.querySelector('body').appendChild(input);
  editorSupervisor = document.querySelector('#editorSupervisor');
  spanSubElement = document.createElement('span');
  editorSupervisor.appendChild(spanSubElement);
}

/**
 * Compute a more easily comparable hash from result for an analyzer result.
 * @param result
 */
function computeAnalyzerHash(result) {
  const computedResult = [];
  result.shapes.forEach((shape) => {
    if (shape.candidates[0].label) {
      computedResult.push(shape.candidates[0].label);
    } else {
      computedResult.push(shape.candidates[0].type);
    }
  });
  result.textLines.forEach((textLine) => {
    computedResult.push('txt:' + textLine.result.textSegmentResult.candidates[0].label);
  });
  result.tables.forEach((table) => {
    computedResult.push('tables:' + table.cells.length);
  });
  computedResult.push('groups:' + result.groups.length);
  return computedResult.sort().join();
}

/**
 * Compute a more easily comparable hash from result for an shape result.
 * @param result
 */
function computeShapeHash(result) {
  const computedResult = [];
  // Computing a custom hash of shape result.
  result.segments.forEach((segment) => {
    console.log(segment);
    if (segment.candidates[0].label) {
      computedResult.push(segment.candidates[0].label);
    } else {
      computedResult.push(segment.candidates[0].type);
    }
  });
  return computedResult.sort().join();
}

/**
 * Compute a more easily comparable hash from result for a text result.
 * @param result
 */
function computeTextHash(result) {
  const computedResult = [];

  const textLabels = [];
  result.textSegmentResult.candidates.forEach(candidate => textLabels.push(candidate.label));
  computedResult.push('text:' + textLabels.join(','));

  const wordLabels = [];
  if (result.wordSegments) {
    result.wordSegments.forEach((segment) => {
      segment.candidates.forEach(candidate => wordLabels.push(candidate.label));
    });
    computedResult.push('word:' + wordLabels.join(','));
  }

  const charLabels = [];
  if (result.charSegments) {
    result.charSegments.forEach((segment) => {
      segment.candidates.forEach(candidate => charLabels.push(candidate.label));
    });
    computedResult.push('character:' + charLabels.join(','));
  }

  return computedResult.join(';');
}


const editorDomElement = document.querySelector('#editor');
const editor = editorDomElement['data-myscript-editor'];

editorDomElement.addEventListener('change', (evt) => {
  editorSupervisor.lastevent = evt;

  const changeEvt = evt.detail;
  editorSupervisor.state = 'UNDEFINED';
  editorSupervisor.dataset.state = 'UNDEFINED';

  editorSupervisor.dataset.canundo = changeEvt.canUndo;
  editorSupervisor.dataset.canredo = changeEvt.canRedo;
  editorSupervisor.dataset.canclear = changeEvt.canClear;
  editorSupervisor.dataset.rawstrokes = editor.model.rawStrokes.length;

  editorSupervisor.nbstrokes = editor.model.rawStrokes.length;
});

editorDomElement.addEventListener('result', (evt) => {
  editorSupervisor.lastevent = evt;

  const resultEvt = evt.detail;
  if (resultEvt.rawResult && (resultEvt.rawResult.result || resultEvt.recognitionResult)) {
    editorSupervisor.state = 'RECOGNITION OVER';
    editorSupervisor.dataset.state = 'RECOGNITION OVER';

    if (resultEvt.rawResult.result.shapes) {
      editorSupervisor.lastresult = computeAnalyzerHash(resultEvt.rawResult.result);
    } else if (resultEvt.rawResult.result.segments) {
      editorSupervisor.lastresult = computeShapeHash(resultEvt.rawResult.result);
    } else if (resultEvt.rawResult.result.textSegmentResult) {
      editorSupervisor.lastresult = computeTextHash(resultEvt.rawResult.result);
    } else if (resultEvt.recognitionResult) {
      editorSupervisor.lastresult = resultEvt.recognitionResult;
    } else {
      editorSupervisor.lastresult = resultEvt.rawResult.result;
    }
  }

  spanSubElement.innerText = editorSupervisor.lastresult;
})
;

/* eslint-enable no-undef */