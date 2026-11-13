sap.ui.define([
    "sap/ui/core/format/DateFormat"

], function (DateFormat) {
    "use strict";

    return {
        /**
         * Formatter for converting a date string from 'YYYYMMDD' format to 'DD-MM-YYYY' format.
         * @public
         * @param {string} sDate - The date string in 'YYYYMMDD' format.
         * @returns {string|null} The formatted date string in 'DD-MM-YYYY' format, 
         *                        or the original string if it is not in the expected format, 
         *                        or null if the input is null or undefined.
         */

        // formatDate: function (sValue) {

        //     if (!sValue) {
        //         return "";
        //     }

        //     // YYYYMMDD string
        //     if (typeof sValue === "string" && sValue.length === 8) {

        //         if (sValue !== "00000000") {

        //             return sValue.substring(6, 8) + "." +
        //                 sValue.substring(4, 6) + "." +
        //                 sValue.substring(0, 4);
        //         }

        //         return "";
        //     }

        //     // Date object
        //     if (sValue instanceof Date) {

        //         var dd = String(sValue.getDate()).padStart(2, "0");
        //         var mm = String(sValue.getMonth() + 1).padStart(2, "0");
        //         var yyyy = sValue.getFullYear();

        //         return dd + "." + mm + "." + yyyy;
        //     }

        //     return sValue;
        // },
        formatDate: function (sValue) {

            if (!sValue) {
                return "";
            }

            // YYYY-MM-DD
            if (typeof sValue === "string" && sValue.indexOf("-") > -1) {

                var aParts = sValue.split("-");

                return aParts[2] + "." +
                    aParts[1] + "." +
                    aParts[0];
            }

            // YYYYMMDD
            if (typeof sValue === "string" && sValue.length === 8) {

                return sValue.substring(6, 8) + "." +
                    sValue.substring(4, 6) + "." +
                    sValue.substring(0, 4);
            }

            // Date Object
            if (sValue instanceof Date) {

                var dd = String(sValue.getDate()).padStart(2, "0");
                var mm = String(sValue.getMonth() + 1).padStart(2, "0");
                var yyyy = sValue.getFullYear();

                return dd + "." + mm + "." + yyyy;
            }

            return sValue;
        },
        formatBlankValue: function (value) {
            if (!value) {
                return "-";
            } else {
                return value;
            }
        },

        formatAttachmentIcon: function (sMimeType) {

            if (!sMimeType) {
                return "sap-icon://document";
            }

            sMimeType = sMimeType.toLowerCase();

            if (sMimeType.indexOf("pdf") > -1) {
                return "sap-icon://pdf-attachment";
            }

            if (
                sMimeType.indexOf("jpg") > -1 ||
                sMimeType.indexOf("jpeg") > -1 ||
                sMimeType.indexOf("png") > -1 ||
                sMimeType.indexOf("image") > -1
            ) {
                return "sap-icon://attachment-photo";
            }

            return "sap-icon://document";
        },

        formatAmount: function (sValue) {
            if (!sValue) {
                return "";
            }
            var iRoundedValue = Math.ceil(parseFloat(sValue));
            return iRoundedValue.toString();
        },

        // formatStatusState: function (status) {
        //     if (status) {
        //         status = status.toUpperCase();
        //         if (status === "C".toUpperCase() || status === "A".toUpperCase()) {
        //             return "Success";
        //         }
        //         if (status === "Cancelled".toUpperCase() || status === "R".toUpperCase()) {
        //             return "Error";
        //         }
        //         if (status === "D".toUpperCase()) {
        //             return "Warning";
        //         }
        //         if (status === "S".toUpperCase() || status === "P".toUpperCase() || "Created".toUpperCase()) {
        //             return "Information";
        //         }
        //         else {
        //             return "Information";
        //         }
        //     }
        // },

        formatObjectPageTitle: function (sAppNo) {
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const sText = oResourceBundle.getText("ObjectPageTitle")
            return sAppNo
                ? `${sText} - ${sAppNo}`
                : `Create ${sText}`;
        },

        formatStatusText: function (sStatus) {

            if (!sStatus) {
                return "";
            }

            switch (sStatus.toUpperCase()) {

                case "D":
                    return "Draft";

                case "S":
                    return "Saved";

                case "U":
                    return "Submitted";

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

                case "W":
                    return "New";

                default:
                    return sStatus;
            }
        },

        formatStatusState: function (sStatus) {

            if (!sStatus) {
                return "None";
            }

            switch (sStatus.toUpperCase()) {

                case "D":
                    return "Warning";

                case "S":
                    return "Warning";

                case "U":
                    return "Information";

                case "A":
                    return "Success";

                case "N":
                    return "Success";

                case "Z":
                    return "Success";

                case "R":
                    return "Error";

                case "T":
                    return "Warning";

                case "N":
                    return "Information";

                case "W":
                    return "Information";

                default:
                    return "None";
            }
        },

        formatDateReverse: function (inputDate) {
            var parts = inputDate.split(".");
            var dateObject = new Date(parts[2], parts[1] - 1, parts[0]);
            var dateFormatter = DateFormat.getDateInstance({ pattern: "yyyyMMdd" });
            return dateFormatter.format(dateObject);
        },

        formatVehicleType: function (sType) {
            if (sType === "1") {
                return "4 Wheeler > 1600 CC";
            } else if (sType === "2") {
                return "4 Wheeler < 1600 CC";
            } else if (sType === "3") {
                return "2 Wheeler";
            }
        },
        formatHistoryDateTime: function (oDate, oTime) {

            if (!oDate || !oTime) {
                return "";
            }

            // Convert Date "YYYYMMDD"
            var year = oDate.substring(0, 4);
            var month = oDate.substring(4, 6);
            var day = oDate.substring(6, 8);

            var oJSDate = new Date(year, month - 1, day);

            var sDate =
                String(oJSDate.getDate()).padStart(2, "0") + "." +
                String(oJSDate.getMonth() + 1).padStart(2, "0") + "." +
                oJSDate.getFullYear();

            var iHours = 0, iMinutes = 0, iSeconds = 0;

           
            if (typeof oTime === "string") {

                var match = oTime.match(/PT(\d+)H(\d+)M(\d+)S/);

                if (match) {
                    iHours = parseInt(match[1], 10);
                    iMinutes = parseInt(match[2], 10);
                    iSeconds = parseInt(match[3], 10);
                }

            }
            
            else if (oTime.ms !== undefined) {

                var iTotalSeconds = Math.floor(oTime.ms / 1000);

                iHours = Math.floor(iTotalSeconds / 3600);
                iMinutes = Math.floor((iTotalSeconds % 3600) / 60);
                iSeconds = iTotalSeconds % 60;
            }

            var sTime =
                String(iHours).padStart(2, "0") + ":" +
                String(iMinutes).padStart(2, "0") + ":" +
                String(iSeconds).padStart(2, "0");

            return sDate + " " + sTime;
        }

    };
});