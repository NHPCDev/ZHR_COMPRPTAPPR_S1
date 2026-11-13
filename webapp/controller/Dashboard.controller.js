sap.ui.define([
    "com/nhpc/zhrcomprptapprs1/controller/BaseController",
    "sap/m/MessageToast",
    "com/nhpc/zhrcomprptapprs1/util/messenger",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "sap/ui/export/Spreadsheet",
    "com/nhpc/zhrcomprptapprs1/util/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/SearchField",
    "sap/ui/export/library",
    "sap/ui/core/BusyIndicator"
], function (
    BaseController,
    MessageToast,
    messenger,
    Fragment,
    ValueState,
    Spreadsheet,
    formatter,
    Filter,
    FilterOperator,
    JSONModel,
    SearchField,
    exportLibrary,
    BusyIndicator
) {
    "use strict";

    const EdmType = exportLibrary.EdmType;

    return BaseController.extend(
        "com.nhpc.zhrcomprptapprs1.controller.Dashboard",
        {
            formatter: formatter,
            onInit: function () {
                this.getRouter()
                    .getRoute("RouteDashboard")
                    .attachPatternMatched(
                        this._onRoutePatternMatched,
                        this
                    );
            },

            _onRoutePatternMatched: function () {
                this.getModel().refresh();

            },

            onAfterRendering: function () {
                this.getView()
                    .addStyleClass("sapUiSizeCompact");
            },

            onExport: function () {

                var oTable = this.byId("idDashboardTable");
                var aContexts = oTable.getBinding("items").getContexts();

                var aExportData = aContexts.map(function (oContext) {

                    var oItem = oContext.getObject();

                    return {
                        RequestNumber: oItem.ReportId,
                        Location: oItem.Location,
                        Division: oItem.Division,
                        Year: oItem.Fyear,
                        Period: oItem.Period,
                        From: this.formatter.formatDate(oItem.DateFrom),
                        To: this.formatter.formatDate(oItem.DateTo),
                        CreatedBy: oItem.CreatedBy,
                        RecommendedBy: oItem.RecommendedBy,
                        ApprovedBy: oItem.ApprovedBy,
                        AuthorizedBy: oItem.AuthorizedBy,
                        Status: this.formatter.formatStatusText(oItem.Status)
                    };

                }.bind(this));

                var sFileName = this.getResourceBundle().getText("excelTitle") + ".xlsx";

                var oSettings = {
                    workbook: {
                        columns: this.createColumnConfig()
                    },
                    dataSource: aExportData,
                    fileName: sFileName
                };

                var oSheet = new Spreadsheet(oSettings);

                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },
            createColumnConfig: function () {

                var oResourceBundle = this.getResourceBundle();

                return [
                    {
                        label: oResourceBundle.getText("recordNo"),
                        property: "RequestNumber"
                    },
                    {
                        label: oResourceBundle.getText("location"),
                        property: "Location"
                    },
                    {
                        label: oResourceBundle.getText("division"),
                        property: "Division"
                    },
                    {
                        label: oResourceBundle.getText("year"),
                        property: "Year"
                    },
                    {
                        label: oResourceBundle.getText("period"),
                        property: "Period"
                    },
                    {
                        label: oResourceBundle.getText("from"),
                        property: "From"
                    },
                    {
                        label: oResourceBundle.getText("to"),
                        property: "To"
                    },
                    {
                        label: oResourceBundle.getText("createdBy"),
                        property: "CreatedBy"
                    },
                    {
                        label: oResourceBundle.getText("recommendedBy"),
                        property: "RecommendedBy"
                    },
                    {
                        label: oResourceBundle.getText("approvedBy"),
                        property: "ApprovedBy"
                    },
                    {
                        label: oResourceBundle.getText("authorizedBy"),
                        property: "AuthorizedBy"
                    },
                    {
                        label: oResourceBundle.getText("status"),
                        property: "Status"
                    }
                ];

            },

            onFilterClear: function () {
              
                var oViewModel = this.getModel("viewModel");

                // Reset filter values
                oViewModel.setProperty("/filterData", {
                    RequestNumber: "",
                    Year: "",
                    Quarter: "",
                    Status: "",
                });

                // Clear table filters
                var oTable = this.byId("idDashboardTable");
                oTable.getBinding("items").filter([]);
            },

            _validateComboBoxField: function (oEvent, sField, sModelPath) {

                var oSource = oEvent.getSource();
                var sKey = oSource.getSelectedKey();
                var oModel = this.getModel("viewModel");
                var oBundle = this.getResourceBundle();

                var aItems = oSource.getItems();
                var bValid = false;

                // check valid key exists in items
                aItems.forEach(function (oItem) {
                    if (oItem.getKey() === sKey) {
                        bValid = true;
                    }
                });

                if (!sKey || !bValid) {

                    oSource.setSelectedKey("");
                    oSource.setValueState("Error");

                    oSource.setValueStateText(
                        oBundle.getText("selectFieldMsg", [sField])
                    );

                    oModel.setProperty(sModelPath, "");

                } else {

                    oSource.setValueState("None");
                    oSource.setValueStateText("");

                    oModel.setProperty(sModelPath, sKey);
                }
            },
            // onFinancialYearChange: function (oEvent) {

            //     this._validateComboBoxField(
            //         oEvent,
            //         "Financial Year",
            //         "/FinancialYear"
            //     );
            // },
            // onQuarterChange: function (oEvent) {

            //     this._validateComboBoxField(
            //         oEvent,
            //         "Quarter",
            //         "/Quarter"
            //     );
            // },
            // onStatusChange: function (oEvent) {

            //     var oSource = oEvent.getSource();
            //     var sKey = oSource.getSelectedKey();
            //     var oModel = this.getModel("filterModel");
            //     var oBundle = this.getResourceBundle();

            //     var sLabel = oSource.data("labelName") || "Status";

            //     oModel.setProperty("/Status", sKey);

            //     if (!sKey) {

            //         oSource.setValue("");
            //         oSource.setSelectedKey("");

            //         oSource.setValueState("Error");
            //         oSource.setValueStateText(
            //             oBundle.getText("selectFieldMsg", [sLabel])
            //         );

            //         oModel.setProperty("/Status", "");

            //     } else {

            //         oSource.setValueState("None");
            //         oSource.setValueStateText("");
            //     }
            // },
            handleOnItemPress: function (oEvent) {
                var oItem = oEvent.getSource();
                var oContext = oItem.getBindingContext();
                var sReportId = oContext.getProperty(
                    "ReportId"
                );
                // Set mode
                var oViewModel = this.getModel("viewModel");
                oViewModel.setProperty("/mode", "Display");
                this.getRouter().navTo(
                    "RouteDetail",
                    {
                        reportId: sReportId
                    }
                );
            },

            onRemarksLiveChange: function (oEvent) {

                var oViewModel = this.getModel("viewModel");

                var sValue = oEvent.getParameter("value") || "";

                var iRemaining = 500 - sValue.length;

                oViewModel.setProperty("/Compliance/Remarks", sValue);
                oViewModel.setProperty("/Compliance/remarksCounterText", iRemaining + " characters remaining");
            },

            onManageTaskTableUpdateFinish(oEvent) {
                var oResourceBundle = this.getResourceBundle(),
                    iCount = oEvent.getParameter("total");
                var sTitle = oResourceBundle.getText("compliancedashboardTitle") + " (" + iCount + ")";
                this.byId("idDashboardTitle").setText(sTitle);
            },

            onDashboardFilterSearch() {
                var oTable = this.byId("idDashboardTable"),
                    oFilterData = this._getTableFilters();

                if (oFilterData.aFilters[0].aFilters.length) {
                    oTable.getBinding("items").filter(oFilterData.aFilters);
                } else {
                    oTable.getBinding("items").filter([]);
                }

            },
            _getTableFilters() {
                var oViewModel = this.getModel("viewModel"),
                    oFilterData = oViewModel.getProperty("/filterData"),
                    aSearchFilter = [];

                // Request Number
                if (oFilterData.RequestNumber) {
                    aSearchFilter.push(this.createFilter("ReportId", "Contains", oFilterData.RequestNumber));
                };
                // Financial Year
                if (oFilterData.Year) {
                    aSearchFilter.push(this.createFilter("Fyear", "EQ", oFilterData.Year));
                };
                // Quarter
                if (oFilterData.Quarter && oFilterData.Quarter !== "ALL") {
                    aSearchFilter.push(this.createFilter("Period", "EQ", oFilterData.Quarter));
                };
                // Status
                if (oFilterData.Status) {
                    aSearchFilter.push(this.createFilter("Status", "EQ", oFilterData.Status));
                }

                return {
                    aFilters: [
                        new Filter({
                            filters: aSearchFilter,
                            and: true
                        })
                    ]
                };
            },

            onDateChange: function (oEvent) {
                var oResourceBundle = this.getResourceBundle(),
                    oSrc = oEvent.getSource(),
                    bValidDate = oEvent.getParameter("valid");

                if (bValidDate) {
                    oSrc.setValueState("None");
                    oSrc.setValueStateText(null);
                } else {
                    oSrc.setValue(null);
                    oSrc.setValueState("Error");
                    oSrc.setValueStateText(oResourceBundle.getText("invalidDateErrorMsg"));
                    messenger.error(oResourceBundle.getText("invalidDateErrorMsg"));
                }
            },




        });
});