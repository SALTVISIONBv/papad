// Add to your WebGL template
var templateLoaded = false;

function notifyTemplateLoaded() {
    console.log("WebGL template loaded");
    templateLoaded = true;
}

// This function will be called from Unity
function IsTemplateLoaded() {
    return templateLoaded;
}

// This function will be called when Unity has loaded all models
function NotifyUnityModelsLoaded() {
    console.log("All Unity models loaded");
    // You can add custom code here to handle model loading completion
    if (typeof onUnityModelsLoaded === "function") {
        onUnityModelsLoaded();
    }
}

// Add this to your template's onload event
window.addEventListener('load', function() {
    // Your existing template code
    // ...
    
    // When template is fully loaded:
    notifyTemplateLoaded();
});
