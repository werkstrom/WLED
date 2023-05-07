//#include <SD.h>  // include the SD library, remove!

#pragma once

#include "wled.h"
#include <FS.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>


/*
 * Usermods allow you to add own functionality to WLED more easily
 * See: https://github.com/Aircoookie/WLED/wiki/Add-own-functionality
 * 
 * This is an example for a v2 usermod.
 * v2 usermods are class inheritance based and can (but don't have to) implement more functions, each of them is shown in this example.
 * Multiple v2 usermods can be added to one compilation easily.
 * 
 * Creating a usermod:
 * This file serves as an example. If you want to create a usermod, it is recommended to use usermod_v2_empty.h from the usermods folder as a template.
 * Please remember to rename the class and file to a descriptive name.
 * You may also use multiple .h and .cpp files.
 * 
 * Using a usermod:
 * 1. Copy the usermod into the sketch folder (same folder as wled00.ino)
 * 2. Register the usermod by adding #include "usermod_filename.h" in the top and registerUsermod(new MyUsermodClass()) in the bottom of usermods_list.cpp
 */

//class name. Use something descriptive and leave the ": public Usermod" part :)
class PixelArtHelper : public Usermod {

  private:

    // Private class members. You can declare variables and functions only accessible to your usermod here
    
    bool enabled = true; 
    bool initDone = false;
    unsigned long lastTime = 0;

    unsigned long currentDuration = 10; 
    double durationMultiplyer = 1.00;
    String currAnim = ""; //This holds the current flow, If empty, no flow is active. When "stop" command is recived this will be cleared to ""
    String currScript = ""; //This is not yet implemented but should hold a list of animations and the duration of each, basically an animation of animations (to save space)
    String curDirList = ""; //commasepparated list of the available .ani files

    String animationFileEnd = ".ani"; // Should be .ani
    String framesFileEnd = ".frm";
    String scriptFileEnd = ".scr";
    File fileDirectFrm;
    File fileDirectAni;
    uint8_t oldMode = 0;

    int RenderedFromRam = 0;
    int RenderedFromFile = 0;


    // set your config variables to their boot default value (this can also be done in readFromConfig() or a constructor if you prefer)
    //bool testBool = false;
    //unsigned long testULong = 42424242;
    //float testFloat = 42.42;
    //String testString = "Forty-Two";

    //Set the default sleep time to one second, This should be read from config, would be nice
    //Not even sure this should be set like this at all. Depends on what we can do with JSON API
    unsigned long defaultDuration = 1000;
    uint16_t pixelsInBuffer = 0;
    bool inMemCommands = true; //Load the command into ram on first call (on command), only true implemented for now. With a different file read logic, each kommand should be possible to read at runtime, if necessary
    
    //These are the main variables, holding the amination data in mem.
    uint8_t* fileContentFrm;
    size_t fileSizeFrm;
    uint8_t* fileContentAni;
    size_t fileSizeAni = 0;
    size_t nextFrameFileIndex = 0;
    int firstFrameFileIndex = 0; //The first position holdning a non 0 frame data, when we loop we want to go to the second frame since frame 255 holds the data of setting upp like frame 0
    uint16_t nextAnimationFileIndex = 0;
    bool isLoaded = false;
    String thisAnimFileName = ""; 
    

    // These config variables have defaults set inside readFromConfig()
    //Should be explored
    //int testInt;
    //long testLong;
    //int8_t testPins[2];

    // string that are used multiple time (this will save some flash memory)
    static const char _name[];
    static const char _enabled[];


    // any private methods should go here (non-inline methosd should be defined out of class)
    //void publishMqtt(const char* state, bool retain = false); // example for publishing MQTT message


  public:

    // non WLED related methods, may be used for data exchange between usermods (non-inline methods should be defined out of class)

    /**
     * Enable/Disable the usermod
     */
    inline void enable(bool enable) { enabled = enable; }

    /**
     * Get usermod enabled/disabled state
     */
    inline bool isEnabled() { return enabled; }

    // in such case add the following to another usermod:
    //  in private vars:
    //   #ifdef USERMOD_EXAMPLE
    //   MyExampleUsermod* UM;
    //   #endif
    //  in setup()
    //   #ifdef USERMOD_EXAMPLE
    //   UM = (MyExampleUsermod*) usermods.lookup(USERMOD_ID_EXAMPLE);
    //   #endif
    //  somewhere in loop() or other member method
    //   #ifdef USERMOD_EXAMPLE
    //   if (UM != nullptr) isExampleEnabled = UM->isEnabled();
    //   if (!isExampleEnabled) UM->enable(true);
    //   #endif


    // methods called by WLED (can be inlined as they are called only once but if you call them explicitly define them out of class)

    /*
     * setup() is called once at boot. WiFi is not yet connected at this point.
     * readFromConfig() is called prior to setup()
     * You can use it to initialize variables, sensors or similar.
     */
    void setup() {
      // do your set-up here
      //Serial.println("Hello from my usermod!");
      currentDuration = defaultDuration;
      Serial.begin(115200);
      initDone = true;
    }


    /*
     * connected() is called every time the WiFi is (re)connected
     * Use it to initialize network interfaces
     */
    void connected() {
      //Serial.println("Connected to WiFi!");
    }

    uint16_t testCode(int testInt){
        Serial.println(testInt);
        return 350;
    }
    /*
     * loop() is called continuously. Here you can check for events, read sensors, etc.
     * 
     * Tips:
     * 1. You can use "if (WLED_CONNECTED)" to check for a successful network connection.
     *    Additionally, "if (WLED_MQTT_CONNECTED)" is available to check for a connection to an MQTT broker.
     * 
     * 2. Try to avoid using the delay() function. NEVER use delays longer than 10 milliseconds.
     *    Instead, use a timer check as shown here.
     */
    void loop() {
      // if usermod is disabled or called during strip updating just exit
      // NOTE: on very long strips strip.isUpdating() may always return true so update accordingly
      if (!enabled || strip.isUpdating()) {
        return;
      }
      // do your magic here
      //Sleep for the duration set by the flow step, or if no flow is active, default
    }

    void updateAnimationFileList() {
      String retStr = "";
      WLED_FS.begin();
      File root = WLED_FS.open("/", "r");
      File file = root.openNextFile();
      while (file) {
        String fileName = file.name();
        // Strip leading '/'
        if (fileName.startsWith("/")) {
          fileName = fileName.substring(1);
        }
        // Strip file extension
        int extIndex = fileName.lastIndexOf('.');
        if (extIndex != -1) {
          String fileExt = fileName.substring(extIndex);
          if (fileExt == animationFileEnd) {
            fileName = fileName.substring(0, extIndex);
            if (retStr.length() > 0) { //If this is not the first
              retStr += ", ";
            }
            retStr += fileName;
          }
        }
        file = root.openNextFile();
      }
      curDirList = retStr;
    }

    
    /*
     * addToJsonInfo() can be used to add custom entries to the /json/info part of the JSON API.
     * Creating an "u" object allows you to add custom key/value pairs to the Info section of the WLED web UI.
     * Below it is shown how this could be used for e.g. a light sensor
     */
    void addToJsonInfo(JsonObject& root)
    {
      // if "u" object does not exist yet wee need to create it
      JsonObject user = root[FPSTR(_name)];
      if (user.isNull()) user = root.createNestedObject(FPSTR(_name));
      user["Time loaded"].add(1000);
    }


    /*
     * addToJsonState() can be used to add custom entries to the /json/state part of the JSON API (state object).
     * Values in the state object may be modified by connected clients
     */
    void addToJsonState(JsonObject& root)
    {

      if (!initDone || !enabled) return;  // prevent crash on boot applyPreset()
      
      updateAnimationFileList();
      JsonObject stateJson = root[FPSTR(_name)];
      if (stateJson.isNull()) stateJson = root.createNestedObject(FPSTR(_name));
      // this creates an array named Current and adds values to it:
      //stateJson["ArrayValues"].add(1203);
      //This creates a value with the label Current2
      //stateJson["SingleValue"] = 1203;
      stateJson["anim"] = currAnim;
      stateJson["script"] = currScript;
      stateJson["files"] = curDirList;
    }


    /*
     * readFromJsonState() can be used to receive data clients send to the /json/state part of the JSON API (state object).
     * Values in the state object may be modified by connected clients
     */
    void readFromJsonState(JsonObject& root)
    {
      if (!initDone) return;  // prevent crash on boot applyPreset()

      JsonObject stateJson = root[FPSTR(_name)];
      if (!stateJson.isNull()) {
        // expect JSON usermod data in usermod name object: {"ExampleUsermod:{"user0":10}"}
         currAnim = stateJson["anim"] | currAnim; //if "anim" key exists in JSON, update, else keep old value
      }
      // you can as well check WLED state JSON keys
      //if (root["bri"] == 255) Serial.println(F("Don't burn down your garage!"));
    }


    /*
     * addToConfig() can be used to add custom persistent settings to the cfg.json file in the "um" (usermod) object.
     * It will be called by WLED when settings are actually saved (for example, LED settings are saved)
     * If you want to force saving the current state, use serializeConfig() in your loop().
     * 
     * CAUTION: serializeConfig() will initiate a filesystem write operation.
     * It might cause the LEDs to stutter and will cause flash wear if called too often.
     * Use it sparingly and always in the loop, never in network callbacks!
     * 
     * addToConfig() will make your settings editable through the Usermod Settings page automatically.
     *
     * Usermod Settings Overview:
     * - Numeric values are treated as floats in the browser.
     *   - If the numeric value entered into the browser contains a decimal point, it will be parsed as a C float
     *     before being returned to the Usermod.  The float data type has only 6-7 decimal digits of precision, and
     *     doubles are not supported, numbers will be rounded to the nearest float value when being parsed.
     *     The range accepted by the input field is +/- 1.175494351e-38 to +/- 3.402823466e+38.
     *   - If the numeric value entered into the browser doesn't contain a decimal point, it will be parsed as a
     *     C int32_t (range: -2147483648 to 2147483647) before being returned to the usermod.
     *     Overflows or underflows are truncated to the max/min value for an int32_t, and again truncated to the type
     *     used in the Usermod when reading the value from ArduinoJson.
     * - Pin values can be treated differently from an integer value by using the key name "pin"
     *   - "pin" can contain a single or array of integer values
     *   - On the Usermod Settings page there is simple checking for pin conflicts and warnings for special pins
     *     - Red color indicates a conflict.  Yellow color indicates a pin with a warning (e.g. an input-only pin)
     *   - Tip: use int8_t to store the pin value in the Usermod, so a -1 value (pin not set) can be used
     *
     * See usermod_v2_auto_save.h for an example that saves Flash space by reusing ArduinoJson key name strings
     * 
     * If you need a dedicated settings page with custom layout for your Usermod, that takes a lot more work.  
     * You will have to add the setting to the HTML, xml.cpp and set.cpp manually.
     * See the WLED Soundreactive fork (code and wiki) for reference.  https://github.com/atuline/WLED
     * 
     * I highly recommend checking out the basics of ArduinoJson serialization and deserialization in order to use custom settings!
     */
    void addToConfig(JsonObject& root)
    {
      JsonObject top = root.createNestedObject(FPSTR(_name));
      top[FPSTR(_enabled)] = enabled;
      //save these vars persistently whenever settings are saved
      top["great"] = userVar0;
      top["defaultDuration"] = defaultDuration;
      top["pixels_in_buffer"] = pixelsInBuffer;
      //top["inMem"] = inMemCommands;
      //top["durationMultiplyer"] = durationMultiplyer;
      //top["testInt"] = testInt;
      //top["testLong"] = testLong;
      //top["testULong"] = testULong;
      //top["testFloat"] = testFloat;
      //top["testString"] = testString;
      //JsonArray pinArray = top.createNestedArray("pin");
      //pinArray.add(testPins[0]);
      //pinArray.add(testPins[1]); 
    }


    /*
     * readFromConfig() can be used to read back the custom settings you added with addToConfig().
     * This is called by WLED when settings are loaded (currently this only happens immediately after boot, or after saving on the Usermod Settings page)
     * 
     * readFromConfig() is called BEFORE setup(). This means you can use your persistent values in setup() (e.g. pin assignments, buffer sizes),
     * but also that if you want to write persistent values to a dynamic buffer, you'd need to allocate it here instead of in setup.
     * If you don't know what that is, don't fret. It most likely doesn't affect your use case :)
     * 
     * Return true in case the config values returned from Usermod Settings were complete, or false if you'd like WLED to save your defaults to disk (so any missing values are editable in Usermod Settings)
     * 
     * getJsonValue() returns false if the value is missing, or copies the value into the variable provided and returns true if the value is present
     * The configComplete variable is true only if the "exampleUsermod" object and all values are present.  If any values are missing, WLED will know to call addToConfig() to save them
     * 
     * This function is guaranteed to be called on boot, but could also be called every time settings are updated
     */
    bool readFromConfig(JsonObject& root)
    {
      // default settings values could be set here (or below using the 3-argument getJsonValue()) instead of in the class definition or constructor
      // setting them inside readFromConfig() is slightly more robust, handling the rare but plausible use case of single value being missing after boot (e.g. if the cfg.json was manually edited and a value was removed)

      JsonObject top = root[FPSTR(_name)];

      bool configComplete = !top.isNull();

      configComplete &= getJsonValue(top["great"], userVar0);
      configComplete &= getJsonValue(top["deafaultDuration"], defaultDuration);
      configComplete &= getJsonValue(top["frames_in_buffer"], pixelsInBuffer, 4000);
      //configComplete &= getJsonValue(top["frames_in_buffer"], inMemCommands, false);
      //configComplete &= getJsonValue(top["durationMultiplyer"], durationMultiplyer);
      //configComplete &= getJsonValue(top["testULong"], testULong);
      //configComplete &= getJsonValue(top["testFloat"], testFloat);
      //configComplete &= getJsonValue(top["testString"], testString);

      // A 3-argument getJsonValue() assigns the 3rd argument as a default value if the Json value is missing
      //configComplete &= getJsonValue(top["testInt"], testInt, 42);  
      //configComplete &= getJsonValue(top["testLong"], testLong, -42424242);

      // "pin" fields have special handling in settings page (or some_pin as well)
      //configComplete &= getJsonValue(top["pin"][0], testPins[0], -1);
      //configComplete &= getJsonValue(top["pin"][1], testPins[1], -1);

      return configComplete;
    }


    /*
     * appendConfigData() is called when user enters usermod settings page
     * it may add additional metadata for certain entry fields (adding drop down is possible)
     * be careful not to add too much as oappend() buffer is limited to 3k
     */
    void appendConfigData()
    {

    }
    void printSystemInfo(){
      Serial.print("Arduino core version: ");
      Serial.println(ARDUINO);
      Serial.print("Commands in memory: ");
      Serial.println(inMemCommands);      
    }


    void getFrameInfo(int thisFileIndex, uint8_t* frameID, unsigned long* frameDuration){
      uint16_t readDur;
      if(inMemCommands){
        *frameID = fileContentAni[thisFileIndex]; //There COULD be frames with no changes, i,e, no frames to change. So step throug all frames by ID
        *frameDuration = (int)(((fileContentAni[thisFileIndex+1] << 8) | fileContentAni[thisFileIndex+2])*10*durationMultiplyer); //Duration in 1/100th of a second * 10 for milliseconds
      } else {
        //Get data from FLASH
        if (!fileDirectAni.available()){
          fileDirectAni = WLED_FS.open(thisAnimFileName, "r");
        }
        fileDirectAni.seek(thisFileIndex);
        fileDirectAni.read(&*frameID, 1);
        fileDirectAni.read((uint8_t *)&readDur, sizeof(readDur));
        readDur = (readDur >> 8) | (readDur << 8);
        *frameDuration = (readDur * 10);
      }
    }

    uint8_t getThisFrameID(int thisFileIndex){
      uint8_t result;
      if(inMemCommands){
        //Get data from RAM
        result = fileContentFrm[thisFileIndex];
      } else {
        //Get data from FLASH
        if (!fileDirectFrm.available()){
          fileDirectFrm = WLED_FS.open("/" + currAnim + ".frm", "r");
        }
        fileDirectFrm.seek(thisFileIndex);
        fileDirectFrm.read(&result, 1);
      }
      return result;
    }

    void setThisPixel(int thisFileIndex){
      uint16_t pixelPosition;
      uint8_t RedValue;
      uint8_t GreenValue;
      uint8_t BlueValue;
      if(inMemCommands){
        //Get data from RAM
        pixelPosition = (fileContentFrm[thisFileIndex+1] << 8) | fileContentFrm[thisFileIndex+2];// read bytes 2 and 3 into a 16-bit integer representing the pixelPosition
        RedValue = fileContentFrm[thisFileIndex+3];// extract the next three bytes as 8-bit integers
        GreenValue = fileContentFrm[thisFileIndex+4];
        BlueValue = fileContentFrm[thisFileIndex+5];
        RenderedFromRam += 1;
      } else {
        //Get data from FLASH
        if (!fileDirectFrm.available()){
          fileDirectFrm = WLED_FS.open("/" + currAnim + ".frm", "r");
        }
        fileDirectFrm.seek(thisFileIndex+1);
        fileDirectFrm.read((uint8_t *)&pixelPosition, sizeof(pixelPosition));
        // Convert the byte order (ESP32 is little-endian)
        pixelPosition = (pixelPosition >> 8) | (pixelPosition << 8);
        fileDirectFrm.read(&RedValue, 1);
        fileDirectFrm.read(&GreenValue, 1);
        fileDirectFrm.read(&BlueValue, 1);
        RenderedFromFile +=1;
      }
    strip.setPixelColor(pixelPosition, RGBW32(RedValue,GreenValue,BlueValue,0));
    }

    void resetAnimation(){
          Serial.print("Resetting/Stopping animation: ");
          Serial.println(currAnim);
          delete[] fileContentFrm;
          delete[] fileContentAni;
          fileSizeFrm = 0;
          fileSizeAni = 0;
          isLoaded = false;
          nextFrameFileIndex = 0;
          firstFrameFileIndex = 0; 
          nextAnimationFileIndex = 0;
          RenderedFromFile = 0;
          RenderedFromRam = 0;
    }
    /*
     * handleOverlayDraw() is called just before every show() (LED strip update frame) after effects have set the colors.
     * Use this to blank out some LEDs or set them to a different color regardless of the set effect mode.
     * Commonly used for custom clocks (Cronixie, 7 segment)
     */
    void handleOverlayDraw()
    {
      if (currAnim != ""){ //Don't do anything if no flow is active, not sure how that will work with the activation through JSON, but we'll see
        if (SEGMENT.mode != FX_MODE_PIXELART) {
          SEGMENT.setMode(FX_MODE_PIXELART);
          Serial.print("Mode set to: ");
          Serial.println(SEGMENT.mode);
        }
        if (millis() - lastTime > currentDuration) {
          
          lastTime = millis();
          thisAnimFileName = "/" + currAnim + ".ani";

          //check the file sizes
          if (fileSizeAni == 0){
            printSystemInfo();
            File fileAni = WLED_FS.open("/" + currAnim + ".ani", "r");
            if (fileAni.available()){
              size_t bytesRead = fileAni.size(); // Get the size of the file
              fileSizeAni = bytesRead;
            }
            if(inMemCommands){
              fileContentAni = new uint8_t[fileSizeAni]; // Create an array to store the file content
              size_t bytesRead = fileAni.read(fileContentAni, fileSizeAni); // Read the file into the array
              // Check if the file was read successfully
              if (bytesRead != fileSizeAni) {
                  Serial.println("Failed to read .ani file.");
                  return;
              }
            }
            // Close the file
            fileAni.close(); 
          }

          if (fileSizeFrm == 0){
            File fileFrm = WLED_FS.open("/" + currAnim + ".frm", "r");
            if (fileFrm.available()){
              size_t bytesRead = fileFrm.size(); // Get the size of the file
              fileSizeFrm = bytesRead;
            }
            if(inMemCommands){
              fileContentFrm = new uint8_t[fileSizeFrm]; // Create an array to store the file content
              size_t bytesRead = fileFrm.read(fileContentFrm, fileSizeFrm); // Read the file into the array
              // Check if the file was read successfully
              if (bytesRead != fileSizeFrm) {
                  Serial.println("Failed to read .frm file.");
                  return;
              }
            }
            // Close the file
            fileFrm.close();
          }

          //Check if this is first run of animation
          if (!isLoaded){
            nextAnimationFileIndex = 0;
            nextFrameFileIndex = 0;
            isLoaded = true;
          }

          uint8_t thisFrame = 0; //Initialize the variable
          if(nextAnimationFileIndex >= fileSizeAni){
            // We've ended up here because the frames file is not EOF, but the animation file is. This means there is a 255 frame in the animation file. We should read duration from position 1 and 2 in the array and set the frame to 255
            nextAnimationFileIndex = 0;
            getFrameInfo(0, &thisFrame, &currentDuration);
            thisFrame = 255;
          } else {
            getFrameInfo(nextAnimationFileIndex, &thisFrame, &currentDuration);
          }
          unsigned long timeUpToRender = millis() - lastTime;
          for (int i = nextFrameFileIndex; i < fileSizeFrm; i += 6) { //Start from the index where w noticed a change in 
              uint8_t thisPixelFrame = getThisFrameID(i);
              if (thisPixelFrame == thisFrame){ //We are still draving the same frame
                setThisPixel(i);
                if(i + 6 >= fileSizeFrm){
                  //Next frame is outside of file, i.e. frames file is at its last pixel.
                  nextFrameFileIndex = fileSizeFrm;
                }
              } else {
                
                if(thisFrame == 0) {
                  firstFrameFileIndex = i; //This is the index we want to start looping from when we go back from 255, so we don't have to read through the entire first frame again
                }
                
                nextFrameFileIndex = i; //This is the next frames first byte
                break; //Drawing, this frame done
              }
          }
          unsigned long timeInRenderLoop = millis() - lastTime - timeUpToRender;
          if (nextFrameFileIndex >= fileSizeFrm){
            //End of the animation file
            if (thisFrame == 255){
              //animation should repeat
              thisFrame = 0;
              nextFrameFileIndex = firstFrameFileIndex;
              nextAnimationFileIndex = 3;
            } else {
              resetAnimation();
            }  
          } else {
            nextAnimationFileIndex += 3; //Move 3 bytes on to the next animation frame
          }
          unsigned long usedTime = millis() - lastTime;
          uint16_t fps = strip.getFps();
          //strip.getModeData(1);
          Serial.print("Frame ");
          Serial.print(thisFrame);
          Serial.print(" off ");
          Serial.print(currAnim);
          Serial.print(" rendered ");
          if(inMemCommands)
            { 
              Serial.print("from RAM ");
            } else {
              Serial.print("from FLASH ");
            }
          Serial.print("in: ");
          Serial.print(usedTime);
          Serial.print(" ms. (R/F ");
          Serial.print(RenderedFromRam);
          Serial.print("/");
          Serial.print(RenderedFromFile);
          Serial.print(") Strip fps: ");
          Serial.print(fps);
          Serial.print(" Time before render loop: ");
          Serial.print(timeUpToRender);
          Serial.print(" Time in render loop: ");
          Serial.println(timeInRenderLoop);
          
        }
      } else {
        if(isLoaded){
          resetAnimation();
        }
      }
    }


    /**
     * handleButton() can be used to override default button behaviour. Returning true
     * will prevent button working in a default way.
     * Replicating button.cpp
     */
    bool handleButton(uint8_t b) {
      yield();
      // ignore certain button types as they may have other consequences
      if (!enabled
       || buttonType[b] == BTN_TYPE_NONE
       || buttonType[b] == BTN_TYPE_RESERVED
       || buttonType[b] == BTN_TYPE_PIR_SENSOR
       || buttonType[b] == BTN_TYPE_ANALOG
       || buttonType[b] == BTN_TYPE_ANALOG_INVERTED) {
        return false;
      }

      bool handled = false;
      // do your button handling here
      return handled;
    }


  

#ifndef WLED_DISABLE_MQTT
    /**
     * handling of MQTT message
     * topic only contains stripped topic (part after /wled/MAC)
     */
    bool onMqttMessage(char* topic, char* payload) {
      return false;
    }

    /**
     * onMqttConnect() is called when MQTT connection is established
     */
    void onMqttConnect(bool sessionPresent) {
    }
#endif


    /**
     * onStateChanged() is used to detect WLED state change
     * @mode parameter is CALL_MODE_... parameter used for notifications
     */
    void onStateChange(uint8_t mode) {
      // do something if WLED state changed (color, brightness, effect, preset, etc)
    }


    /*
     * getId() allows you to optionally give your V2 usermod an unique ID (please define it in const.h!).
     * This could be used in the future for the system to determine whether your usermod is installed.
     */
    uint16_t getId()
    {
      return USERMOD_PIXART;
    }

   //More methods can be added in the future, this example will then be extended.
   //Your usermod will remain compatible as it does not need to implement all methods from the Usermod base class!
};


// add more strings here to reduce flash memory usage
const char PixelArtHelper::_name[]    PROGMEM = "pixart";
const char PixelArtHelper::_enabled[] PROGMEM = "enabled";