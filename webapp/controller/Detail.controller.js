sap.ui.define([
    "com/nhpc/zhrcomprptapprs1/controller/BaseController",
    "com/nhpc/zhrcomprptapprs1/util/messenger",
    "com/nhpc/zhrcomprptapprs1/util/formatter",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/ValueState",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"

], function (BaseController, messenger, formatter, BusyIndicator, ValueState, Fragment, Sorter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("com.nhpc.zhrcomprptapprs1.controller.Detail", {

        formatter: formatter,
        onInit: function () {

            this.getRouter().getRoute("RouteDetail").attachPatternMatched(this._onRoutePatternMatched, this);
        },
        onAfterRendering: function () {
            this.getView().addStyleClass("sapUiSizeCompact");

        },
        _onRoutePatternMatched: function (oEvent) {
            this.getModel().refresh();

            var sReportId = oEvent.getParameter("arguments").reportId;

            this.getModel("viewModel").setProperty("/mode", "Display");
            this._loadData(sReportId);
            this._sortComplainceDetailTable()
        },

        _loadData: function (sRecordId) {

            var oViewModel = this.getModel("viewModel");
            var oModel = this.getModel();
            var oResourceBundle = this.getResourceBundle();

            oModel.read("/HeaderSet", {

                filters: [
                    new Filter(
                        "ReportId",
                        FilterOperator.EQ,
                        sRecordId
                    )
                ],

                urlParameters: {
                    "$expand": "Header_Item,Header_Remarks,Header_Employee"
                },

                success: function (oData) {

                    if (!oData.results || oData.results.length === 0) {
                        messenger.toast(oResourceBundle.getText("noDataMsg"));
                        return;
                    }

                    // Header Data
                    var oHeader = oData.results[0];
                    console.log("Header:", oHeader);

                    oViewModel.setProperty("/Header", oHeader);

                    // Employee Details
                    var aEmployees = oHeader.Header_Employee?.results || [];

                    if (aEmployees.length > 0) {

                        var oEmployee = aEmployees[0];

                        oViewModel.setProperty("/EmployeeDetails", {
                            Pernr: oEmployee.Pernr,
                            Ename: oEmployee.Ename,
                            Plans: oEmployee.Plans,
                            PositionText: oEmployee.PositionText,
                            Department: oEmployee.Department,
                            Location: oEmployee.Location,
                            Category: oEmployee.Category,
                        });

                    } else {

                        oViewModel.setProperty("/EmployeeDetails", {});

                    }

                    // Remarks History
                    var aRemarks = oHeader.Header_Remarks?.results || [];

                    var aRemarkHistory = aRemarks.map(function (oRemark) {
                        return {
                            ActionStage: oRemark.ActionStage,
                            ActionName: oRemark.ActionName,
                            ActionDate: oRemark.ActionDate,
                            ActionTime: oRemark.ActionTime,
                            Remarks: oRemark.Remarks,
                            Approver: oRemark.ActionName,
                        };
                    });


                    oViewModel.setProperty(
                        "/remarkHistory",
                        aRemarkHistory
                    );

                    // Editable only for Draft/Saved
                    var bEditable =
                        oHeader.Status === "D" ||
                        oHeader.Status === "S";

                    oViewModel.setProperty(
                        "/editable",
                        bEditable
                    );

                    // Item Data
                    var aItems =
                        oHeader.Header_Item &&
                            oHeader.Header_Item.results
                            ? oHeader.Header_Item.results
                            : [];

                    // Format data for table
                    var aFormatted = aItems.map(function (item) {

                        return {
                            Counter: item.SrNo,
                            ApplLawNo: item.ApplLawNo,
                            NameOfAct: item.Description || '',
                            ComplianceStatus: item.Compliance || "",
                            Remarks: item.Remarks || "",
                            RemarksRequired: false,
                            RemarksEditable:
                                item.Compliance !== "NA",

                            RemarksState: "None",
                            RemarksStateText: ""
                        };

                    });

                    oViewModel.setProperty("/complianceDetails", aFormatted);

                }.bind(this),

                error: function (oError) {

                    BusyIndicator.hide();
                    if (oError.statusCode == "500") {
                        let xmlDoc = new DOMParser().parseFromString(oError.responseText, "application/xml");
                        messenger.error(xmlDoc.getElementsByTagName("message")[0].textContent);
                    } else {
                        messenger.error(JSON.parse(oError.responseText).error.message.value);
                    }

                }

            });

        },

        onComplianceStatusChange: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext("viewModel");
            var sStatus = oEvent.getSource().getSelectedKey();
            var sPath = oContext.getPath();
            var oModel = this.getModel("viewModel");

            // Clear compliance validation
            oModel.setProperty(
                sPath + "/ComplianceState",
                "None"
            );

            oModel.setProperty(
                sPath + "/ComplianceStateText",
                ""
            );

            // Existing logic below
            if (sStatus === "NA") {

                oModel.setProperty(sPath + "/Remarks", "Not Applicable");
                oModel.setProperty(sPath + "/RemarksRequired", false);
                oModel.setProperty(sPath + "/RemarksEditable", false);

            } else if (sStatus === "N") {

                oModel.setProperty(sPath + "/Remarks", "");
                oModel.setProperty(sPath + "/RemarksRequired", true);
                oModel.setProperty(sPath + "/RemarksEditable", true);

                // Instant validation
                oModel.setProperty(sPath + "/RemarksState", "Error");
                oModel.setProperty(
                    sPath + "/RemarksStateText",
                    "Remarks are mandatory for Non-Compliant records"
                );

            } else {

                oModel.setProperty(sPath + "/RemarksRequired", false);
                oModel.setProperty(sPath + "/RemarksEditable", true);

                if (oModel.getProperty(sPath + "/Remarks") === "Not Applicable") {
                    oModel.setProperty(sPath + "/Remarks", "");
                }
                // Clear remarks validation
                oModel.setProperty(sPath + "/RemarksState", "None");
                oModel.setProperty(sPath + "/RemarksStateText", "");
            }
        },

        _sortComplainceDetailTable() {
            var oSorter = new Sorter("Counter", false, false, function (a, b) {
                return parseFloat(a) - parseFloat(b);
            });

            this.byId("idComplianceDetailsTables").getBinding("items").sort(oSorter);
        },
        onManageCompTableUpdateFinish(oEvent) {
            var oResourceBundle = this.getResourceBundle(),
                iCount = oEvent.getParameter("total");
            var sTitle = oResourceBundle.getText("ManageCompTableTitle") + " (" + iCount + ")";
            this.byId("idCompTableTitles").setText(sTitle);
        },

        onRemarksLiveChange: function (oEvent) {

            var oContext = oEvent.getSource()
                .getBindingContext("viewModel");

            var sPath = oContext.getPath();

            var oModel = this.getModel("viewModel");

            oModel.setProperty(
                sPath + "/RemarksState",
                "None"
            );

            oModel.setProperty(
                sPath + "/RemarksStateText",
                ""
            );
        },



        //approval app logics

        onActionBtnPress: function (oEvent) {

            var sBtnId = oEvent.getSource().getId();

            if (sBtnId.indexOf("idRecommendBtn") > -1) {
                this.sAction = "N";
            }

            if (sBtnId.indexOf("idReturnBtn") > -1) {
                this.sAction = "T";
            }

            if (sBtnId.indexOf("idApproveBtn") > -1) {
                this.sAction = "A";
            }

            if (sBtnId.indexOf("idRejectBtn") > -1) {
                this.sAction = "R";
            }

            if (sBtnId.indexOf("idAuthorizeBtn") > -1) {
                this.sAction = "Z";
            }

            var oView = this.getView();

            if (!this.oDecisionDialog) {
                this.oDecisionDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.nhpc.zhrcomprptapprs1.fragments.DecisionDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this.oDecisionDialog.then(function (oDialog) {
                oDialog.open();
            });
        },
        onDecisionDialogAfterOpen() {
            var oResourceBundle = this.getResourceBundle();
            var sActionText = "";

            switch (this.sAction) {
                case "N":
                    sActionText = "Recommend";
                    break;
                case "T":
                    sActionText = "Return";
                    break;
                case "A":
                    sActionText = "Approve";
                    break;
                case "R":
                    sActionText = "Reject";
                    break;
                case "Z":
                    sActionText = "Authorize";
                    break;
                default:
                    sActionText = "";
            }
            this.byId("idActionText").setText(oResourceBundle.getText("actionSelectedText", [sActionText]));
            this.byId("idComments").setValue("");

            var bRemarksMandatory = this.sAction === "T" || this.sAction === "R";

            this.byId("idDecisionLabel").setRequired(bRemarksMandatory);
            this.byId("idSubmitDecisionBtn").setEnabled(!bRemarksMandatory);

        },
        onCommentLiveChange(oEvent) {
            if (oEvent.getParameter("value")) {
                this.byId("idSubmitDecisionBtn").setEnabled(true);
            } else {
                this.byId("idSubmitDecisionBtn").setEnabled(false);
            }
        },
        handleActionPerfomedCancel: function () {
            this.byId("idDecisionDialog").close();
        },

        handleActionPerfomedConfirm: function () {

            this.byId("idDecisionDialog").close();

            BusyIndicator.show();

            var oModel = this.getModel();
            var oViewModel = this.getModel("viewModel");
            var oResourceBundle = this.getResourceBundle();

            var sReportId = oViewModel.getProperty("/Header/ReportId");
            var sNotificationId = oViewModel.getProperty("/Header/NotificationId");


            var oPayload = {
                "ReportId": sReportId,
                "ActionFlag": this.sAction,
                "Remarks": this.byId("idComments").getValue(),
                "NotificationId": sNotificationId,
                "Header_Item": []

            };

            oModel.create("/HeaderSet", oPayload, {

                success: function (oData) {

                    BusyIndicator.hide();

                    var sActionText = this._getActionText(this.sAction);

                    // Send notification only for Submit
                    if (this.sAction === "N" || this.sAction === "A" || this.sAction === "Z") {

                        var aApproverMail = oData.ApproverMail ? oData.ApproverMail.split(",") : [];
                        console.log("Approver Emails:", aApproverMail);

                        this.sRequestNumber = sReportId;
                        this.NotificationID = sNotificationId;
                        this.ApproverID = aApproverMail;
                        this.RequesterName = sap.ushell.Container.getUser().getFullName();
                        var oNotifyPayload = this.createNotificationPayload(this.NotificationID, this.ApproverID, this.sRequestNumber, this.RequesterName)
                        // this.sendNotification(oNotifyPayload);

                        this.dismissNotification(sNotificationId, oNotifyPayload);
                    }

                    messenger.success(
                        oResourceBundle.getText("complianceReportMsg") + ' ' + sActionText + ' ' + oResourceBundle.getText("complianceReportMsgSucss") + ' ' + sReportId,
                        function () {
                            this.onNavBack();
                        }.bind(this)
                    );

                }.bind(this),

                error: function (oError) {

                    BusyIndicator.hide();
                    if (oError.statusCode == "500") {
                        let xmlDoc = new DOMParser().parseFromString(oError.responseText, "application/xml");
                        messenger.error(xmlDoc.getElementsByTagName("message")[0].textContent);
                    } else {
                        messenger.error(JSON.parse(oError.responseText).error.message.value);
                    }

                }.bind(this)

            });
        },
        _getActionText: function (sAction) {

            switch (sAction) {

                case "N":
                    return "Recommended";

                case "A":
                    return "Approved";

                case "Z":
                    return "Authorized";

                case "R":
                    return "Rejected";

                case "T":
                    return "Returned";

                default:
                    return "";
            }
        }

    });
});