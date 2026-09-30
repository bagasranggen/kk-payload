export const convertIntToCurrency = (price: number, withCurrency: boolean = false) => {
    const currency = Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        ...(withCurrency ? { currencyDisplay: 'code' } : {}),
        maximumFractionDigits: 0,
    }).format(price);

    if (!withCurrency) {
        return currency.replace('Rp', '').replace(/\s/g, '');
    }

    return currency;
};
