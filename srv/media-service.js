const cds = require('@sap/cds');
var toBuffer = require('blob-to-buffer');
const { Blob } = require("buffer");
const Excel = require('exceljs');
const XLSX = require('xlsx');

const { Files, EMPLOYEE } = cds.entities('miyasuta.media');

module.exports = async function () {
    
    var id;
    
    this.before('CREATE', 'Files', req => {
        console.log('Create called')
        console.log(JSON.stringify(req.data))
        req.data.url = `/attachments/Files(${req.data.ID})/content`
    });

    this.before('READ', 'Files', req => {
        //check content-type
        console.log('content-type: ', req.headers['content-type']);
        console.log('Header req: ', req.headers);
        console.log('Data: ', req.data);
        id = req.data.ID;
    });

    this.on('unBoundedFunc', async req => {
        console.log('Data res: ', req.data.ID);
        let b = await SELECT `content`.from(Files).where `ID = ${req.data.ID}`;
        console.log('b: ', b[0].content);
        let data = b[0].content;
        console.log('data: ', data);

        console.log('len: ', data.length);
        const arrayBuffer = new ArrayBuffer(data.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < data.length; ++i) {
            view[i] = data[i];
        }
        console.log('view: ', view);
        console.log('arrayBuffer: ', arrayBuffer);

        var arr = new Array();
        for (var i = 0; i != view.length; ++i)
            arr[i] = String.fromCharCode(view[i]);
        var bstr = arr.join("");
        //console.log('bstr: ', bstr);

        var workbook = XLSX.read(bstr, {
            type: "binary"
        });
        console.log('workbook: ', workbook);

        /* Create the file*/
        XLSX.writeFile(workbook, "text.xlsx");

        /* Get the work sheet name */
        var first_sheet_name = workbook.SheetNames[0];

        /* Get worksheet */
        var worksheet = workbook.Sheets[first_sheet_name];

        /* Convert it to json*/
        let xlsData = XLSX.utils.sheet_to_json(worksheet, {
            raw: true
        });
        console.log('xlsData: ', xlsData);

        for (let index = 0; index < xlsData.length; index++) {
            //const element = array[index];
            let q2 = INSERT.into(EMPLOYEE).entries(xlsData[index]);
            console.log('q2: ', q2);
            let upl = await cds.run (q2);
            console.log('upl', upl);
        }
        
        // const buff = Buffer.from(data);
        // console.log('Buff: ', buff);
        // const blob = new Blob([buff]);
        // console.log('Blob: ', blob);

        // toBuffer({blob}, function (err, buffer) {
        //     if (err) throw err
           
        //     buffer[0] // => 1
        //     buffer.readUInt8(1) // => 2
        // })
        // console.log('Buffer: ', buffer);
        // const arrayBuffer = await data.arrayBuffer();
        // console.log('ArrayBuffer: ', arrayBuffer);
        // const buffer = Buffer.from(arrayBuffer);
        // console.log('Buffer: ', buffer);
    });

    this.after('GET', 'Files', async req => {
    });
}