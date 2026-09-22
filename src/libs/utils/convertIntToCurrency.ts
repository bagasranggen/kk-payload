export const convertIntToCurrency = (price: number, withCurrency: boolean = false) => {
    const currency = Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        ...(!withCurrency ? { currencyDisplay: 'code' } : {}),
        maximumFractionDigits: 0,
    }).format(price);

    // if (price === 0) {
    //     return currency.replace('0', '').replace(/\s/g, '');
    // }

    if (!withCurrency) {
        return currency.replace('IDR', '').replace(/\s/g, '');
    }

    return currency;
};
