const puppeteer = require('puppeteer');
require("dotenv").config();

async function getTables(idd = '11156830561', passwd = '11156830561') {
    const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
    const page = await browser.newPage();

    await page.goto('https://portal.lnct.ac.in/Accsoft2/studentLogin.aspx');

    // Enter student credentials
    await page.type('input[name="ctl00$cph1$txtStuUser"]', idd);
    await page.type('input[name="ctl00$cph1$txtStuPsw"]', passwd);
    await Promise.all([
        page.waitForNavigation(), // Clicking Login should navigate
        page.click('input[name="ctl00$cph1$btnStuLogin"]')
    ]);

    // Navigate to Attendance page
    await page.goto('https://portal.lnct.ac.in/Accsoft2/Parents/StuAttendanceStatus.aspx');

    // Get data from all tables
    const tableData = await page.evaluate(() => {
        const tables = Array.from(document.querySelectorAll('table'));
        const allTableData = [];

        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            const tableRows = [];

            rows.forEach(row => {
                const columns = row.querySelectorAll('td');
                const rowData = [];

                columns.forEach(column => {
                    rowData.push(column.innerText.trim());
                });

                if (rowData.length > 0) {
                    tableRows.push(rowData);
                }
            });

            if (tableRows.length > 0) {
                allTableData.push(tableRows);
            }
        });

        return allTableData;
    });

    // Transform tableData into JSON format
    const jsonData = tableData.map(table => {
        const jsonTable = table.map(row => {
            return row.reduce((obj, cell, index) => {
                obj[`column_${index + 1}`] = cell;
                return obj;
            }, {});
        });
        return jsonTable;
    });

    await browser.close();

    return jsonData;
}

module.exports = {
    getTables
};
