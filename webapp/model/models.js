sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
],
    function (JSONModel, Device) {
        "use strict";

        return {
            /**
             * Provides runtime information for the device the UI5 app is running on as a JSONModel.
             * @returns {sap.ui.model.json.JSONModel} The device model.
             */
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },
            createViewModel: function () {

                var oData = {
                    "filterData": {
                        "RequestNumber":"",
                        "Report": "COMPLIANCE",
                        "Year": "",
                        "Quarter": "",
                        "Status": "",
                    },
                    "mode": "",
                    "editable": true,
                    "Header": {},
                    "complianceDetails":[],

                    "SaveBtnVisible": true,
                    "SubmitBtnVisible": false,



                    "createReportDialog": {
                        "Fyear": "",
                        "Period": "",
                        "Location": "",
                        "Division": "",

                        "valueState": {
                            "Location": "None",
                            "Division": "None"
                        },

                        "valueStateText": {
                            "Location": "",
                            "Division": ""
                        }
                    },


                    valueState: {
                        FinancialYear: "None",
                        Quarter: "None"
                    },

                    valueStateText: {
                        FinancialYear: "",
                        Quarter: ""
                    }
                }
                var oModel = new JSONModel(oData);
                return oModel;
            },

            createFilterModel: function () {
                var oData = {
                    requestNumber: "",
                    requestDate: "",
                    Status: "",
                    FromDate: null,
                    ToDate: null,

                }
                var oModel = new JSONModel(oData);
                return oModel;
            }
        };

    });