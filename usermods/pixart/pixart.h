//#include <SD.h>  // include the SD library, remove!

#pragma once

#include "wled.h"
#include <FS.h>


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

    unsigned long currentDuration = 1000; 
    String currAnim = ""; //This holds the current flow, If empty, no flow is active. When "stop" command is recived this will be cleared to ""
    String currScript = ""; //This is not yet implemented but should hold a list of animations and the duration of each, basically an animation of animations (to save space)
    String curDirList = ""; //commasepparated list of the available .ani files

    String animationFileEnd = ".ani"; // Should be .ani
    String framesFileEnd = ".frm";
    String scriptFileEnd = ".scr";


    // set your config variables to their boot default value (this can also be done in readFromConfig() or a constructor if you prefer)
    //bool testBool = false;
    //unsigned long testULong = 42424242;
    //float testFloat = 42.42;
    //String testString = "Forty-Two";

    //Set the default sleep time to one second, This should be read from config, would be nice
    //Not even sure this should be set like this at all. Depends on what we can do with JSON API
    unsigned long defaultDuration = 1;
    bool inMemCommands = true; //Load the command into ram on first call (on command), only true implemented for now. With a different file read logic, each kommand should be possible to read at runtime, if necessary
    
    //These are the main variables, holding the amination data in mem.
    uint8_t* fileContentFrm;
    size_t fileSizeFrm;
    uint8_t* fileContentAni;
    size_t fileSizeAni;
    uint32_t nextFrameFileIndex = 0;
    uint32_t firstFrameFileIndex = 0; //The first position holdning a non 0 frame data, when we loop we want to go to the second frame since frame 255 holds the data of setting upp like frame 0
    uint16_t nextAnimationFileIndex = 0;
    bool isLoaded = false;
    

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
      //Serial.begin(9600);
      initDone = true;
    }


    /*
     * connected() is called every time the WiFi is (re)connected
     * Use it to initialize network interfaces
     */
    void connected() {
      //Serial.println("Connected to WiFi!");
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
      if (!enabled || strip.isUpdating()) return;
      //Test
      // do your magic here
      //Sleep for the duration set by the flow step, or if no flow is active, default
      if (currAnim != ""){ //Don't do anything if no flow is active, not sure how that will work with the activation through JSON, but we'll see

        if (currAnim == "test" && millis() - lastTime > 1000) {
          Serial.begin(115200);

          Serial.println(strip.getPixelColor(9));
          Serial.println("Test run");
          SEGMENT.setPixelColor(9, RGBW32(255,0,0,0));
          Serial.println("Color Set");
          Serial.println(strip.getPixelColor(9));
          
          lastTime = millis();
          currAnim = "";
          return;
          
        }

        if (millis() - lastTime > currentDuration) {   
          Serial.begin(115200);
            Serial.println("Entered the function" + millis());
            lastTime = millis();
            currentDuration = 20000;
            //Check if the files are loaded into mem
            if(!isLoaded){
            //If not
                // Load them and set step to 0 or 255 (depending on logic) to set that the next frame need to load the first image, or load the first image.
                isLoaded = true;
                Serial.print("Loading .frm file");
                File fileFrm = WLED_FS.open("/" + currAnim + ".frm", "r");
                Serial.write( fileFrm.name());
                size_t fileSizeFrm = fileFrm.size(); // Get the size of the file
                uint8_t* fileContentFrm = new uint8_t[fileSizeFrm]; // Create an array to store the file content
                size_t bytesRead = fileFrm.read(fileContentFrm, fileSizeFrm); // Read the file into the array
                // Check if the file was read successfully
                if (bytesRead != fileSizeFrm) {
                    Serial.println("Failed to read .frm file.");
                    return;
                }
                // Close the file
                fileFrm.close();
                Serial.println("Frames file loaded into memory. Size of file ");
                Serial.println(sizeof(fileContentFrm));

                Serial.println("Loading .ani file");
                File fileAni = WLED_FS.open("/" + currAnim + ".ani", "r");
                size_t fileSizeAni = fileAni.size(); // Get the size of the file
                uint8_t* fileContentAni = new uint8_t[fileSizeAni]; // Create an array to store the file content
                bytesRead = fileAni.read(fileContentAni, fileSizeAni); // Read the file into the array
                // Check if the file was read successfully
                if (bytesRead != fileSizeAni) {
                    Serial.println("Failed to read .ani file.");
                    return;
                }
                // Close the file
                fileAni.close();
                Serial.print("Animation file loaded into memory. Size of file ");
                Serial.println(sizeof(*fileContentAni));
                
                
                //Set curentDuration from index 0
                //uint8_t frameIndex = fileContentAni[0]; //Should be 0 unless something is wrong
                //currentDuration = ((fileContentAni[1] << 8) | fileContentAni[2])*10; //Duration in 1/100th of a second * 10 for milliseconds

                //This frame is always complete. Sets all leds
                uint8_t thisFrame = 0;
                
                Serial.print("Number of frames: ");
                Serial.println(fileSizeFrm/6);

                for (int i = 0; i < fileSizeFrm; i += 6) { //While the first byte is 0, we are on the first frame
                    uint8_t thisPixelFrame = fileContentFrm[i]; //Read the first byte into a 8bit int representing the frame
                    if (thisPixelFrame == thisFrame){ //We are still draving the same frame
                      uint16_t pixelPosition = (fileContentFrm[i+1] << 8) | fileContentFrm[i+2];// read bytes 2 and 3 into a 16-bit integer representing the pixelPosition
                      uint8_t RedValue = fileContentFrm[i+3];// extract the next three bytes as 8-bit integers
                      uint8_t GreenValue = fileContentFrm[i+4];
                      uint8_t BlueValue = fileContentFrm[i+5];

                      // call strip.setPixelColor() function with the extracted values
                      //strip.setPixelColor(pixelPosition, RedValue, GreenValue, BlueValue, 0);//White led value in RGBW appears not used.
                      strip.setPixelColor(pixelPosition, RGBW32(RedValue,GreenValue,BlueValue,0));

                    } else {
                      firstFrameFileIndex = i; //This is the index we want to start looping from when we go back from 255, so we don't have to read through the entire first frame again
                      nextFrameFileIndex = i; //This is the next frames first byte
                      break; //Drawing, first frame done
                    }
                }
                Serial.print("Done with pixels of frame. Next pixel: ");
                Serial.print(nextFrameFileIndex/6);
                lastTime = millis();//On load restart the timer after this step i done to preserve duration of first frame, first time
                currentDuration = (fileContentAni[1] << 8) | fileContentAni[2]; //Duration in 1/100th of a second * 10 for milliseconds
                Serial.print("Current duration set to: ");
                Serial.println(currentDuration);
                currentDuration = currentDuration * 10;
                Serial.print("Current duration set to: ");
                Serial.println(currentDuration);

                int stoptimer = millis();
                while(millis() < stoptimer + 3000){
                  //Wait
                }
                Serial.println("Done waiting");
                
                stoptimer = millis();
                while(millis() < stoptimer + 3000){
                  //Wait
                }
                Serial.println("Done waiting 2");
                
            } else{
              //Files are loaded into memory 
              //First image is drawn and we're just looping along 
              lastTime = millis();//Start the timer directly to ensure timing precision over "show time", i.e. duration is time between start and next start, no matter the drawing time
              nextAnimationFileIndex += 3;
              uint8_t thisFrame = fileContentAni[nextAnimationFileIndex]; //There COULD be frames with no changes, i,e, no frames to change. So step throug all frames by ID
              currentDuration = ((fileContentAni[nextAnimationFileIndex+1] << 8) | fileContentAni[nextAnimationFileIndex+2])*10; //Duration in 1/100th of a second * 10 for milliseconds

              int len = sizeof(fileContentFrm) / sizeof(fileContentFrm[0]);
              for (int i = nextFrameFileIndex; i < len; i += 5) { //Start reading from the index we identified as the first frame of the next fram, when drawing the last frame
                  uint8_t thisPixelFrame = fileContentFrm[i]; //Read the first byte into a 8bit int representing the frame
                  if (thisPixelFrame == thisFrame){ //We are still draving the same frame
                    uint16_t pixelPosition = (fileContentFrm[i+1] << 8) | fileContentFrm[i+2];// read bytes 2 and 3 into a 16-bit integer representing the pixelPosition
                    uint8_t RedValue = fileContentFrm[i+3];// extract the next three bytes as 8-bit integers
                    uint8_t GreenValue = fileContentFrm[i+4];
                    uint8_t BlueValue = fileContentFrm[i+5];

                    // call strip.setPixelColor() function with the extracted values
                    strip.setPixelColor(pixelPosition, RedValue, GreenValue, BlueValue, 0);//White led value in RGBW appears not used.
                      Serial.println(pixelPosition);
                      Serial.println(RedValue);
                      Serial.println(GreenValue);
                      Serial.println(BlueValue);

                  } else {
                      nextFrameFileIndex = i; //This is the next frames first byte
                      break; //Drawing, first frame done
                  }
              }
              //If we end up here, we have reached the end of the file, and we  must decide what to do now
              if(thisFrame==255){
                nextFrameFileIndex = firstFrameFileIndex; //Loop the animation. Frame 255 has set the image back to frame 0 so we start next round by chaging to frame 1
              } else{
                //Stop the animation
                currAnim = "";
                //Reset all variables
                currentDuration = defaultDuration;
                delete[] fileContentFrm;
                delete[] fileContentAni;
                nextFrameFileIndex = 0;
                firstFrameFileIndex = 0;
                nextAnimationFileIndex = 0;
                isLoaded = false;
              }

            }
        }
      }
    }

    void updateAnimationFileList() {
      Serial.println("Updating List");
      String retStr = "";
      WLED_FS.begin();
      File root = WLED_FS.open("/");
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
      
      Serial.println("Adding to JSON");
      updateAnimationFileList();
      Serial.println("List updated");
      JsonObject stateJson = root[FPSTR(_name)];
      if (stateJson.isNull()) stateJson = root.createNestedObject(FPSTR(_name));
      // this creates an array named Current and adds values to it:
      //stateJson["ArrayValues"].add(1203);
      //This creates a value with the label Current2
      //stateJson["SingleValue"] = 1203;
      stateJson["Load time debug"] = millis();
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
    {}


    /*
     * handleOverlayDraw() is called just before every show() (LED strip update frame) after effects have set the colors.
     * Use this to blank out some LEDs or set them to a different color regardless of the set effect mode.
     * Commonly used for custom clocks (Cronixie, 7 segment)
     */
    void handleOverlayDraw()
    {
      //strip.setPixelColor(0, RGBW32(0,0,0,0)) // set the first pixel to black
      strip.setPixelColor(0, RGBW32(0,255,0,0));
      strip.setPixelColor(2, RGBW32(255,0,0,0));

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