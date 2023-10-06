// This file was generated by Mendix Studio Pro.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the import list
// - the code between BEGIN USER CODE and END USER CODE
// - the code between BEGIN EXTRA CODE and END EXTRA CODE
// Other code you write will be lost the next time you deploy the project.
import "mx-global";
import { Big } from "big.js";
import { utils, writeFileXLSX } from './xlsx-export-tools.js';

// BEGIN EXTRA CODE
// END EXTRA CODE

/**
 * @param {string} datagridName
 * @param {string} fileName
 * @param {string} sheetName
 * @param {boolean} includeColumnHeaders
 * @param {Big} chunkSize - The number of items fetched and exported per request.
 * @returns {Promise.<boolean>}
 */
export async function Export_To_Excel(datagridName, fileName, sheetName, includeColumnHeaders, chunkSize) {
	// BEGIN USER CODE
    if (!fileName || !datagridName || !sheetName) {
        return false;
    }

    return new Promise((resolve, reject) => {
        const stream =
            window[window["DATAGRID_DATA_EXPORT"]][datagridName].create();

        let worksheet;
        let headers;
        const streamOptions = { limit: chunkSize };
        stream.process((msg) => {
            if (!msg) {
                return;
            }

            switch (msg.type) {
                case "columns":
                    headers = msg.payload.map(column => column.name);
                    if (includeColumnHeaders) {
                        worksheet = utils.aoa_to_sheet([headers]);
                    }
                    break;
                case "data":
                    if (worksheet === undefined) {
                        worksheet = utils.aoa_to_sheet(msg.payload)
                    } else {
                        utils.sheet_add_aoa(worksheet, msg.payload, { origin: -1 });
                    }
                    break;
                case "end":
                    if (worksheet) {
                        // Set character width for each column
                        // https://docs.sheetjs.com/docs/csf/sheet#worksheet-object
                        worksheet["!cols"] = headers.map(header => ({
                            wch: header.length + 10
                        }));
                        const workbook = utils.book_new();
                        utils.book_append_sheet(workbook, worksheet, sheetName === "" ? "Data" : sheetName);
                        writeFileXLSX(workbook, `${fileName}.xlsx`);
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                    break;
                case "aborted":
                    resolve(false);
                    break;
            }
        }, streamOptions);

        stream.start();
    });
	// END USER CODE
}
