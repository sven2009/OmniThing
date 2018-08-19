var blankConfiguration = {};
var configuration = {};

var rawJson = "";

var saveChangesFuncs = [];


configObjects = {};

var configObjectsReceived = 0;

var configAltered = false;

$(window).on('load', function(){
    objectFromFile("CompositePeriph",  "config/composite_peripherals.json", configInitialization);
    objectFromFile("InputFloat",       "config/input_floats.json", configInitialization);
    objectFromFile("NetworkSender",    "config/network_senders.json", configInitialization);
    objectFromFile("OutputString",     "config/output_strings.json", configInitialization);
    objectFromFile("Device",           "config/devices.json", configInitialization);
    objectFromFile("InputUInt",        "config/input_uints.json", configInitialization);
    objectFromFile("OutputBool",       "config/output_bools.json", configInitialization);
    objectFromFile("OutputVoid",       "config/output_voids.json", configInitialization);
    objectFromFile("InputBool",        "config/input_bools.json", configInitialization);
    objectFromFile("NetworkReceiver",  "config/network_receivers.json", configInitialization);
    objectFromFile("OutputFloat",      "config/output_floats.json", configInitialization);

    $("#buttonResetJson").click(resetConfig);

    $("#buttonImportJson").click(loadConfig);

    $("#buttonDiscardChanges").click(discardChanges);

    $("#buttonSaveChanges").click(saveChanges);

    $(window).bind('beforeunload', function(){
        if(configAltered)
        {
            return true;
        }
        return undefined;
    });
});

var configInitialization = function(){
    if(configObjectsReceived >= 11)
    {
        $.getJSON("blank_config.json", function(data){
            blankConfiguration = data;

            resetConfig();
            configAltered = false;
        });
    }
}

var sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var objectFromFile = function(objectName, filename, callback){
    $.getJSON(filename, function(data){
        configObjects[objectName] = data;
        ++configObjectsReceived;
        if(callback != null && callback != undefined)
        {
            callback();
        }
    });
}

var resetConfig = function(){
    configuration = Object.assign(blankConfiguration); 
    updateRawConfig();
}

var updateRawConfig = function(){
    configAltered = true;
    rawJson = JSON.stringify(configuration, null, 4);
    $("#raw_json").text(rawJson);

    saveChangesFuncs = [];
    renderAll();
}

var discardChanges = function(){
    updateRawConfig();
}

var saveChanges = function(){
    console.log("saveChanges()");

    var len = saveChangesFuncs.length;
    for(var i = 0; i < len; ++i)
    {
        saveChangesFuncs[i]();
    }

    updateRawConfig();
}

var renderParam = function(param, thing, uid, renderDepth){
    var pType = param.type;

    var paramId = uid+"-param-"+param.name;

    var formGroup = $("<div/>", {
        "class": "form-group",
        "id": paramId
    });

    var labelString = "<strong>" + param.name + "</strong> (type=" + param.type + "&ensp; required=" + param.required;
    if(param.default != undefined && param.default != null)
    {
        labelString += "&ensp; default=" + param.default;
    }
    labelString += "):";
    
    var descriptionString = "<i>" + param.description + "</i>";

    if(   pType == "InputBool" || pType == "InputFloat" || pType == "InputUInt"
       || pType == "OutputVoid" || pType == "OutputBool" || pType == "OutputFloat"
       || pType == "OutputString" || pType == "Device")
    {
        var thingCard = renderOmni(thing[param.name], configObjects[pType], uid+"_"+param.name, renderDepth+1, param.type+": ");
        formGroup.append(labelString);
        formGroup.append("<br/>");
        formGroup.append(descriptionString);
        formGroup.append("<br/>");
        formGroup.append(thingCard);
        return formGroup;
    }

    var inputId = uid+"-param-input-"+param.name;

    var label = $("<label/>", {
        "for": inputId
    });

    label.append(labelString);
    label.append("<br/>");
    label.append(descriptionString);

    if(pType == "bool")
    {
        var modalElementTrue = $("<div/>", {
            "class": "form-check form-check-inline"
        });

        var trueId = uid+"-param-"+param.name+"-bool-true";
        var inputElementTrue = $("<input/>", {
            "class": "form-check-input",
            "type": "radio",
            "name": uid+"-param-"+param.name+"-bool-name",
            "id": trueId,
            "value": "true" 
        });

        var labelElementTrue = $("<label/>", {
            "class": "form-check-label",
            "for": trueId
        });
        labelElementTrue.append("true");

        if(thing[param.name] == true)
        {
            inputElementTrue.attr("checked", "true");
        }

        modalElementTrue.append(inputElementTrue);
        modalElementTrue.append(labelElementTrue);



        var modalElementFalse = $("<div/>", {
            "class": "form-check form-check-inline"
        });

        var falseId = uid+"-param-"+param.name+"-bool-false";
        var inputElementFalse = $("<input/>", {
            "class": "form-check-input",
            "type": "radio",
            "name": uid+"-param-"+param.name+"-bool-name",
            "id": falseId,
            "value": "false" 
        });

        var labelElementFalse = $("<label/>", {
            "class": "form-check-label",
            "for": falseId
        });
        labelElementFalse.append("false");

        if(thing[param.name] == false)
        {
            inputElementFalse.attr("checked", "true");
        }

        modalElementFalse.append(inputElementFalse);
        modalElementFalse.append(labelElementFalse);

        formGroup.append(labelString);
        formGroup.append("<br/>");
        formGroup.append(descriptionString);
        formGroup.append("<br/>");

        formGroup.append(modalElementTrue);
        formGroup.append(modalElementFalse);

        saveChangesFuncs.push(function(){
            var val = $("input:radio[name=" + uid+"-param-"+param.name+"-bool-name]:checked").val();
            var bVal = false;

            if(val == "true")
            {
                bVal = true;
            }

            thing[param.name] = bVal;
        });

        return formGroup;
    }

    if(pType == "uint")
    {
        var input = $("<input/>", {
            "id": inputId,
            "class": "form-control",
            "type": "number"
        });

        input.val(thing[param.name]);

        formGroup.append(label);
        formGroup.append(input);

        saveChangesFuncs.push(function(){
            thing[param.name] = input.val();
        });
        return formGroup;
    }

    if(pType == "string")
    {
        var input = $("<input/>", {
            "id": inputId,
            "class": "form-control",
            "type": "text"
        });

        input.val(thing[param.name]);

        formGroup.append(label);
        formGroup.append(input);

        saveChangesFuncs.push(function(){
            thing[param.name] = input.val();
        });
        return formGroup;
    }

    if(pType == "enum")
    {
        var enumVals = param["enum"];
        var enumCount = enumVals.length;

        formGroup.append(labelString);
        formGroup.append("<br/>");
        formGroup.append(descriptionString);
        formGroup.append("<br/>");

        for(var i = 0; i < enumCount; i++)
        {
            var enumVal = enumVals[i];

            var modalElement = $("<div/>", {
                "class": "form-check form-check-inline"
            });

            var modalId = uid+"-param-"+param.name+"-enum-"+enumVal;
            var inputElement = $("<input/>", {
                "class": "form-check-input",
                "type": "radio",
                "name": uid+"-param-"+param.name+"-enum-name",
                "id": modalId,
                "value": enumVal
            });

            var labelElement = $("<label/>", {
                "class": "form-check-label",
                "for": modalId
            });
            labelElement.append(enumVal);

            if(thing[param.name] == enumVal)
            {
                inputElement.attr("checked", "true");
            }

            modalElement.append(inputElement);
            modalElement.append(labelElement);

            formGroup.append(modalElement);
        }


        saveChangesFuncs.push(function(){
            var val = $("input:radio[name=" + uid+"-param-"+param.name+"-enum-name]:checked").val();

            thing[param.name] = val;
        });
        return formGroup;
    }
}

var renderOmni = function(thing, configObject, uid, renderDepth, prepend){
    var type = getType(configObject, thing.type);
    var parameters = type.parameters;
    var paramsLength = parameters.length;

    var cardClass = "card border-secondary"
    if(renderDepth % 2 == 0)
    {
        cardClass += " bg-secondary";
    }

    var cardElement = $("<div/>", {
        "class": cardClass
    });

    var cardHeaderElement = $("<div/>", {
        "class": "card-header bg-primary"
    });

    var headerText = "";
    if(prepend != null && prepend != undefined)
    {
        headerText += prepend;
    }
    headerText += thing.type;

    cardHeaderElement.append(headerText);
    cardElement.append(cardHeaderElement);

    var cardBodyElement = $("<div/>", {
        "class": "card-body"
    });

    var formElement = $("<form/>");

    if(thing.name != null && thing.name != undefined)
    {
        var nameId = uid+"-name";
        var formGroupName = $("<div/>", {
            "class": "input-group",
            "id": nameId
        });

        var prependElement = $("<div/>", {
            "class": "input-group-prepend"
        });
        var buttonElement = $("<button/>", {
            "class": "btn btn-primary",
            "type": "button"
        });

        buttonElement.append("Change Name");

        prependElement.append(buttonElement);
        formGroupName.append(prependElement);

        var nameInputId = uid+"-name-input";
        var inputNameElement = $("<input/>", {
            "id": nameInputId,
            "class": "form-control",
            "type": "text"
        });

        buttonElement.click(function(){
            var name = thing.name;
            var newName = inputNameElement.val();
            var things = configuration.Devices;
            var numThings = things.length;
            var found = false;

            if(newName == name)
            {
                console.log("No name change");
                return;
            }

            for(var i = 0; i < numThings; ++i)
            {
                var tmp = things[i];
                if(tmp.name == name)
                {
                    found = true;
                    tmp.name = newName;
                    break;
                }
            }

            if(!found)
            {
                var things = configuration.CompositePeriphs;
                var numThings = things.length;

                for(var i = 0; i < numThings; ++i)
                {
                    var tmp = things[i];
                    if(tmp.name == name)
                    {
                        found = true;
                        tmp.name = newName;
                        break;
                    }
                }
            }

            saveChanges();
        });

        inputNameElement.val(thing.name);

        formGroupName.append(inputNameElement);

        formElement.append(formGroupName);
    }


    for(var i = 0; i < paramsLength; i++)
    {
        var param = parameters[i];
        
        var paramElement = renderParam(param, thing, uid, renderDepth);

        formElement.append(paramElement);
    }


    cardBodyElement.append(formElement);
    cardElement.append(cardBodyElement);

    return cardElement;

}

var renderAll = function(){
    renderDevices();
    renderComposites();
    renderNetworkReceiver();
    renderNetworkSender();
}

var renderDevices = function(){
    var devices = configuration.Devices;
    var length = devices.length;

    var listDiv = $("#list-devices");
    var contentDiv = $("#content-list-devices");

    listDiv.empty();
    contentDiv.empty();

    for(var i = 0; i < length; i++)
    {
        var device = devices[i];

        var selectorId = "selectorDevice-" + device.name;
        var selectorText = device.name;

        var contentId = "contentDevice-" + device.name;

        console.log("Adding device named " + device.name);

        var listItem = $("<a/>", {
            "id": selectorId,
            "class": "list-group-item list-group-item-action",
            "data-toggle": "list",
            "href": "#" + contentId, 
            "role": "tab",
            "aria-control": contentId
        });

        listItem.append(selectorText);
        listDiv.append(listItem);


        var contentItem = $("<div/>", {
            "id": contentId,
            "class": "tab-pane show",
            "role": "tabpanel",
            "aria-labelledby": selectorId
        });

        contentItem.append(renderOmni(device, configObjects["Device"], device.name, 0, device.name+": "));
        contentDiv.append(contentItem);
    }
}

var renderComposites = function(){
    var composites = configuration.CompositePeriphs;
    var length = composites.length;

    var listDiv = $("#list-composites");
    var contentDiv = $("#content-list-composites");

    listDiv.empty();
    contentDiv.empty();

    for(var i = 0; i < length; i++)
    {
        var composite = composites[i];

        var selectorId = "selectorComposite-" + composite.name;
        var selectorText = composite.name;

        var contentId = "contentComposite-" + composite.name;

        console.log("Adding composite peripheral named " + composite.name);

        var listItem = $("<a/>", {
            "id": selectorId,
            "class": "list-group-item list-group-item-action",
            "data-toggle": "list",
            "href": "#" + contentId, 
            "role": "tab",
            "aria-control": contentId
        });

        listItem.append(selectorText);
        listDiv.append(listItem);


        var contentItem = $("<div/>", {
            "id": contentId,
            "class": "tab-pane show",
            "role": "tabpanel",
            "aria-labelledby": selectorId
        });

        contentItem.append(renderOmni(composite, configObjects["CompositePeriph"], composite.name, 0, composite.name+": "));
        contentDiv.append(contentItem);
    }

}

var renderNetworkReceiver = function(){
    cardBody = $("#card-body-nreceiver");
    cardBody.empty();

    if(configuration.NetworkReceiver.type != undefined && configuration.NetworkReceiver.type != null)
    {
        var deleteButton = $("<button/>", {
            "id": "button-delete-nreceiver",
            "class": "btn btn-danger"
        });
        deleteButton.append("Delete Network Receiver");

        cardBody.append(deleteButton);

        cardBody.append("<br/><br/>");
        cardBody.append(renderOmni(configuration.NetworkReceiver, configObjects["NetworkReceiver"], "nreceiver", 0));
    }
    else
    {
        var addButton = $("<button/>", {
            "id": "button-add-nreceiver",
            "class": "btn btn-primary"
        });
        addButton.append("Add Network Receiver");

        cardBody.append(addButton);
    }
}

var renderNetworkSender = function(){
    cardBody = $("#card-body-nsender");
    cardBody.empty();
    if(configuration.NetworkSender.type != undefined && configuration.NetworkSender.type != null)
    {
        var deleteButton = $("<button/>", {
            "id": "button-delete-nsender",
            "class": "btn btn-danger"
        });
        deleteButton.append("Delete Network Sender");

        cardBody.append(deleteButton);

        cardBody.append("<br/><br/>");
        cardBody.append(renderOmni(configuration.NetworkSender, configObjects["NetworkSender"], "nsender", 0));
    }
    else
    {
        var addButton = $("<button/>", {
            "id": "button-add-nsender",
            "class": "btn btn-primary"
        });
        addButton.append("Add Network Sender");

        cardBody.append(addButton);
    }
}

var getType = function(configObject, type){
    var collection = configObject;
    var length = collection.length;

    for(var i = 0; i < length; i++)
    {
        var tmp = collection[i];
        if(type == tmp.type)
        {
            return tmp;
        }
    }

    return null;
}

var loadConfig = function(){
    var input, file, fr;

    if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('fileImportJson');
    if (!input) {
        alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
        alert("No file has been selected");
    }
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedText;
        fr.readAsText(file);
    }

    function receivedText(e) {
        try{
            let lines = e.target.result;
            var tmp = JSON.parse(lines); 
            configuration = tmp;
        }
        catch(err){
            alert("Failed to parse json configuration. Are you sure you selected a json file?");
        }
        updateRawConfig();
    }   
}
