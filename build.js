/*
	Tools used for build exe file from compiled program stored in exe[]
	Struktura PE dobrze opisana https://www.bigmessowires.com/2015/10/08/a-handmade-executable-file/
*/
let createDownloadLink = (array, filename = 'out-generated.exe') => {
    let data = new Uint8Array(array),
        blob = new Blob([data], {
        type: 'application/octet-stream'
        }),
        url = URL.createObjectURL(blob),
        link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.innerHTML = 'Download file ' + filename;

    document.querySelector('#download').innerHTML = ''
    document.querySelector('#download').appendChild(link);
}
// for setting 32bit value in array
let set4 = (arr, i, value) => {
    let bytes = [];

    bytes.push(value & 0xFF);
    bytes.push((value >> 8) & 0xFF);
    bytes.push((value >> 16) & 0xFF);
    bytes.push((value >> 24) & 0xFF);
    arr.splice(i, bytes.length, ...bytes)
}
// complete PE file without .code section
let skel = [
    0x4d, 0x5a, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0x50, 0x45, 0, 0,
    0x64, 0x86, 0x03, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0xf0, 0, 0x2f, 0x02, 0x0b, 0x02, 0, 0,
    0x50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0xc5, 0x02, 0, 0, 0x90, 0x02, 0, 0, 0, 0, 0x40, 0,
    0, 0, 0, 0, 0x10, 0, 0, 0, 0x10, 0, 0, 0,
    0x04, 0, 0, 0, 0, 0, 0, 0, 0x05, 0, 0x02, 0,
    0, 0, 0, 0, 0, 0x03, 0, 0, 0, 0x02, 0, 0,
    0, 0, 0, 0, 0x03, 0, 0, 0, 0, 0, 0x20, 0,
    0, 0, 0, 0, 0, 0x10, 0, 0, 0, 0, 0, 0,
    0, 0, 0x10, 0, 0, 0, 0, 0, 0, 0x10, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0x10, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0x02, 0, 0,
    0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0x40, 0x02, 0, 0, 0x18, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0x2e, 0x63, 0x6f, 0x64,
    0x65, 0, 0, 0, 0x50, 0, 0, 0, 0xb0, 0x02, 0, 0,
    0x50, 0, 0, 0, 0xb0, 0x02, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0x20, 0, 0, 0x60,
    0x2e, 0x72, 0x64, 0x61, 0x74, 0x61, 0, 0, 0x30, 0, 0, 0,
    0x80, 0x02, 0, 0, 0x30, 0, 0, 0, 0x80, 0x02, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0x40, 0, 0, 0x40, 0x2e, 0x69, 0x64, 0x61, 0x74, 0x61, 0, 0,
    0x80, 0, 0, 0, 0, 0x02, 0, 0, 0x80, 0, 0, 0,
    0, 0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0x40, 0, 0, 0xc0, 0x28, 0x02, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0x74, 0x02, 0, 0,
    0x40, 0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0x58, 0x02, 0, 0, 0, 0, 0, 0, 0x60, 0x02, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0x58, 0x02, 0, 0, 0, 0, 0, 0, 0x60, 0x02, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0x2d, 0x04, 0x65, 0x78, 0x69, 0x74, 0, 0, 0x93, 0x04, 0x70, 0x72,
    0x69, 0x6e, 0x74, 0x66, 0, 0, 0, 0, 0x60, 0x02, 0, 0,
    0x60, 0x02, 0, 0, 0x6d, 0x73, 0x76, 0x63, 0x72, 0x74, 0x2e, 0x64,
    0x6c, 0x6c, 0, 0, 0x50, 0x72, 0x6f, 0x67, 0x72, 0x61, 0x6d, 0x20,
    0x62, 0x75, 0x69, 0x6c, 0x74, 0x20, 0x62, 0x79, 0x20, 0x6a, 0x73, 0x2d,
    0x63, 0x6f, 0x6d, 0x70, 0x69, 0x6c, 0x65, 0x72, 0x2e, 0x0a, 0x0a, 0x52,
    0x65, 0x73, 0x75, 0x6c, 0x74, 0x20, 0x3d, 0x20, 0x25, 0x64, 0x0a, 0,
    0, 0, 0, 0,
    // 0x48, 0x8d, 0x0d, 0xc9, 0xff, 0xff, 0xff, 0xff,
    // 0x15, 0x8b, 0xff, 0xff, 0xff, 0x8b, 0xca, 0xff, 0x15, 0x7b, 0xff, 0xff,
    // 0xff, 
    // 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

let build = function(exe) {
    let gen_op = function(operation, destination, source) {
        const registerMapping = {R8: 0, R9: 1, R10: 2, R11: 3, R12: 4, R13: 5, R14: 6, R15: 7};
        const op = {ADD: [0x4D, 0x1], SUB: [0x4D, 0x29], IMUL: [0x4D, 0xF, 0xAF], MOV: [0x4d, 0x89]}

        if (operation === 'MOV' && destination === 'RDX') {
            return [0x4C, 0x89, 0xC2 + registerMapping[source] * 8]
        }
        if (operation === 'MOV' && typeof source === 'number') {
            let val = [0, 0, 0, 0]
			set4(val, 0, source)
            return [0x49, 0xc7, 0xC0 + registerMapping[destination], ...val]
        }
        if (operation === 'IMUL') {													// dla imul source i dest sa zamienione
            return [...op[operation], 0xc0 + registerMapping[destination] * 8 + registerMapping[source]]
        }
        if (!op[operation]) {
            alert(`Operator ${operation} not supported by compiler.`)
            throw "not supported by compiler"
        }
        return [...op[operation], 0xc0 + registerMapping[source] * 8 + registerMapping[destination]]
    }
    //compile
    let code = exe.map(c => gen_op(...c)).reduce((arr, item, i) => arr.concat(item))    //code from compiled program
    //prepend
    code = [
        0x48, 0x8d, 0x0d, 0xc9, 0xff, 0xff, 0xff, 									// print result and exit (__fastcall cx dx r8 r9)
        0xff, 0x15, 0x8b, 0xff, 0xff, 0xff,
        0x8b, 0xca,
        0xff, 0x15, 0x7b, 0xff, 0xff, 0xff,
    ].concat(code)
    //append
    let last_reg = exe[exe.length - 1][1]
    code = code.concat([
        ...gen_op('MOV', 'RDX', last_reg), 											// result is moved to rdx (for printf)
        0xEB, 0xFF - (code.length + 4) 												// couunt jmp for print
    ])
    // round to % 16
    let fill = 16 - (code.length % 16)
    for (let i = 0; i < fill; i++) {
        code.push(0)
    }
    // join everything
    skel.splice(0x2C5, code.length, ...code)
    // fix sizes
    set4(skel, 0xD0, 0x2B0 + code.length) 											// file size
    skel[0x190] = code.length 														// size code section
    skel[0x198] = code.length 														// size code section

    createDownloadLink(skel)
}