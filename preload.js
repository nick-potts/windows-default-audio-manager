const { ipcRenderer } = require('electron')

/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
window.ipcRenderer = require('electron').ipcRenderer;

document.addEventListener('DOMContentLoaded', () => {
  const runButton = document.getElementById('runButton');
  console.log(runButton); // Check if the button element is retrieved correctly
  runButton.addEventListener('click', () => {
      ipcRenderer.send('run-command');
  });

  const multiButton = document.getElementById('changeMulti');
  multiButton.addEventListener('click', () => {
    ipcRenderer.send('multi-change-command', "{0.0.1.00000000}.{d627447f-cdcd-4ff6-9d8a-86536042f904}");
  })
});

// Listen for the result of the command execution
ipcRenderer.on('command-execution-result', (event, result) => {
  if (result.success) {
      // Handle the successful execution
      result.output.forEach(element => {
        let defaultOutput = element['Default'];
          if (defaultOutput !== undefined && defaultOutput != '') {
            const isInput = element.Direction === 'Capture'
              console.log((isInput ? 'Input: ' : 'Output: ') + element['Name'])
          }

          let defaultCommsOutput = element['Default'];
          if (defaultCommsOutput !== undefined && defaultCommsOutput != '') {
            const isInput = element.Direction === 'Capture'
              console.log((isInput ? 'Comm Input: ' : 'Comm Output: ') + element['Name'])
          }

          
          let defaultMultimediaOutput = element['Default Multimedia'];
          if (defaultMultimediaOutput !== undefined && defaultMultimediaOutput != '') {
            const isInput = element.Direction === 'Capture'
              console.log((isInput ? 'Multi Input: ' : 'Multi Output: ') + element['Name'])
          }
      });
  } else {
      // Handle the error
      console.error(result.error);
  }
});