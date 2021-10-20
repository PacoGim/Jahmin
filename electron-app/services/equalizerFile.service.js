"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parse(data) {
    let equalizer = {
        id: '',
        values: []
    };
    data.split('\n').forEach((entry) => {
        let key = entry.split(' ')[0];
        let value = entry.substring(entry.indexOf(' ') + 1);
        if (key === 'id') {
            equalizer.id = value;
        }
        else if (key === 'value') {
            let splittedFrequency = value.split('=');
            equalizer.values.push({
                frequency: Number(splittedFrequency[0]),
                gain: Number(splittedFrequency[1])
            });
        }
    });
    return equalizer;
}
function stringify(data) {
    let finalString = '';
    finalString += `id ${data.id}\n`;
    data.values.forEach(value => (finalString += `value ${value.frequency}=${value.gain}\n`));
    return finalString;
}
exports.default = {
    parse,
    stringify
};
