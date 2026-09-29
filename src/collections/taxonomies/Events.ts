import React from 'react';

import { CollectionConfig } from 'payload';

import { CASH_FLOW_DEFICIT_COLOR, CASH_FLOW_DISPLAY_FORMAT, CASH_FLOW_SURPLUS_COLOR } from '@/libs/constansts';
import { convertIntToCurrency } from '@/libs/utils';

import { BaseEntry } from '@/shared';

export const Events: CollectionConfig = {
    slug: 'events',
    admin: {
        useAsTitle: 'eventTitle',
        defaultColumns: ['eventTitle', 'entryStatus', 'date', 'eventType', 'eventConfirmation'],
    },
    fields: BaseEntry({
        typeHandle: [{ value: 'sectionEvent', label: 'Event' }],
        url: { enabled: false },
        sidebar: {
            fields: [
                {
                    type: 'text',
                    name: 'eventTitle',
                    label: 'Title',
                    admin: {
                        hidden: true,
                        readOnly: true,
                    },
                    hooks: {
                        beforeChange: [
                            ({ siblingData }) => {
                                let data = '';

                                if (siblingData?.title) data = siblingData.title;
                                if (siblingData?.date) {
                                    const formatter = new Intl.DateTimeFormat('en-GB', {
                                        dateStyle: 'medium',
                                    });

                                    data += ` - ${formatter.format(new Date(siblingData.date))}`;
                                }

                                return data;
                            },
                        ],
                    },
                },
                {
                    type: 'select',
                    name: 'eventConfirmation',
                    defaultValue: 'confirmed',
                    required: true,
                    options: [
                        {
                            value: 'tbc',
                            label: 'To Be Confirmed',
                        },
                        {
                            value: 'confirmed',
                            label: 'Confirmed',
                        },
                    ],
                },
                {
                    type: 'select',
                    name: 'eventType',
                    options: [
                        {
                            value: 'internal',
                            label: 'Internal',
                        },
                        {
                            value: 'publicFree',
                            label: 'Public - Free',
                        },
                        {
                            value: 'publicTicketing',
                            label: 'Public - Ticketing',
                        },
                    ],
                },
                {
                    type: 'number',
                    name: 'totalIncome',
                    hidden: true,
                    admin: {
                        readOnly: true,
                        style: {
                            '--theme-elevation-400': CASH_FLOW_SURPLUS_COLOR,
                        } as React.CSSProperties,
                    },
                    hooks: {
                        beforeChange: [
                            async ({ siblingData, req: { payload, context } }) => {
                                if (context.triggeringRelatedUpdate) return;

                                let data = 0;

                                try {
                                    const incomes = await payload.find({
                                        collection: 'incomes',
                                        select: { income: true },
                                        where: {
                                            id: { in: siblingData?.incomes?.docs },
                                        },
                                    });

                                    const totalIncome = incomes?.docs.reduce(
                                        (accumulator, currentValue) => accumulator + (currentValue?.income ?? 0),
                                        0
                                    );

                                    if (totalIncome > 0) data = totalIncome;
                                } catch {}

                                return data;
                            },
                        ],
                    },
                },
                {
                    type: 'text',
                    name: 'totalIncomeCurrency',
                    admin: {
                        readOnly: true,
                        style: {
                            '--theme-elevation-400': CASH_FLOW_SURPLUS_COLOR,
                        } as React.CSSProperties,
                    },
                    hooks: {
                        beforeChange: [
                            ({ siblingData }) => {
                                return convertIntToCurrency(siblingData?.totalIncome);
                            },
                        ],
                    },
                },
                {
                    type: 'number',
                    name: 'totalExpense',
                    admin: {
                        readOnly: true,
                        hidden: true,
                        style: {
                            '--theme-elevation-400': CASH_FLOW_DEFICIT_COLOR,
                        } as React.CSSProperties,
                    },
                    hooks: {
                        beforeChange: [
                            async ({ siblingData, req: { payload, context } }) => {
                                if (context.triggeringRelatedUpdate) return;

                                let data = 0;

                                try {
                                    const expenses = await payload.find({
                                        collection: 'expenses',
                                        select: { expense: true },
                                        where: {
                                            id: { in: siblingData?.expenses?.docs },
                                        },
                                    });

                                    const totalIncome = expenses?.docs.reduce(
                                        (accumulator, currentValue) => accumulator + (currentValue?.expense ?? 0),
                                        0
                                    );

                                    if (totalIncome > 0) data = totalIncome;
                                } catch {}

                                return data;
                            },
                        ],
                    },
                },
                {
                    type: 'text',
                    name: 'totalExpenseCurrency',
                    admin: {
                        readOnly: true,
                        style: {
                            '--theme-elevation-400': CASH_FLOW_DEFICIT_COLOR,
                        } as React.CSSProperties,
                    },
                    hooks: {
                        beforeChange: [
                            ({ siblingData }) => {
                                return convertIntToCurrency(siblingData?.totalExpense);
                            },
                        ],
                    },
                },
                {
                    type: 'number',
                    name: 'profit',
                    admin: {
                        readOnly: true,
                        hidden: true,
                        className: 'field-type--profit',
                    },
                    hooks: {
                        beforeChange: [
                            ({ siblingData }) => {
                                let data = 0;

                                if (siblingData?.totalIncome && siblingData?.totalExpense) {
                                    data = siblingData.totalIncome - siblingData.totalExpense;
                                }

                                return data;
                            },
                        ],
                    },
                },
                {
                    type: 'text',
                    name: 'profitCurrency',
                    admin: {
                        readOnly: true,
                        className: 'field-type--profit',
                    },
                    hooks: {
                        afterRead: [
                            ({ siblingData }) => {
                                return convertIntToCurrency(siblingData?.profit);
                            },
                        ],
                        beforeChange: [
                            ({ siblingData }) => {
                                return convertIntToCurrency(siblingData?.profit);
                            },
                        ],
                    },
                },
            ],
            slug: {
                beforeChange: ({ siblingData }) => {
                    let data = '';

                    let date = siblingData?.date ?? '';
                    let time = siblingData?.time ?? '';

                    if (date) {
                        const formatter = new Intl.DateTimeFormat('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        });

                        data = formatter.format(new Date(date));
                    }

                    if (time) {
                        const formatter = new Intl.DateTimeFormat('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false, // Use 24-hour clock
                        });

                        data += formatter.format(new Date(time)).replace(/:/g, '');
                    }

                    return data;
                },
            },
        },
        tabs: [
            {
                label: 'Detail',
                fields: [
                    {
                        type: 'row',
                        fields: [
                            {
                                type: 'date',
                                name: 'date',
                                label: 'Event Date',
                                admin: {
                                    width: '30%',
                                    date: {
                                        pickerAppearance: 'dayOnly',
                                        displayFormat: CASH_FLOW_DISPLAY_FORMAT,
                                    },
                                },
                            },
                            {
                                type: 'date',
                                name: 'time',
                                label: 'Event Time',
                                admin: {
                                    width: '30%',
                                    date: {
                                        pickerAppearance: 'timeOnly',
                                    },
                                },
                            },
                        ],
                    },
                    {
                        type: 'textarea',
                        name: 'address',
                    },
                    {
                        type: 'text',
                        name: 'addressUrl',
                    },
                    {
                        type: 'text',
                        name: 'eventUrl',
                    },
                ],
            },
            {
                label: 'Incomes',
                fields: [
                    {
                        type: 'join',
                        name: 'incomes',
                        label: false,
                        collection: 'incomes',
                        on: 'event',
                        orderable: true,
                        admin: {
                            defaultColumns: ['incomeType', 'date', 'title', 'incomeCurrency'],
                        },
                    },
                ],
            },
            {
                label: 'Expenses',
                fields: [
                    {
                        type: 'join',
                        name: 'expenses',
                        label: false,
                        collection: 'expenses',
                        on: 'event',
                        orderable: true,
                        admin: {
                            defaultColumns: ['expenseType', 'date', 'title', 'expenseCurrency'],
                        },
                    },
                ],
            },
        ],
    }),
};
