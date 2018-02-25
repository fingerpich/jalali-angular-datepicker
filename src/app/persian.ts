export class Persian {
    static englishToPersianNumber(number) {
        if (!number) {
            return;
        }
        const englishNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            persianNumbers = ['۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '۰'];

        for (let i = 0, numbersLen = englishNumbers.length; i < numbersLen; i++) {
            number = number.replace(new RegExp(englishNumbers[i], 'g'), persianNumbers[i]);
        }
        return number;
    }

    static persianToEnglishNumber(number) {
        if (!number) {
            return;
        }
        const englishNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            persianNumbers = ['۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '۰'];

        for (let i = 0, numbersLen = persianNumbers.length; i < numbersLen; i++) {
            number = number.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
        }
        return number;
    }

    // TODO:: performance issue
    static numberToPersianDigitWords(number: string | number) {
        if (typeof number !== 'string') {
            number = number.toString();
        }
        if (!isFinite(Number(number))) {
            return '';
        }
        const parts = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون', 'کوادریلیون', 'کویینتیلیون', 'سکستیلیون'];
        const numbers = {
            hundreds: ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'],
            tens: ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'],
            units: ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'],
            tenToNineteen: ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'],
            zero: 'صفر'
        };
        const delimiter = ' و ';
        // split number 3-3
        const numberList = number
            .split('').reverse().join('').replace(/\d{3}(?=\d)/g, '$&,')
            .split('').reverse().join('').split(',')
            .map((x) => {
                return Array(4 - x.length).join('0') + x;
            }).reverse();
        let results;
        results = []
        for (let index = 0; index < numberList.length; index++) {
            const hundredsDigit = numberList[index][0];
            const tensDigit = numberList[index][1];
            const unitsDigit = numberList[index][2];
            const part = parts[index];
            let threeDigitResult;
            threeDigitResult = [];
            if (hundredsDigit !== '0') {
                threeDigitResult.push(numbers.hundreds[hundredsDigit]);
            }
            if (tensDigit === '1') {
                threeDigitResult.push(numbers.tenToNineteen[unitsDigit]);
            } else {
                if (tensDigit !== '0') {
                    threeDigitResult.push(numbers.tens[tensDigit]);
                    if (unitsDigit !== '0') {
                        threeDigitResult.push(numbers.units[unitsDigit]);
                    }
                } else if (unitsDigit !== '0' && unitsDigit !== '1') {
                    threeDigitResult.push(numbers.units[unitsDigit]);
                }
            }
            threeDigitResult = threeDigitResult.join(delimiter);
            results.push(threeDigitResult + ' ' + part)
        }
        let result = results.filter((x) => {
            return x.trim() !== '';
        });
        result = result.reverse().join(delimiter).trim();
        if (result !== '') {
            return result;
        }
        return numbers.zero;
    }
}
