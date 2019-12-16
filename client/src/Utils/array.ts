export const groupBy = (array: any[], key: string) => {
    return array.reduce((result, currentValue) => {
        // get the nested propert value
        const objKey = nestedObjectByString(currentValue, key);
        result[objKey] = (result[objKey] || []).concat(
            currentValue);
        return result;
    }, {});
};

// return value of nested property of an object
const nestedObjectByString = (obj: any, key: string) => {
    key = key.replace(/\[(\w+)]/g, '.$1');  // convert indexes to properties
    key = key.replace(/^\./, ''); // strip a leading dot
    const a = key.split('.');
    for (let i = 0, n = a.length; i < n; ++i) {
        const k = a[i];
        if (k in obj) {
            obj = obj[k];
        } else {
            return;
        }
    }
    return obj;
};
