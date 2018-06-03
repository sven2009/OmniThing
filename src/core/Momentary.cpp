#include "Momentary.h"

#include "Logger.h"
#include "OmniThing.h"
#include "OutputVoid.h"
#include <string.h>
#include "frozen.h"

namespace omni
{
//private
    void Momentary::sendJsonPacket(const char* event)
    {
        char buffer[100] = "";
        struct json_out out = JSON_OUT_BUF(buffer, sizeof(buffer));

        json_printf(&out, "{uid: %u, type: \"%s\", value: \"%s\"}", getUid(), getType(), event);

        LOG << buffer << Logger::endl;
        OmniThing::getInstance().sendJson(buffer);
    }

    void Momentary::push()
    {
        m_rOutput.writeVoid();
        sendJsonPacket(Event_Pushed);
    }

//protected
//public
    Momentary::Momentary(OutputVoid& output):
        Device(false),
        m_rOutput(output)
    {

    }

    Momentary::~Momentary()
    {

    }

    void Momentary::recvJson(const char* cmd, const char* json)
    {
        if(!strcmp(cmd, Cmd_Push))
        {
            LOG << F("Push triggered for ") << getType() << F(" ") << getUid() << Logger::endl;
            push();
        }
    }

    void Momentary::run()
    {

    }

    void Momentary::init()
    {

    }

    Device* Momentary::createFromJson(const char* json)
    {
        unsigned int outputIndex;

        unsigned int len = strlen(json);

        if(json_scanf(json, len, "{outputIndex: %u}", &outputIndex) != 1)
        {
            return nullptr;
        }

        auto& ovs = OmniThing::getInstance().getOutputVoids();
        if(outputIndex >= ovs.getCount())
        {
            LOG << F("ERROR: outputIndex is too large\n");
            return nullptr;
        }

        return new Momentary(*(ovs[outputIndex]));

    }

    
    // commands
    const char* Momentary::Cmd_Push = "push";

    // events
    const char* Momentary::Event_Pushed = "pushed";

    const char* Momentary::Type = "Momentary";
    ObjectConfig<Device> Momentary::DevConf(Type, createFromJson);
}
