var UNIT_TEST_FOLDER_RELATIVE_PATH = "../unit_tests";
var inputJSON = new KMWRecorder.InputTestSequence();
var testDefinition = new KMWRecorder.KeyboardTest();

var ta_inputJSON;
var in_output;

var justActivated = false;

function focusReceiver() {
  var receiver = document.getElementById('receiver');
  if(receiver['kmw_ip']) {
    receiver = receiver['kmw_ip'];
  }
  receiver.focus();
  
  if(keyman.util.device.touchable) {
    // At present, touch doesn't 'focus' properly.
    DOMEventHandlers.states.lastActiveElement = receiver;
    DOMEventHandlers.states.activeElement = receiver;
    keyman.osk.show(true);
  }
}

setElementText = function(ele, text) {
  ele.value = text;
  if(ele['kmw_ip']) {
    keyman.touchAliasing.setTextBeforeCaret(ele['kmw_ip'], ele.value);
  }
}

addInputRecord = function(json) {
  inputJSON.addInput(json, in_output.value);
  setElementText(ta_inputJSON, inputJSON.toPrettyJSON());
}

resetInputRecord = function() {
  setElementText(ta_inputJSON, "");
  setElementText(in_output, "");

  inputJSON = new KMWRecorder.InputTestSequence();
}

copyInputRecord = function() {
  try {
    if(!ta_inputJSON['kmw_ip']) {
      ta_inputJSON.select();
    } else {
      var range = document.createRange();
      range.selectNode(ta_inputJSON['kmw_ip']);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
    
    var res = document.execCommand('copy');
    if(res) {
      in_output.focus();
      return;
    }
  } catch (err) { console.log(err) }
  alert("Unable to copy successfully.");
}

function saveInputRecord() {
  var target;
  if(inputJSON.hasOSKInteraction()) {
    var device = new Device();
    device.detect();
    target = device.formFactor;
  } else {
    target = 'hardware';
  }
  var os_list = getPlatforms();
  var browsers = getBrowsers();
  var config = new KMWRecorder.Constraint(target, os_list, browsers);

  testDefinition.addTest(config, inputJSON);
  resetInputRecord();
  setTestDefinition(testDefinition);
}

reviseInputRecord = function() {
  inputJSON = new KMWRecorder.InputTestSequence(JSON.parse(ta_inputJSON.value));
  setElementText(in_output, inputJSON.output)
}

setTestDefinition = function(testDef) {
  if(testDef) {
    testDefinition = testDef;
  }
  var masterJSON = document.getElementById('masterJSON');
  masterJSON.value = JSON.stringify(testDefinition, null, '  ');
}

// Time for the 'magic'.  Yay, JavaScript method extension strategies...
var _kd = keyman.touchAliasing._KeyDown.bind(keyman.touchAliasing);
keyman.touchAliasing._KeyDown = function(e) {
  if(DOMEventHandlers.states.activeElement != in_output &&
    DOMEventHandlers.states.activeElement != in_output['kmw_ip']) {
    return _kd(e);
  }

  var event = new KMWRecorder.PhysicalInputEvent(e);
  var retVal = _kd(e);

  // Record the keystroke as part of a test sequence!
  // Miniature delay in case the keyboard relies upon default backspace/delete behavior!
  window.setTimeout(function() {
    addInputRecord(event);
  }, 1);
  
  return retVal;
}

var _ock = keyman.osk.clickKey.bind(keyman.osk);
keyman.osk.clickKey = function(e) {
  if(DOMEventHandlers.states.activeElement != in_output &&
    DOMEventHandlers.states.activeElement != in_output['kmw_ip']) {
    return _ock(e);
  }

  var event = new KMWRecorder.OSKInputEvent(e);
  var retVal = _ock(e);

  // Record the click/touch as part of a test sequence!
  addInputRecord(event);
  return retVal;
}

var _sak = keyman.keyboardManager._SetActiveKeyboard.bind(keyman.keyboardManager);
keyman.keyboardManager._SetActiveKeyboard = function(PInternalName, PLgCode, saveCookie) {
  // If it's not on our recording control, ignore the change and do nothing special.
  if(document.activeElement != in_output) {
    _sak(PInternalName, PLgCode, saveCookie);
  }

  var sameKbd = (testDefinition.keyboard && ("Keyboard_" + testDefinition.keyboard.id) == PInternalName)
    && (testDefinition.keyboard.languages[0].id == PLgCode);

  if(!testDefinition.isEmpty() && !sameKbd && !justActivated) {
    if(!confirm("Changing the keyboard will clear the current test set.  Are you sure?")) {
      _sak("Keyboard_" + testDefinition.keyboard.id, testDefinition.keyboard.languages[0].id);
      return;
    }
  }
  _sak(PInternalName, PLgCode, saveCookie);

  // What's the active stub immediately after our _SetActiveKeyboard call?
  var internalStub = keyman.keyboardManager.activeStub;
  if(internalStub && (DOMEventHandlers.states.activeElement == in_output 
    || DOMEventHandlers.states.activeElement == in_output['kmw_ip'])) {
    var kbdRecord = new KMWRecorder.KeyboardStub(internalStub);
    kbdRecord.setBasePath('resources/keyboards');
    var ta_activeStub = document.getElementById('activeStub');
    ta_activeStub.value = JSON.stringify(kbdRecord);
    
    if(!sameKbd && !justActivated) {
      setTestDefinition(new KMWRecorder.KeyboardTest(kbdRecord));
    }
  }
  justActivated = false;
}

var initDevice = function() {
  // From KMW.
  var device = new Device();
  device.detect();

  document.getElementById("activeFormFactor").textContent = device.formFactor;
  document.getElementById("activeTouch").textContent = device.touchable ? 'Supported' : 'None';
  document.getElementById("activeOS").textContent = device.OS;
  document.getElementById("activeBrowser").textContent = device.browser;
}

window.addEventListener('load', function() {
  ta_inputJSON = document.getElementById('inputRecord');
  in_output = document.getElementById('receiver');

  keyman.attachToControl(in_output);
  keyman.setKeyboardForControl(in_output, '', '');
  resetInputRecord();
  initDevice();
  setupKeyboardPicker();
  setTestDefinition();

  DOMEventHandlers.states.lastActiveElement = in_output['kmw_ip'] ? in_output['kmw_ip'] : in_output;
});

//var p={'internalName':_internalName,'language':_language,'keyboardName':_keyboardName,'languageCode':_languageCode};
function keyboardAdded(properties) {
  var kbdControl = document.getElementById('KMW_Keyboard');

  var opt = document.createElement('OPTION');
  opt.value = properties.internalName + "$$" + properties.languageCode;
  opt.innerHTML = properties.keyboardName + " (" + properties.language + ")";
  kbdControl.appendChild(opt);
}

function setupKeyboardPicker() {
  /* Make sure that Keyman is initialized (we can't guarantee initialization order) */
  keyman.init();
  
  var kbdControl = document.getElementById('KMW_Keyboard');
  /* Retrieve the list of keyboards available from KeymanWeb and populate the selector using the DOM */
  var kbds = keyman.getKeyboards();
  for(var kbd in kbds) {
    var opt = document.createElement('OPTION');
    opt.value = kbds[kbd].InternalName + "$$" + kbds[kbd].LanguageCode;
    opt.innerHTML = kbds[kbd].Name;
    kbdControl.appendChild(opt);    
  }
  
  // Ensures the default keyboard is active, to match our listbox's initial (default) option.
  keyman.setActiveKeyboard('', '');
  keyman.addEventListener('keyboardregistered', keyboardAdded);
}

/* Called when user selects an item in the KMW_Keyboard SELECT */
function KMW_KeyboardChange() {
  var kbdControl = document.getElementById('KMW_Keyboard');
  /* Select the keyboard in KeymanWeb */
  var name = kbdControl.value.substr(0, kbdControl.value.indexOf("$$"));
  var languageCode = kbdControl.value.substr(kbdControl.value.indexOf("$$")+2);

  var activeElement = document.activeElement;
  justActivated = true;
  focusReceiver();
  kmw.setActiveKeyboard(name, languageCode);
  activeElement.focus();
}

function loadExistingTest(files) {
  if(files.length > 0) {
    var reader = new FileReader();
    reader.onload = function() {
      try {
        var kbdTest = new KMWRecorder.KeyboardTest(reader.result);
        setTestDefinition(kbdTest)

        // Make sure we've loaded the keyboard!  Problem - we're not running from the unit_tests folder!
        var kbdStub = new KMWRecorder.KeyboardStub(kbdTest.keyboard);
        kbdStub.filename = UNIT_TEST_FOLDER_RELATIVE_PATH + "/" + kbdStub.filename;

        keyman.addKeyboards(kbdStub);

        var activeElement = document.activeElement;
        justActivated = true;
        focusReceiver();
        keyman.setActiveKeyboard("Keyboard_" + kbdTest.keyboard.id, kbdTest.keyboard.languages[0].id);
        activeElement.focus();
      } catch (e) {
        alert("File does not contain a valid KeyboardTest definition.")
        console.error(e);
      }
    }
    reader.readAsText(files[0]);
  }
}

var PLATFORMS = ['windows', 'macosx', 'linux', 'android', 'ios'];
var BROWSERS = ['ie', 'chrome', 'firefox', 'safari', 'opera'];

function _clearCategory(arr, prefix) {
  for(var i=0; i < arr.length; i++) {
    var cb = document.getElementById(prefix + arr[i]);
    cb.checked = false;
  }

  _setCategoryAny(arr, prefix);
}

function _setCategoryAny(arr, prefix) {
  var any = true;
  for(var i=0; i < arr.length; i++) {
    var cb = document.getElementById(prefix + arr[i]);
    if(cb.checked) {
      any = false;
    }
  }
  document.getElementById(prefix + 'any').checked = any;
}

function _getCategory(arr, prefix) {
  var res = [];
  for(var i=0; i < arr.length; i++) {
    var cb = document.getElementById(prefix + arr[i]);
    if(cb.checked) {
      res.push(arr[i]);
    }
  }

  return res.length > 0 ? res : null;
}

function clearPlatforms() { _clearCategory(     PLATFORMS,  "platform_"); }
function setPlatformAny() { _setCategoryAny(    PLATFORMS,  "platform_"); }
function getPlatforms()   { return _getCategory(PLATFORMS,  "platform_"); }
function clearBrowsers()  { _clearCategory(     BROWSERS,   "browser_"); }
function setBrowserAny()  { _setCategoryAny(    BROWSERS,   "browser_"); }
function getBrowsers()    { return _getCategory(BROWSERS,   "browser_"); }