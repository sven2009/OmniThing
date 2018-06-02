#ifndef OMNI_ARDUINOJSONCONFIG_H
#define OMNI_ARDUINOJSONCONFIG_H

#include <Arduino.h>

namespace omni
{
    const char Config_Network_Receiver[] PROGMEM =
        R"BEGIN({"NetworkReceiver": {} })BEGIN";

    const char Config_Network_Sender[] PROGMEM =
        R"BEGIN({"NetworkSender": {} })BEGIN";

    const char Config_Composite_Periphs[] PROGMEM =
        R"BEGIN({"CompositePeriphs": [
                ]})BEGIN";

    const char Config_Input_Bools[] PROGMEM =
        R"BEGIN({"InputBools": [
                ]})BEGIN";

    const char Config_Input_Floats[] PROGMEM =
        R"BEGIN({"InputFloats": [
                ]})BEGIN";

    const char Config_Input_UInts[] PROGMEM =
        R"BEGIN({"InputUInts": [
                ]})BEGIN";

    const char Config_Output_Voids[] PROGMEM =
        R"BEGIN({"OutputVoids": [
                ]})BEGIN";

    const char Config_Output_Bools[] PROGMEM =
        R"BEGIN({"OutputBools": [
                ]})BEGIN";

    const char Config_Output_Floats[] PROGMEM =
        R"BEGIN({"OutputFloats": [
                ]})BEGIN";

    const char Config_Output_Strings[] PROGMEM =
        R"BEGIN({"OutputStrings": [
                ]})BEGIN";

    const char Config_Devices[] PROGMEM =
        R"BEGIN({"Devices": [
                ]})BEGIN";

    const char Config_Triggers[] PROGMEM =
        R"BEGIN({"Triggers": [
                ]})BEGIN";

    const char Config_Subscriptions[] PROGMEM =
        R"BEGIN({"Subscriptions": [
                ]})BEGIN";

}

#endif
