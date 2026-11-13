sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/nhpc/zhrcomprptapprs1/model/models",
    "com/nhpc/zhrcomprptapprs1/util/messenger",
], (UIComponent, models, messenger) => {
    "use strict";

    return UIComponent.extend("com.nhpc.zhrcomprptapprs1.Component", {
        metadata: {
            manifestFirst : true,
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
            this.setModel(models.createViewModel(),"viewModel");
            this.setModel(models.createFilterModel(),"filterModel");
            messenger.init(this);
        }
    });
});